import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { DocumentEntity } from '../entities/document/document.entity';
import { hmac } from '../shared/crypto';
import { PublicIntakeDto } from './dto/public-intake.dto';
import { FraudAnalysisService } from '../fraud-analysis/fraud-analysis.service';
import { IntegrationsService } from '../integrations/integrations.service';

@Injectable()
export class IntakeGatewayService {
  constructor(
    @InjectRepository(ClaimantEntity)
    private readonly claimantRepo: Repository<ClaimantEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
    private readonly fraudAnalysisService: FraudAnalysisService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async submit(
    dto: PublicIntakeDto,
  ): Promise<{ submission_id: string; status: string; message: string }> {
    const email_hash = hmac(dto.email.toLowerCase());
    const phone_hash = dto.phone ? hmac(dto.phone) : null;

    // De-duplicate by email_hash
    let claimant = await this.claimantRepo.findOne({ where: { email_hash } });
    const isRepeat = !!claimant;

    if (!claimant) {
      claimant = this.claimantRepo.create({
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        date_of_birth: dto.date_of_birth,
        intake_channel: dto.intake_channel ?? 'web_form',
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_version: dto.consent_version,
        email_hash,
        phone_hash: phone_hash ?? undefined,
      });
      await this.claimantRepo.save(claimant);
    } else {
      // Update consent on the existing record
      claimant.consent_given = true;
      claimant.consent_timestamp = new Date().toISOString();
      claimant.consent_version = dto.consent_version;
      await this.claimantRepo.save(claimant);
    }

    const { consent_given, consent_version, ...payloadFields } = dto;
    const submission = this.submissionRepo.create({
      claimant_id: claimant.id,
      tort_campaign_id: dto.tort_campaign_id,
      intake_channel: dto.intake_channel ?? 'web_form',
      raw_payload: payloadFields,
      status: 'pending_review',
      submitted_date: new Date().toISOString(),
    });
    await this.submissionRepo.save(submission);

    this.fraudAnalysisService
      .analyze(submission, claimant, isRepeat)
      .catch((err) => console.error('[FraudAnalysis] Failed:', err));

    if (dto.conversation && dto.conversation.length > 0) {
      this.analyzeConversation(submission.id, dto.conversation).catch((err) =>
        console.error('[ConversationAnalysis] Failed:', err),
      );
    }

    return {
      submission_id: submission.id,
      status: 'received',
      message:
        'Your submission has been received and will be reviewed by our team.',
    };
  }

  async updateConversation(
    submissionId: string,
    userId: string,
    userEmail: string,
    conversation: Array<{ role: string; content: string }>,
  ): Promise<{ ok: boolean }> {
    const claimant = await this.resolveClaimant(userId, userEmail);

    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission || submission.claimant_id !== claimant.id) {
      throw new Error('Submission not found or access denied');
    }

    const updatedPayload = { ...(submission.raw_payload ?? {}), conversation };
    await this.submissionRepo.update(submissionId, {
      raw_payload: updatedPayload,
    });

    // Re-analyze the enriched conversation in the background
    this.analyzeConversation(submissionId, conversation).catch((err) =>
      console.error('[ConversationAnalysis] Failed:', err),
    );

    return { ok: true };
  }

  async uploadDocument(
    submissionId: string,
    userId: string,
    userEmail: string,
    file: Express.Multer.File,
    documentType: string,
  ): Promise<DocumentEntity> {
    const claimant = await this.resolveClaimant(userId, userEmail);
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission || submission.claimant_id !== claimant.id) {
      throw new Error('Submission not found or access denied');
    }

    const fileUrl = `/uploads/${file.filename}`;
    const doc = this.documentRepo.create({
      intake_submission_id: submissionId,
      title: file.originalname,
      document_type: documentType || 'other',
      file_url: fileUrl,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
    });
    return this.documentRepo.save(doc);
  }

  async getDocumentsForSubmission(
    submissionId: string,
    userId: string,
    userEmail: string,
  ): Promise<DocumentEntity[]> {
    const claimant = await this.resolveClaimant(userId, userEmail);
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });
    if (!submission || submission.claimant_id !== claimant.id) {
      throw new Error('Submission not found or access denied');
    }
    return this.documentRepo.find({
      where: { intake_submission_id: submissionId },
    });
  }

  private async resolveClaimant(
    userId: string,
    userEmail: string,
  ): Promise<ClaimantEntity> {
    let claimant = await this.claimantRepo.findOne({
      where: { user_id: userId },
    });
    if (!claimant) {
      const emailHash = hmac(userEmail.toLowerCase());
      claimant = await this.claimantRepo.findOne({
        where: { email_hash: emailHash },
      });
      if (claimant)
        await this.claimantRepo.update(claimant.id, { user_id: userId });
    }
    if (!claimant) throw new Error('Claimant not found for this user');
    return claimant;
  }

  private async analyzeConversation(
    submissionId: string,
    conversation: Array<{ role: string; content: string }>,
  ): Promise<void> {
    const prompt = `Analyze this legal intake conversation and extract structured information.

Conversation:
${conversation.map((m) => `${m.role === 'user' ? 'Claimant' : 'Assistant'}: ${m.content}`).join('\n')}`;

    const schema = {
      type: 'object',
      properties: {
        ai_chat_summary: { type: 'string' },
        key_facts: { type: 'array', items: { type: 'string' } },
        qualification_score: { type: 'number' },
        case_type: { type: 'string' },
      },
    };

    const result = (await this.integrationsService.invokeLLM(
      prompt,
      schema,
    )) as {
      ai_chat_summary: string;
      key_facts: string[];
      qualification_score: number;
      case_type: string;
    };

    await this.submissionRepo.update(submissionId, {
      ai_chat_summary: result.ai_chat_summary,
      key_facts: result.key_facts,
      qualification_score: result.qualification_score,
      case_type: result.case_type,
    });
  }
}
