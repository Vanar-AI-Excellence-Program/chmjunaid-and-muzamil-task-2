import 'dotenv/config';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../src/lib/email.js';

async function main() {
  const to = process.env.TEST_EMAIL_TO || process.env.GMAIL_USER;
  if (!to) {
    console.error('Set TEST_EMAIL_TO or GMAIL_USER in .env to send a test email.');
    process.exit(1);
  }
  console.log('Sending test emails to', to);
  await sendVerificationEmail(to, 'test-token-123');
  await sendPasswordResetEmail(to, 'test-reset-token-456');
  await sendWelcomeEmail(to, 'Tester');
  console.log('Sent verification, reset, and welcome emails.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




