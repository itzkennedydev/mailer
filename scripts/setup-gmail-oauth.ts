import http from 'http';
import { google } from 'googleapis';
import open from 'open';

const SCOPES = ['https://mail.google.com/'];
const REDIRECT_URI = 'http://localhost:3456/callback';

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log(`
=== Gmail OAuth2 Setup for Nodemailer ===

To set up Gmail OAuth2, you need an OAuth2 Client ID from Google Cloud Console.

Steps:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Mailer"
5. Under "Authorized redirect URIs", add: ${REDIRECT_URI}
6. Click "Create"
7. Copy the Client ID and Client Secret

Then run this script again:
  GOOGLE_CLIENT_ID=<your-client-id> GOOGLE_CLIENT_SECRET=<your-client-secret> npx ts-node scripts/setup-gmail-oauth.ts
`);
    return;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\nOpening browser for Gmail authorization...\n');

  const server = http.createServer(async (req, res) => {
    if (!req.url?.startsWith('/callback')) {
      res.writeHead(404);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:3456`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400);
      res.end('No authorization code received');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authorization successful!</h1><p>You can close this window.</p>');

      console.log('\n=== Gmail OAuth2 Credentials ===\n');
      console.log(`GMAIL_USER=<your-gmail-address>`);
      console.log(`GMAIL_CLIENT_ID=${clientId}`);
      console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log('\nAdd these to your .env file or Vercel environment variables.\n');

      server.close();
      process.exit(0);
    } catch (error) {
      res.writeHead(500);
      res.end('Failed to exchange authorization code');
      console.error('Token exchange error:', error);
      server.close();
      process.exit(1);
    }
  });

  server.listen(3456, () => {
    console.log('Listening on http://localhost:3456 for OAuth callback...');
    open(authUrl);
  });
}

main().catch(console.error);
