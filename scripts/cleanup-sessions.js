#!/usr/bin/env node

/**
 * Session Cleanup Utility
 * 
 * This script cleans up expired sessions from the database.
 * Can be run manually or scheduled via cron job.
 * 
 * Usage:
 *   node scripts/cleanup-sessions.js
 *   node scripts/cleanup-sessions.js --dry-run
 *   node scripts/cleanup-sessions.js --verbose
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sessions } from '../src/lib/schema.js';
import { lt } from 'drizzle-orm';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

console.log('🔐 Session Cleanup Utility');
console.log('==========================');
console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
console.log(`Verbose: ${isVerbose ? 'Yes' : 'No'}`);
console.log('');

// Initialize database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/app';
const client = postgres(connectionString);
const db = drizzle(client);

async function cleanupSessions() {
  try {
    console.log('🔄 Starting session cleanup...');
    
    if (isDryRun) {
      console.log('📋 DRY RUN: Would clean up expired sessions');
      
      // Count expired sessions without deleting
      const now = new Date();
      const expiredSessions = await db.select()
        .from(import('../src/lib/schema.js').sessions)
        .where(import('../src/lib/schema.js').sessions.expires < now);
      
      console.log(`📊 Found ${expiredSessions.length} expired sessions`);
      
      if (isVerbose && expiredSessions.length > 0) {
        console.log('\n📋 Expired sessions:');
        expiredSessions.forEach(session => {
          const expiredAt = new Date(session.expires);
          const daysAgo = Math.floor((now - expiredAt) / (1000 * 60 * 60 * 24));
          console.log(`  - Session ${session.sessionToken.substring(0, 20)}... (expired ${daysAgo} days ago)`);
        });
      }
      
      return expiredSessions.length;
    } else {
      // Actually perform cleanup
      const now = new Date();
      const result = await db.delete(sessions)
        .where(lt(sessions.expires, now))
        .returning();
      
      const deletedCount = result.length;
      console.log(`✅ Cleanup completed successfully!`);
      console.log(`🗑️  Deleted ${deletedCount} expired sessions`);
      
      if (isVerbose && deletedCount > 0) {
        console.log('\n📊 Cleanup summary:');
        console.log(`  - Total sessions cleaned: ${deletedCount}`);
        console.log(`  - Timestamp: ${new Date().toISOString()}`);
      }
      
      return deletedCount;
    }
  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    throw error;
  }
}

async function getSessionStats() {
  try {
    const now = new Date();
    
    // Get total sessions
    const totalSessions = await db.select()
      .from(import('../src/lib/schema.js').sessions);
    
    // Get active sessions
    const activeSessions = totalSessions.filter(session => 
      new Date(session.expires) > now
    );
    
    // Get expired sessions
    const expiredSessions = totalSessions.filter(session => 
      new Date(session.expires) <= now
    );
    
    // Get sessions expiring soon (within 24 hours)
    const expiringSoon = totalSessions.filter(session => {
      const expires = new Date(session.expires);
      const timeUntilExpiry = expires - now;
      return timeUntilExpiry > 0 && timeUntilExpiry <= 24 * 60 * 60 * 1000;
    });
    
    return {
      total: totalSessions.length,
      active: activeSessions.length,
      expired: expiredSessions.length,
      expiringSoon: expiringSoon.length
    };
  } catch (error) {
    console.error('❌ Error getting session stats:', error);
    return null;
  }
}

async function main() {
  try {
    // Get initial stats
    console.log('📊 Getting session statistics...');
    const initialStats = await getSessionStats();
    
    if (initialStats) {
      console.log('\n📈 Current Session Statistics:');
      console.log(`  - Total sessions: ${initialStats.total}`);
      console.log(`  - Active sessions: ${initialStats.active}`);
      console.log(`  - Expired sessions: ${initialStats.expired}`);
      console.log(`  - Expiring within 24h: ${initialStats.expiringSoon}`);
      console.log('');
    }
    
    // Perform cleanup
    const deletedCount = await cleanupSessions();
    
    // Get updated stats
    if (!isDryRun) {
      console.log('\n📊 Getting updated statistics...');
      const updatedStats = await getSessionStats();
      
      if (updatedStats) {
        console.log('\n📈 Updated Session Statistics:');
        console.log(`  - Total sessions: ${updatedStats.total}`);
        console.log(`  - Active sessions: ${updatedStats.active}`);
        console.log(`  - Expired sessions: ${updatedStats.expired}`);
        console.log(`  - Expiring within 24h: ${updatedStats.expiringSoon}`);
      }
    }
    
    console.log('\n✅ Session cleanup utility completed successfully!');
    
    if (isDryRun) {
      console.log('\n💡 To perform actual cleanup, run without --dry-run flag');
    }
    
  } catch (error) {
    console.error('\n❌ Session cleanup utility failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
  await client.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Received SIGTERM, shutting down gracefully...');
  await client.end();
  process.exit(0);
});

// Run the main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
