# Mailer

Shared email service using Nodemailer with Gmail OAuth2 authentication. Designed to be installed as a dependency across multiple projects.

## Tech Stack

| Tool | Purpose |
| --- | --- |
| Node.js | Runtime |
| TypeScript | Language |
| Nodemailer | Email transport |
| Gmail OAuth2 | Authentication |

## Installation

```bash
npm install itzkennedydev/mailer
```

## Setup

### 1. Create OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3456/callback` as an authorized redirect URI

### 2. Get a Refresh Token

```bash
GOOGLE_CLIENT_ID=<your-client-id> GOOGLE_CLIENT_SECRET=<your-client-secret> node scripts/get-refresh-token.js
```

This opens a browser for Gmail authorization and outputs the credentials you need.

### 3. Configure Environment Variables

```
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

Optional:
```
MAILER_FROM=Your Name <your-email@gmail.com>
MAILER_REPLY_TO=reply@example.com
```

## Usage

### Initialize from Environment Variables

```typescript
import { initMailerFromEnv, sendEmail } from '@itzkennedydev/mailer';

initMailerFromEnv();
```

### Initialize with Config

```typescript
import { initMailer, sendEmail } from '@itzkennedydev/mailer';

initMailer({
  gmail: {
    user: process.env.GMAIL_USER!,
    clientId: process.env.GMAIL_CLIENT_ID!,
    clientSecret: process.env.GMAIL_CLIENT_SECRET!,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN!,
  },
  defaults: {
    from: 'My App <noreply@example.com>',
  },
});
```

### Send an Email

```typescript
const result = await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<h1>Hello World</h1>',
});

if (result.success) {
  console.log('Sent:', result.messageId);
}
```

### Send or Throw

```typescript
import { sendEmailOrThrow } from '@itzkennedydev/mailer';

const messageId = await sendEmailOrThrow({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Important Update',
  html: '<p>Details here</p>',
  text: 'Details here',
});
```

## API

### `initMailer(config: MailerConfig): void`
Initialize with explicit Gmail OAuth2 credentials.

### `initMailerFromEnv(): void`
Initialize from environment variables. Falls back to dry-run logging if credentials are missing.

### `sendEmail(options: SendEmailOptions): Promise<SendEmailResult>`
Send an email. Returns `{ success, messageId?, error? }`.

### `sendEmailOrThrow(options: SendEmailOptions): Promise<string>`
Send an email or throw on failure. Returns the message ID.

## License

MIT
