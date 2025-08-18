#!/usr/bin/env node

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sessions, users } from '../src/lib/schema.js';

console.log('🔍 Testing Database Connection and Tables...\n');

// Initialize database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/app';
console.log('📡 Connection String:', connectionString);

const client = postgres(connectionString);
const db = drizzle(client);

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const result = await client`SELECT version()`;
    console.log('✅ Database connection successful');
    console.log('📊 PostgreSQL version:', result[0].version);
    
    // Test sessions table
    console.log('\n🔄 Testing sessions table...');
    const sessionCount = await db.select().from(sessions);
    console.log('✅ Sessions table accessible');
    console.log('📊 Current sessions count:', sessionCount.length);
    
    // Test users table
    console.log('\n🔄 Testing users table...');
    const userCount = await db.select().from(users);
    console.log('✅ Users table accessible');
    console.log('📊 Current users count:', userCount.length);
    
    // Show table structure
    console.log('\n🔄 Checking table structure...');
    const sessionColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'session' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Sessions table structure:');
    sessionColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await client.end();
  }
}

testConnection();
