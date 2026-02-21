const http = require('http');
const { google } = require('googleapis');
const { exec } = require('child_process');

const SCOPES = ['https://mail.google.com/'];
const REDIRECT_URI = 'http://localhost:3456/callback';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('\nOpening browser for Gmail authorization...\n');
exec(`open "${authUrl}"`);

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.url.startsWith('/callback')) {
    res.writeHead(404);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost:3456');
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
    console.log(`GMAIL_USER=itskennedy.dev@gmail.com`);
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
});
