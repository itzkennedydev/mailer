# Mailer

Shared email service for my projects: Nodemailer with Gmail OAuth2, installed as a dependency so every app sends mail the same way.

## Install

```bash
npm install itzkennedydev/mailer
```

## Setup

1. Create an OAuth 2.0 Client ID (Web application) in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and add `http://localhost:3456/callback` as an authorized redirect URI.

2. Get a refresh token. This opens a browser for Gmail authorization and prints the credentials you need:

```bash
GOOGLE_CLIENT_ID=<client-id> GOOGLE_CLIENT_SECRET=<client-secret> node scripts/get-refresh-token.js
```

3. Set the environment variables:

```
GMAIL_USER=your-email@gmail.com
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
```

Optional: `MAILER_FROM` and `MAILER_REPLY_TO` override the defaults.

## Usage

```typescript
import { initMailerFromEnv, sendEmail } from '@itzkennedydev/mailer';

initMailerFromEnv();

const result = await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<h1>Hello</h1>',
});
```

`initMailer(config)` takes explicit credentials instead of env vars. `sendEmailOrThrow` throws on failure and returns the message ID, while `sendEmail` returns `{ success, messageId?, error? }`. With no credentials configured, `initMailerFromEnv` falls back to dry-run logging, which is handy in development.
