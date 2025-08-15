// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// Test environment variables
console.log('=== Environment Variable Test ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test if .env file is being loaded
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL is set');
  console.log('URL length:', process.env.DATABASE_URL.length);
  console.log('URL preview:', process.env.DATABASE_URL.substring(0, 20) + '...');
} else {
  console.log('❌ DATABASE_URL is not set');
  console.log('Make sure you have a .env file with DATABASE_URL in your project root');
}

console.log('=== Test Complete ==='); 