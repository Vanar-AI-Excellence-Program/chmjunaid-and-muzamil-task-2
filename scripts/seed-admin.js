import 'dotenv/config';
import { db } from '../src/lib/db.js';
import { users } from '../src/lib/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@local.test';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await db.select().from(users).where(eq(users.email, email));

  if (existing.length === 0) {
    await db.insert(users).values({
      name,
      email,
      password: passwordHash,
      emailVerified: true,
      role: 'admin'
    });
    console.log(`Created admin user: ${email} / ${password}`);
  } else {
    await db.update(users).set({
      name,
      password: passwordHash,
      emailVerified: true,
      role: 'admin'
    }).where(eq(users.email, email));
    console.log(`Updated admin user: ${email} / ${password}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });



