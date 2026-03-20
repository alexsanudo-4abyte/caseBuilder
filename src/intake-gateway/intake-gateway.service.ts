import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { DocumentEntity } from '../entities/document/document.entity';
import { TortCampaignEntity } from '../entities/tort-campaign/tort-campaign.entity';
import { hmac } from '../shared/crypto';
import { PublicIntakeDto } from './dto/public-intake.dto';
import { FraudAnalysisService } from '../fraud-analysis/fraud-analysis.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class IntakeGatewayService {
  constructor(
    @InjectRepository(ClaimantEntity)
    private readonly claimantRepo: Repository<ClaimantEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepo: Repository<DocumentEntity>,
    @InjectRepository(TortCampaignEntity)
    private readonly campaignRepo: Repository<TortCampaignEntity>,
    private readonly fraudAnalysisService: FraudAnalysisService,
    private readonly integrationsService: IntegrationsService,
    private readonly notificationService: NotificationService,
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

    this.notificationService
      .create({
        type: 'new_submission',
        message: `New intake submission from ${dto.full_name}`,
        submission_id: submission.id,
        claimant_name: dto.full_name,
      })
      .catch(() => {});

    if (dto.conversation && dto.conversation.length > 0) {
      this.analyzeConversation(submission, dto.conversation).catch((err) =>
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
    this.analyzeConversation(submission, conversation).catch((err) =>
      console.error('[ConversationAnalysis] Failed:', err),
    );

    const claimantName = (submission.raw_payload as Record<string, string>)?.full_name ?? userEmail;
    this.notificationService
      .create({
        type: 'conversation_updated',
        message: `${claimantName} added new information to their intake`,
        submission_id: submissionId,
        claimant_name: claimantName,
      })
      .catch(() => {});

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
    const savedDoc = await this.documentRepo.save(doc);

    const claimantName = (submission.raw_payload as Record<string, string>)?.full_name ?? userEmail;
    this.notificationService
      .create({
        type: 'document_uploaded',
        message: `${claimantName} uploaded a document: ${file.originalname}`,
        submission_id: submissionId,
        claimant_name: claimantName,
      })
      .catch(() => {});

    return savedDoc;
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
    submission: IntakeSubmissionEntity,
    conversation: Array<{ role: string; content: string }>,
  ): Promise<void> {
    const payload = (submission.raw_payload ?? {}) as Record<string, unknown>;

    // Load campaign qualifying criteria if available
    let campaignContext = 'No specific campaign criteria provided.';
    if (submission.tort_campaign_id) {
      const campaign = await this.campaignRepo.findOne({
        where: { id: submission.tort_campaign_id },
      });
      if (campaign) {
        const parts: string[] = [`Campaign: ${campaign.name}`];
        if (campaign.qualifying_criteria)
          parts.push(`Qualifying criteria: ${campaign.qualifying_criteria}`);
        if (campaign.statute_of_limitations_info)
          parts.push(
            `Statute of limitations: ${campaign.statute_of_limitations_info}`,
          );
        if (campaign.defendants?.length)
          parts.push(`Defendants: ${campaign.defendants.join(', ')}`);
        campaignContext = parts.join('\n');
      }
    }

    const transcript = conversation
      .map((m) => `${m.role === 'user' ? 'Claimant' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a legal intake analyst at a mass tort litigation firm. Analyze this claimant intake conversation and produce a structured evaluation.

## Campaign Context
${campaignContext}

## Claimant Background
Name: ${(payload.full_name as string) ?? 'unknown'}
Date of birth: ${(payload.date_of_birth as string) ?? 'not provided'}
Address: ${(payload.address as string) ?? 'not provided'}

## Intake Conversation
${transcript}

---

## Your Tasks

### 1. Qualification Score (0–100)
Score how well this claimant matches the campaign's qualifying criteria. Use the rubric below:

**Automatic disqualifiers (score ≤ 10):**
- Claimant explicitly states they were not exposed to the defendant's product or event
- Injury date is outside the statute of limitations and no tolling argument is apparent
- Claimant clearly has no compensable injury

**Strong signals that raise the score:**
- Confirmed exposure to the defendant's product, drug, or event (+20)
- Specific, credible injury description that matches qualifying criteria (+20)
- Medical treatment sought and documented (+15)
- Injury/exposure timeline is plausible and within limitations period (+15)
- Multiple corroborating details (witnesses, records, receipts) (+10)
- Claimant is articulate and consistent throughout (+5)
- Injury severity is significant (hospitalization, surgery, permanent damage) (+10)
- Financial or employment impact described (+5)

**Signals that lower the score:**
- Vague or inconsistent injury description (-10 to -20)
- No medical treatment sought (-10)
- Exposure to defendant's product unconfirmed or uncertain (-15)
- Timeline is unclear or potentially outside limitations (-10)
- Claimant unsure whether injuries are related to the campaign (-10)

### 2. Key Facts
Extract 3–7 concrete facts from the conversation that an attorney would need to evaluate the case (e.g. product used, injury date, diagnosis, treatment received, employment impact).

### 3. Case Type
Identify the most specific case type (e.g. "pharmaceutical injury", "defective medical device", "environmental exposure", "product liability", "negligence").

### 4. Summary
Write a 2–3 sentence attorney-facing summary of this claimant's situation, injury, and overall case strength.`;

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

    await this.submissionRepo.update(submission.id, {
      ai_chat_summary: result.ai_chat_summary,
      key_facts: result.key_facts,
      qualification_score: result.qualification_score,
      case_type: result.case_type,
    });
  }
}
