// @ts-nocheck
import 'dotenv/config';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import Credentials from '@auth/core/providers/credentials';
// import Email from '@auth/core/providers/email';
import { db } from './db.js';
import { users, accounts, sessions, verificationTokens } from './schema.js';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const authOptions = {
  trustHost: true,
  debug: process.env.NODE_ENV !== 'production',
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      /** @param {any} credentials @param {Request} req */
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        // Find user by email
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).then(res => res[0]);
        if (!user) return null;
        // Require email verification for credentials sign-in
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in.');
        }
        // Compare password - use 'password' column, not 'passwordHash'
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        // Return user object with numeric id to match DB schema
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email'
        }
      }
    }),
    // Email({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM
    // })
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      console.log('Auth signIn callback - User:', user);
      console.log('Auth signIn callback - Account:', account);
      console.log('Auth signIn callback - Profile:', profile);
      
      // For now, allow all sign-ins without complex user management
      return true;
    }
  },
  events: {
    async createSession(message) {
      console.log('[auth][event] createSession', message?.session?.sessionToken, message?.user?.id);
    },
    async session(message) {
      console.log('[auth][event] session', !!message?.session, message?.session?.user?.email);
    },
    async updateSession(message) {
      console.log('[auth][event] updateSession', message?.session?.sessionToken);
    },
    async signIn(message) {
      console.log('[auth][event] signIn', message?.user?.email, message?.account?.provider);
    }
  }
};

export const handleAuth = SvelteKitAuth(authOptions);
