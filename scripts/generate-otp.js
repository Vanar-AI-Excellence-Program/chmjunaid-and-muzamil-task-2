import 'dotenv/config';
import { db } from '../src/lib/db.js';
import { users } from '../src/lib/schema.js';
import { eq } from 'drizzle-orm';
import { generateOTP, generateOTPExpiry } from '../src/lib/utils.js';
import { sendOTPEmail } from '../src/lib/email.js';

async function main() {
  const email = process.argv[2] || 'chmjunaidsaleem@gmail.com';
  
  try {
    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      console.error('User not found with email:', email);
      process.exit(1);
    }
    
    const userData = user[0];
    console.log(`Found user: ${userData.name} (ID: ${userData.id})`);
    
    // Generate new OTP and expiry
    const newOtp = generateOTP();
    const newOtpExpiry = generateOTPExpiry();
    
    // Update user with new OTP
    await db.update(users)
      .set({
        otp: newOtp,
        otpExpiry: newOtpExpiry,
        emailVerified: false, // Ensure email is marked as unverified
        updatedAt: new Date()
      })
      .where(eq(users.id, userData.id));
    
    console.log(`Generated new OTP: ${newOtp}`);
    console.log(`OTP expires at: ${newOtpExpiry}`);
    
    // Send OTP email
    try {
      await sendOTPEmail(email, newOtp);
      console.log('OTP email sent successfully!');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      console.log('You can manually verify the OTP in the database or use the verification page');
    }
    
    console.log(`\nTo verify, go to: http://localhost:5173/verify-otp?userId=${userData.id}`);
    console.log(`Or use the OTP: ${newOtp}`);
    
  } catch (error) {
    console.error('Error generating OTP:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

