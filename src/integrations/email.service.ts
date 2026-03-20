import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sgMail = require('@sendgrid/mail');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly frontendUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('SENDGRID_API_KEY');
    this.fromEmail = config.get<string>('SENDGRID_FROM_EMAIL') ?? '';
    this.fromName = config.get<string>('SENDGRID_FROM_NAME') ?? 'Case Builder';
    this.frontendUrl = (config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').replace(/\/$/, '');
    this.enabled = !!apiKey;
    if (apiKey) sgMail.setApiKey(apiKey);
  }

  async send(opts: {
    to: string;
    toName?: string;
    subject: string;
    text: string;
    recipientType?: 'claimant' | 'staff';
    caseId?: string;
  }): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('SendGrid not configured — email not sent');
      return;
    }

    const html = this.buildHtml(opts);

    await sgMail.send({
      to: { email: opts.to, name: opts.toName },
      from: { email: this.fromEmail, name: this.fromName },
      subject: opts.subject,
      text: opts.text,
      html,
    });

    this.logger.log(`Email sent to ${opts.to}: ${opts.subject}`);
  }

  private buildHtml(opts: {
    toName?: string;
    text: string;
    recipientType?: 'claimant' | 'staff';
    caseId?: string;
  }): string {
    const greeting = opts.toName ? `Dear ${opts.toName.split(' ')[0]},` : 'Hello,';

    const ctaHtml = this.buildCta(opts.recipientType, opts.caseId);

    const bodyLines = opts.text
      .split('\n')
      .map(line => line.trim() ? `<p style="margin:0 0 14px 0;color:#374151;line-height:1.65;">${line}</p>` : '')
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Case Builder</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-flex;align-items:center;gap:12px;">
                      <div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:8px;display:inline-block;"></div>
                      <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.05em;vertical-align:middle;margin-left:10px;">CASE BUILDER</span>
                    </div>
                    <p style="margin:6px 0 0 0;color:#94a3b8;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Legal Intelligence Platform</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px 40px;">
              <p style="margin:0 0 20px 0;color:#0f172a;font-size:16px;font-weight:600;">${greeting}</p>
              ${bodyLines}
              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:24px 40px;">
              <p style="margin:0 0 6px 0;color:#64748b;font-size:12px;">This message was sent via Case Builder on behalf of your legal team.</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">Please do not reply directly to this email. Contact your legal team through the portal or by phone.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildCta(recipientType?: 'claimant' | 'staff', caseId?: string): string {
    let href: string;
    let label: string;

    if (recipientType === 'claimant') {
      href = `${this.frontendUrl}/ClaimantPortal`;
      label = 'View Your Case Portal';
    } else if (caseId) {
      href = `${this.frontendUrl}/CaseDetail?id=${caseId}`;
      label = 'View Case';
    } else {
      return '';
    }

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td>
            <a href="${href}"
               style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
              ${label} →
            </a>
          </td>
        </tr>
      </table>`;
  }
}
