import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailerConfig {
  gmail: {
    user: string;
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  defaults?: {
    from?: string;
    replyTo?: string;
  };
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: unknown;
}

let transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
let defaultConfig: NonNullable<MailerConfig['defaults']> = {};

/**
 * Initialize the mailer with Gmail OAuth2 credentials.
 * Call this once at app startup.
 */
export function initMailer(config: MailerConfig): void {
  const { gmail, defaults } = config;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: gmail.user,
      clientId: gmail.clientId,
      clientSecret: gmail.clientSecret,
      refreshToken: gmail.refreshToken,
    },
  });

  defaultConfig = defaults ?? {};
}

/**
 * Initialize mailer from environment variables.
 * Expects: GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 * Optional: MAILER_FROM, MAILER_REPLY_TO
 */
export function initMailerFromEnv(): void {
  const user = process.env.GMAIL_USER;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!user || !clientId || !clientSecret || !refreshToken) {
    console.warn('[Mailer] Gmail OAuth2 credentials not configured. Emails will be logged only.');
    return;
  }

  initMailer({
    gmail: { user, clientId, clientSecret, refreshToken },
    defaults: {
      from: process.env.MAILER_FROM,
      replyTo: process.env.MAILER_REPLY_TO,
    },
  });
}

/**
 * Send an email using the configured Gmail OAuth2 transport.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from, replyTo, attachments } = options;

  const toAddresses = Array.isArray(to) ? to : [to];
  const fromAddress = from ?? defaultConfig.from ?? `Mailer <${process.env.GMAIL_USER}>`;
  const replyToAddress = replyTo ?? defaultConfig.replyTo;

  if (!transporter) {
    console.log(`[Mailer] (no transport) Would send to ${toAddresses.join(', ')}: ${subject}`);
    return { success: true, messageId: 'dry-run' };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toAddresses.join(', '),
      subject,
      html,
      ...(text ? { text } : {}),
      ...(replyToAddress ? { replyTo: replyToAddress } : {}),
      ...(attachments ? {
        attachments: attachments.map(a => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
      } : {}),
    });

    console.log(`[Mailer] Sent to ${toAddresses.join(', ')}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Convenience: send email and throw on failure.
 */
export async function sendEmailOrThrow(options: SendEmailOptions): Promise<string> {
  const result = await sendEmail(options);
  if (!result.success) {
    throw new Error(`Failed to send email: ${JSON.stringify(result.error)}`);
  }
  return result.messageId ?? '';
}
