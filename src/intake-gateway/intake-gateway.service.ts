import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaimantEntity } from '../entities/claimant/claimant.entity';
import { IntakeSubmissionEntity } from '../entities/intake-submission/intake-submission.entity';
import { hmac } from '../shared/crypto';
import { PublicIntakeDto } from './dto/public-intake.dto';

@Injectable()
export class IntakeGatewayService {
  constructor(
    @InjectRepository(ClaimantEntity)
    private readonly claimantRepo: Repository<ClaimantEntity>,
    @InjectRepository(IntakeSubmissionEntity)
    private readonly submissionRepo: Repository<IntakeSubmissionEntity>,
  ) {}

  async submit(dto: PublicIntakeDto): Promise<{ submission_id: string; status: string; message: string }> {
    const email_hash = hmac(dto.email.toLowerCase());
    const phone_hash = dto.phone ? hmac(dto.phone) : null;

    // De-duplicate by email_hash
    let claimant = await this.claimantRepo.findOne({ where: { email_hash } });

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

    return {
      submission_id: submission.id,
      status: 'received',
      message: 'Your submission has been received and will be reviewed by our team.',
    };
  }
}
