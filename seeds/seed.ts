import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../src/config/typeorm.config';
import { UserEntity } from '../src/users/user.entity';
import { ClaimantEntity } from '../src/entities/claimant/claimant.entity';
import { CaseEntity } from '../src/entities/case/case.entity';
import { TaskEntity } from '../src/entities/task/task.entity';
import { FraudAlertEntity } from '../src/entities/fraud-alert/fraud-alert.entity';
import { DocumentEntity } from '../src/entities/document/document.entity';
import { MedicalRecordEntity } from '../src/entities/medical-record/medical-record.entity';
import { TortCampaignEntity } from '../src/entities/tort-campaign/tort-campaign.entity';
import { CommunicationEntity } from '../src/entities/communication/communication.entity';
import { FinancialRecordEntity } from '../src/entities/financial-record/financial-record.entity';
import { PredictionEntity } from '../src/entities/prediction/prediction.entity';
import { IntakeSubmissionEntity } from '../src/entities/intake-submission/intake-submission.entity';

async function seed() {
  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();
  console.log('Connected to database');

  // Clear tables in dependency order
  await ds.query('TRUNCATE TABLE predictions, communications, financial_records, intake_submissions, fraud_alerts, medical_records, documents, tasks, cases, claimants, tort_campaigns, users RESTART IDENTITY CASCADE');
  console.log('Cleared existing data');

  // ─── Users ───────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await ds.getRepository(UserEntity).save({
    full_name: 'Sarah Mitchell',
    email: 'admin@casebuilder.com',
    password: passwordHash,
    role: 'admin',
  });
  const attorney = await ds.getRepository(UserEntity).save({
    full_name: 'James Rodriguez',
    email: 'jrodriguez@casebuilder.com',
    password: passwordHash,
    role: 'attorney',
  });

  // ─── Tort Campaigns ───────────────────────────────────────────────────────
  const campaign1 = await ds.getRepository(TortCampaignEntity).save({
    name: 'Roundup Herbicide MDL',
    status: 'active',
    description: 'Glyphosate-based herbicide linked to non-Hodgkin lymphoma (NHL) diagnoses.',
    defendants: ['Bayer AG', 'Monsanto Company'],
    statute_of_limitations_info: 'Generally 2-3 years from diagnosis, varies by state.',
    mdl_info: 'MDL No. 2741, Northern District of California. Over 100,000 cases filed.',
    estimated_avg_settlement: 160000,
    qualifying_criteria: 'NHL diagnosis after 2+ years of Roundup exposure; no prior NHL history.',
  });

  const campaign2 = await ds.getRepository(TortCampaignEntity).save({
    name: '3M Combat Arms Earplugs',
    status: 'active',
    description: 'Defective dual-ended combat earplugs issued to U.S. military personnel causing hearing loss.',
    defendants: ['3M Company', 'Aearo Technologies'],
    statute_of_limitations_info: '2 years from discovery, varies by jurisdiction.',
    mdl_info: 'MDL No. 2885, Northern District of Florida. Largest MDL in U.S. history.',
    estimated_avg_settlement: 45000,
    qualifying_criteria: 'Active duty military 2003-2015; documented hearing loss or tinnitus.',
  });

  // ─── Claimants ────────────────────────────────────────────────────────────
  const claimant1 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Maria Gonzalez',
    email: 'mgonzalez@email.com',
    phone: '(713) 555-2341',
    address: '456 Oak Ave, Houston, TX 77002',
    date_of_birth: '1968-03-12',
    intake_channel: 'tv_ad',
    consent_given: true,
    consent_timestamp: '2024-01-10T10:00:00Z',
    consent_version: 'v1.0',
  });

  const claimant2 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Robert Chen',
    email: 'rchen@email.com',
    phone: '(404) 555-8823',
    address: '1209 Peachtree St NE, Atlanta, GA 30309',
    date_of_birth: '1975-09-22',
    intake_channel: 'referral',
    consent_given: true,
    consent_timestamp: '2024-02-05T09:30:00Z',
    consent_version: 'v1.0',
  });

  const claimant3 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Linda Thompson',
    email: 'lthompson@email.com',
    phone: '(312) 555-4490',
    address: '800 N Michigan Ave, Chicago, IL 60611',
    date_of_birth: '1962-06-18',
    intake_channel: 'web_form',
    consent_given: true,
    consent_timestamp: '2024-03-01T14:15:00Z',
    consent_version: 'v1.0',
  });

  const claimant4 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'David Park',
    email: 'dpark@email.com',
    phone: '(206) 555-7712',
    address: '500 Pike St, Seattle, WA 98101',
    date_of_birth: '1980-12-03',
    intake_channel: 'referral',
    consent_given: true,
    consent_timestamp: '2023-11-15T11:00:00Z',
    consent_version: 'v1.0',
  });

  const claimant5 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Jennifer Walsh',
    email: 'jwalsh@email.com',
    phone: '(617) 555-3356',
    address: '100 Tremont St, Boston, MA 02108',
    date_of_birth: '1955-04-07',
    intake_channel: 'tv_ad',
    consent_given: true,
    consent_timestamp: '2023-06-01T08:45:00Z',
    consent_version: 'v1.0',
  });

  // ─── Cases ────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];

  const case1 = await ds.getRepository(CaseEntity).save({
    claimant_id: claimant1.id,
    tort_campaign_id: campaign1.id,
    case_number: 'CB-2024-0001',
    case_type: 'mass_tort',
    status: 'active',
    priority: 'high',
    notes: 'Strong case. Claimant has 8 years of documented Roundup exposure on family farm. NHL diagnosed April 2022.',
    injury_description: 'Diffuse large B-cell lymphoma (DLBCL) — a type of non-Hodgkin lymphoma diagnosed April 2022 after 8 years of regular Roundup use.',
    injury_date: '2022-04-15',
    intake_source: 'tv_ad',
    intake_date: '2024-01-10',
    assigned_attorney: 'James Rodriguez',
    estimated_value_low: 120000,
    estimated_value_high: 220000,
    case_strength_score: 82,
    credibility_score: 88,
    settlement_probability: 75,
    fraud_score: 8,
    ai_case_summary: 'Strong qualifying mass tort case. Claimant has well-documented 8-year Roundup exposure history with clear NHL diagnosis. Medical records confirm DLBCL. No prior NHL history. Statute of limitations not an issue.',
    ai_risk_factors: ['Single medical provider on record', 'No purchase receipts for Roundup'],
    ai_strength_factors: ['Documented farm exposure history', 'Qualifying NHL subtype (DLBCL)', 'No prior lymphoma history', 'Clear causation timeline'],
    qualifying_criteria_met: true,
  });

  const case2 = await ds.getRepository(CaseEntity).save({
    claimant_id: claimant2.id,
    tort_campaign_id: campaign2.id,
    case_number: 'CB-2024-0002',
    case_type: 'mass_tort',
    status: 'active',
    priority: 'medium',
    notes: 'Army veteran, served 2004-2012. Has documented 45dB hearing loss in left ear and chronic tinnitus.',
    injury_description: 'Bilateral sensorineural hearing loss (45dB left, 30dB right) and chronic tinnitus following military service using 3M Combat Arms earplugs.',
    injury_date: '2012-08-01',
    intake_source: 'referral',
    intake_date: '2024-02-05',
    assigned_attorney: 'James Rodriguez',
    estimated_value_low: 30000,
    estimated_value_high: 65000,
    case_strength_score: 71,
    credibility_score: 79,
    settlement_probability: 68,
    fraud_score: 15,
    ai_case_summary: 'Qualifying 3M earplug case. Veteran has documented hearing loss and tinnitus consistent with defective earplug use during active duty. Service records and VA audiogram support the claim.',
    ai_risk_factors: ['VA claim not yet filed', 'Delay between discharge and complaint filing'],
    ai_strength_factors: ['Service records confirm earplug issue dates', 'VA audiogram on file', 'Bilateral hearing loss documented'],
    qualifying_criteria_met: true,
  });

  const case3 = await ds.getRepository(CaseEntity).save({
    claimant_id: claimant3.id,
    tort_campaign_id: campaign1.id,
    case_number: 'CB-2024-0003',
    case_type: 'mass_tort',
    status: 'intake',
    priority: 'medium',
    notes: 'Recent intake. Claims 15-year Roundup exposure as landscaper. Awaiting medical records.',
    injury_description: 'Follicular lymphoma diagnosed January 2024 after 15 years of occupational Roundup exposure as a professional landscaper.',
    injury_date: '2024-01-20',
    intake_source: 'web',
    intake_date: '2024-03-01',
    assigned_attorney: 'Sarah Mitchell',
    estimated_value_low: 90000,
    estimated_value_high: 160000,
    case_strength_score: 65,
    credibility_score: 72,
    settlement_probability: 58,
    fraud_score: 22,
    ai_case_summary: 'Potentially qualifying case pending medical record review. Occupational exposure as landscaper is well-documented type. Follicular lymphoma is a qualifying NHL subtype. Recent diagnosis — statute of limitations not at risk.',
    ai_risk_factors: ['Medical records not yet received', 'Employer records may be difficult to obtain', 'Moderate fraud score warrants review'],
    ai_strength_factors: ['Long occupational exposure history', 'Qualifying NHL subtype', 'Recent diagnosis strengthens timeliness'],
    qualifying_criteria_met: false,
  });

  const case4 = await ds.getRepository(CaseEntity).save({
    claimant_id: claimant4.id,
    tort_campaign_id: campaign2.id,
    case_number: 'CB-2024-0004',
    case_type: 'mass_tort',
    status: 'settlement',
    priority: 'low',
    notes: 'In active settlement negotiations. $52,000 offer on the table.',
    injury_description: 'Moderate sensorineural hearing loss (35dB right ear) and intermittent tinnitus. Marine Corps veteran, 2005-2009.',
    injury_date: '2009-06-15',
    intake_source: 'referral',
    intake_date: '2023-11-15',
    assigned_attorney: 'James Rodriguez',
    estimated_value_low: 35000,
    estimated_value_high: 60000,
    case_strength_score: 68,
    credibility_score: 74,
    settlement_probability: 88,
    fraud_score: 10,
    ai_case_summary: 'Case in settlement phase. Current $52,000 offer is within estimated range. Claimant eager to settle. Recommend accepting or countering at $55,000.',
    ai_risk_factors: ['Unilateral hearing loss only', 'Lower-end settlement offer'],
    ai_strength_factors: ['Clear service records', 'Audiogram supports claim', 'High settlement probability'],
    qualifying_criteria_met: true,
  });

  const case5 = await ds.getRepository(CaseEntity).save({
    claimant_id: claimant5.id,
    tort_campaign_id: campaign1.id,
    case_number: 'CB-2024-0005',
    case_type: 'mass_tort',
    status: 'closed',
    priority: 'low',
    notes: 'Case closed. $145,000 settlement reached and disbursed.',
    injury_description: 'Mantle cell lymphoma diagnosed 2020 after 10 years of Roundup use in home garden.',
    injury_date: '2020-05-10',
    intake_source: 'tv_ad',
    intake_date: '2023-06-01',
    assigned_attorney: 'Sarah Mitchell',
    estimated_value_low: 100000,
    estimated_value_high: 180000,
    case_strength_score: 76,
    credibility_score: 82,
    settlement_probability: 95,
    fraud_score: 5,
    ai_case_summary: 'Case successfully closed. Settlement of $145,000 achieved, within estimated range. Strong case supported by clear diagnosis and exposure history.',
    ai_risk_factors: [],
    ai_strength_factors: ['Qualifying NHL subtype', 'Clear exposure history', 'Strong medical documentation'],
    qualifying_criteria_met: true,
  });

  const cases = [case1, case2, case3, case4, case5];

  // ─── Tasks ────────────────────────────────────────────────────────────────
  for (const c of cases) {
    await ds.getRepository(TaskEntity).save([
      {
        case_id: c.id,
        title: 'Request medical records from treating physician',
        task_type: 'medical_records',
        status: c.status === 'closed' ? 'completed' : 'pending',
        priority: 'high',
      },
      {
        case_id: c.id,
        title: 'Schedule client intake call',
        task_type: 'client_contact',
        status: c.status === 'intake' ? 'in_progress' : 'completed',
        priority: 'medium',
      },
    ]);
  }

  // ─── Fraud Alerts ─────────────────────────────────────────────────────────
  await ds.getRepository(FraudAlertEntity).save([
    {
      case_id: case3.id,
      alert_type: 'inconsistent_timeline',
      severity: 'medium',
      description: 'Claimant\'s reported exposure start date conflicts with employment records by 18 months.',
      evidence: 'LinkedIn profile shows landscaping start date as 2011, but claimant states 2009.',
      ai_confidence: 72,
      detection_method: 'ai_document_analysis',
      status: 'open',
    },
    {
      case_id: case2.id,
      alert_type: 'prior_claim',
      severity: 'low',
      description: 'Claimant filed a prior VA disability claim for hearing loss in 2015.',
      evidence: 'VA records show prior 10% disability rating for hearing loss.',
      ai_confidence: 85,
      detection_method: 'public_records_check',
      status: 'reviewed',
      resolution_notes: 'Prior VA claim is consistent with and supports this claim. Not fraudulent.',
      reviewed_date: today,
    },
  ]);

  // ─── Documents ────────────────────────────────────────────────────────────
  for (const c of cases) {
    await ds.getRepository(DocumentEntity).save({
      case_id: c.id,
      title: 'Signed Retainer Agreement',
      document_type: 'retainer',
      file_url: `/documents/${c.case_number}/retainer.pdf`,
      uploaded_at: today,
    });
  }

  // ─── Medical Records ──────────────────────────────────────────────────────
  await ds.getRepository(MedicalRecordEntity).save([
    {
      case_id: case1.id,
      provider_name: 'MD Anderson Cancer Center',
      provider_type: 'oncology',
      provider_address: '1515 Holcombe Blvd, Houston, TX 77030',
      provider_phone: '(713) 792-2121',
      request_status: 'received',
      request_date: '2024-01-15',
      records_start_date: '2022-01-01',
      records_end_date: today,
      severity_score: 85,
      qualifying_diagnosis_found: true,
      ai_analysis_status: 'complete',
      ai_medical_summary: 'Records confirm DLBCL diagnosis in April 2022. Treatment included R-CHOP chemotherapy x6 cycles. Currently in remission. Strong causal link to glyphosate exposure documented.',
      diagnoses_extracted: ['Diffuse Large B-Cell Lymphoma (DLBCL)', 'Non-Hodgkin Lymphoma'],
      procedures_extracted: ['R-CHOP Chemotherapy (6 cycles)', 'PET Scan x4', 'Bone Marrow Biopsy'],
      medications_extracted: ['Rituximab', 'Cyclophosphamide', 'Doxorubicin', 'Vincristine', 'Prednisone'],
      ai_timeline: [
        { date: '2022-03-10', event: 'Initial oncology consultation' },
        { date: '2022-04-15', event: 'DLBCL diagnosis confirmed via biopsy' },
        { date: '2022-05-01', event: 'R-CHOP chemotherapy initiated' },
        { date: '2022-11-15', event: 'Treatment completed, remission confirmed' },
      ],
    },
    {
      case_id: case2.id,
      provider_name: 'Atlanta VA Medical Center',
      provider_type: 'audiology',
      provider_address: '1670 Clairmont Rd, Decatur, GA 30033',
      provider_phone: '(404) 321-6111',
      request_status: 'received',
      request_date: '2024-02-10',
      records_start_date: '2012-01-01',
      records_end_date: today,
      severity_score: 65,
      qualifying_diagnosis_found: true,
      ai_analysis_status: 'complete',
      ai_medical_summary: 'VA audiogram confirms bilateral sensorineural hearing loss. Left ear: 45dB loss, Right ear: 30dB loss. Chronic tinnitus documented. Audiologist notes consistent with noise-induced hearing loss from occupational exposure.',
      diagnoses_extracted: ['Bilateral Sensorineural Hearing Loss', 'Chronic Tinnitus'],
      procedures_extracted: ['Pure Tone Audiometry', 'Speech Recognition Testing', 'Tympanometry'],
      medications_extracted: [],
      ai_timeline: [
        { date: '2012-08-20', event: 'Initial hearing evaluation post-discharge' },
        { date: '2013-03-15', event: 'VA hearing loss disability rating: 10%' },
        { date: '2023-01-10', event: 'Updated audiogram confirms progressive loss' },
      ],
    },
    {
      case_id: case3.id,
      provider_name: 'Northwestern Memorial Hospital',
      provider_type: 'oncology',
      provider_address: '251 E Huron St, Chicago, IL 60611',
      provider_phone: '(312) 926-2000',
      request_status: 'pending',
      request_date: '2024-03-05',
      records_start_date: '2023-01-01',
      records_end_date: today,
      severity_score: 0,
      qualifying_diagnosis_found: false,
      ai_analysis_status: 'pending',
    },
  ]);

  // ─── Communications ───────────────────────────────────────────────────────
  await ds.getRepository(CommunicationEntity).save([
    {
      case_id: case1.id,
      channel: 'email',
      to_name: 'Maria Gonzalez',
      to_contact: 'mgonzalez@email.com',
      from_name: 'James Rodriguez',
      from_contact: 'jrodriguez@casebuilder.com',
      subject: 'Case Update - Medical Records Received',
      content: 'Dear Ms. Gonzalez, I am pleased to inform you that we have received and reviewed your medical records from MD Anderson. The records strongly support your case. We will be in touch shortly with next steps.',
      direction: 'outbound',
      communication_date: today,
      is_read: true,
      ai_sentiment: 'positive',
      ai_summary: 'Attorney notifying client of successful medical record receipt and positive case assessment.',
      ai_action_items: ['Schedule follow-up call', 'Prepare case summary for MDL filing'],
      requires_response: false,
    },
    {
      case_id: case4.id,
      channel: 'phone',
      to_name: 'Opposing Counsel',
      to_contact: '(212) 555-0100',
      from_name: 'James Rodriguez',
      from_contact: '(713) 555-9000',
      subject: 'Settlement Negotiation - Case CB-2024-0004',
      content: 'Called opposing counsel to discuss $52,000 settlement offer for David Park. Communicated that client is considering but expects $55,000. Follow-up call scheduled for next week.',
      direction: 'outbound',
      communication_date: today,
      is_read: true,
      ai_sentiment: 'neutral',
      ai_summary: 'Settlement negotiation call. Counter-offer of $55,000 communicated to opposing counsel.',
      ai_action_items: ['Follow up call next week', 'Discuss with client whether to accept $52k'],
      requires_response: true,
    },
    {
      case_id: case3.id,
      channel: 'email',
      to_name: 'James Rodriguez',
      to_contact: 'jrodriguez@casebuilder.com',
      from_name: 'Linda Thompson',
      from_contact: 'lthompson@email.com',
      subject: 'Question about my case status',
      content: 'Hi, I was wondering if you have received my medical records yet and what the next steps are for my case. I am anxious to know if I qualify.',
      direction: 'inbound',
      communication_date: today,
      is_read: false,
      ai_sentiment: 'anxious',
      ai_summary: 'Client inquiring about case status and medical record receipt.',
      ai_action_items: ['Reply to client', 'Check on medical record request status'],
      requires_response: true,
    },
  ]);

  // ─── Financial Records ────────────────────────────────────────────────────
  await ds.getRepository(FinancialRecordEntity).save([
    {
      case_id: case5.id,
      record_type: 'settlement',
      amount: 145000,
      category: 'settlement_disbursement',
      description: 'Final settlement amount for CB-2024-0005 (Jennifer Walsh)',
    },
    {
      case_id: case1.id,
      record_type: 'expense',
      amount: 2500,
      category: 'medical_records',
      description: 'Medical record retrieval fees — MD Anderson Cancer Center',
    },
    {
      case_id: case2.id,
      record_type: 'expense',
      amount: 850,
      category: 'expert_witness',
      description: 'Audiology expert consultation fee',
    },
  ]);

  // ─── Predictions ──────────────────────────────────────────────────────────
  await ds.getRepository(PredictionEntity).save([
    {
      case_id: case1.id,
      prediction_type: 'settlement_value',
      predicted_value: 172000,
      predicted_range_low: 120000,
      predicted_range_high: 220000,
      confidence_score: 78,
      explanation: 'Based on similar DLBCL cases in the Roundup MDL with comparable exposure history and treatment severity.',
      key_factors: ['DLBCL subtype (higher value)', 'Long exposure duration', 'Completed treatment', 'Strong medical documentation'],
      is_current: true,
      prediction_date: today,
      model_version: '1.0',
    },
    {
      case_id: case2.id,
      prediction_type: 'settlement_value',
      predicted_value: 48000,
      predicted_range_low: 30000,
      predicted_range_high: 65000,
      confidence_score: 71,
      explanation: 'Based on 3M earplug cases with bilateral hearing loss and prior VA disability documentation.',
      key_factors: ['Bilateral hearing loss', 'VA documentation available', 'Prior disability rating helps establish injury'],
      is_current: true,
      prediction_date: today,
      model_version: '1.0',
    },
  ]);

  // ─── Intake Submissions ───────────────────────────────────────────────────
  // Claimants for intake submissions (not yet converted to cases)
  const claimant6 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Marcus Johnson',
    email: 'mjohnson@email.com',
    phone: '(214) 555-6634',
    address: '3500 Commerce St, Dallas, TX 75226',
    date_of_birth: '1970-07-14',
    intake_channel: 'web_form',
    consent_given: true,
    consent_timestamp: `${today}T10:00:00Z`,
    consent_version: 'v1.0',
  });

  const claimant7 = await ds.getRepository(ClaimantEntity).save({
    full_name: 'Patricia Nguyen',
    email: 'pnguyen@email.com',
    phone: '(503) 555-2291',
    address: '1200 NW Couch St, Portland, OR 97209',
    date_of_birth: '1958-11-30',
    intake_channel: 'web_form',
    consent_given: true,
    consent_timestamp: `${today}T09:00:00Z`,
    consent_version: 'v1.0',
  });

  await ds.getRepository(IntakeSubmissionEntity).save([
    {
      claimant_id: claimant6.id,
      tort_campaign_id: campaign1.id,
      intake_channel: 'web_form',
      raw_payload: {
        full_name: 'Marcus Johnson',
        email: 'mjohnson@email.com',
        phone: '(214) 555-6634',
        address: '3500 Commerce St, Dallas, TX 75226',
        date_of_birth: '1970-07-14',
        injury_description: '6-year Roundup use on residential property, Burkitt lymphoma 2023',
        submitted_via: 'web_form_v2',
      },
      ai_chat_summary: 'Claimant reports 6-year Roundup use on residential property. Diagnosed with Burkitt lymphoma in 2023. Seeking legal representation.',
      key_facts: ['6 years Roundup use', 'Burkitt lymphoma diagnosis 2023', 'No prior legal claims'],
      qualification_score: 74,
      case_type: 'mass_tort',
      status: 'pending_review',
      submitted_date: today,
    },
    {
      claimant_id: claimant7.id,
      tort_campaign_id: campaign2.id,
      intake_channel: 'web_form',
      raw_payload: {
        full_name: 'Patricia Nguyen',
        email: 'pnguyen@email.com',
        phone: '(503) 555-2291',
        address: '1200 NW Couch St, Portland, OR 97209',
        date_of_birth: '1958-11-30',
        injury_description: 'Army veteran 2001-2007, bilateral tinnitus and moderate hearing loss 2022',
        submitted_via: 'web_form_v2',
      },
      ai_chat_summary: 'Army veteran 2001-2007, reports using 3M combat earplugs during service. Has bilateral tinnitus and moderate hearing loss diagnosed in 2022.',
      key_facts: ['Military service 2001-2007', 'Bilateral tinnitus', 'Moderate hearing loss 2022 diagnosis', 'No VA claim filed'],
      qualification_score: 69,
      case_type: 'mass_tort',
      status: 'approved',
      admin_notes: 'Good case. Recommend converting to full case file.',
      reviewed_by: 'Sarah Mitchell',
      reviewed_date: today,
      submitted_date: today,
    },
  ]);

  await ds.destroy();
  console.log('\n✅ Seed complete!');
  console.log('   Login: admin@casebuilder.com / password123');
  console.log('   Login: jrodriguez@casebuilder.com / password123');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
