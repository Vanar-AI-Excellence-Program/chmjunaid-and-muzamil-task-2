import 'dotenv/config';
import { db } from '../src/lib/db.js';
import { users } from '../src/lib/schema.js';
import { eq } from 'drizzle-orm';

const email = process.argv[2] || process.env.TEST_EMAIL_TO;
if (!email) {
  console.error('Usage: node scripts/get-token.js <email>');
  process.exit(1);
}

const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
if (!rows.length) {
  console.error('User not found for', email);
  process.exit(2);
}
console.log(rows[0]?.verificationToken || '');




