import { db } from './db.js';
import { sql } from 'drizzle-orm';

/**
 * Database migration script to update the users table schema
 * Run this after updating the schema.js file
 */
export async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Add new columns if they don't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verificationToken VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verificationTokenExpiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS resetToken VARCHAR(255),
      ADD COLUMN IF NOT EXISTS resetTokenExpiry TIMESTAMP
    `);
    
    // Update emailVerified column type if it exists as timestamp
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'emailVerified' 
          AND data_type = 'timestamp without time zone'
        ) THEN
          ALTER TABLE users ALTER COLUMN "emailVerified" TYPE BOOLEAN USING FALSE;
        END IF;
      END $$;
    `);
    
    // Add emailVerified column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT FALSE
    `);
    
    // Drop old passwordHash column if it exists
    await db.execute(sql`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS password_hash
    `);
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
