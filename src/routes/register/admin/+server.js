import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { users } from '$lib/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '$lib/email.js';
import { generateOTP, generateOTPExpiry } from '$lib/utils.js';

export async function POST({ request }) {
  try {
    const { name, email, password, adminSecretKey } = await request.json();
    
    if (!name || !email || !password || !adminSecretKey) {
      return json({ error: 'All fields are required.' }, { status: 400 });
    }
    
    // Verify admin secret key
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return json({ error: 'Invalid admin secret key.' }, { status: 400 });
    }
    
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return json({ error: 'Email already registered.' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();
    const now = new Date(); // Current timestamp
    
    // Create admin user with OTP
    const [user] = await db.insert(users).values({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'admin', // Set role as admin
      otp,
      otpExpiry,
      emailVerified: false,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail registration if email fails
    }
    
    return json({ 
      success: true,
      message: 'Admin account created successfully! Please check your email for the verification OTP.',
      userId: user.id
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return json({ error: 'Admin registration failed. Please try again.' }, { status: 500 });
  }
}
