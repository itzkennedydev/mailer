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
/**
 * Initialize the mailer with Gmail OAuth2 credentials.
 * Call this once at app startup.
 */
export declare function initMailer(config: MailerConfig): void;
/**
 * Initialize mailer from environment variables.
 * Expects: GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 * Optional: MAILER_FROM, MAILER_REPLY_TO
 */
export declare function initMailerFromEnv(): void;
/**
 * Send an email using the configured Gmail OAuth2 transport.
 */
export declare function sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
/**
 * Convenience: send email and throw on failure.
 */
export declare function sendEmailOrThrow(options: SendEmailOptions): Promise<string>;
