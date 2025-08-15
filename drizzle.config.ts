import type { Config } from 'drizzle-kit';
import 'dotenv/config';

declare const process: { env: { [key: string]: string | undefined } };

export default {
  schema: './src/lib/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/app',
  },
} satisfies Config;