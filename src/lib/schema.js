import { pgTable, serial, varchar, timestamp, boolean, integer, text, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), // For storing hashed password
  emailVerified: boolean('emailVerified').default(false), // Quoted identifier
  image: varchar('image', { length: 255 }),
  role: varchar('role', { length: 20 }).default('user'),
  verificationToken: varchar('verificationToken', { length: 255 }), // Quoted identifier
  verificationTokenExpiry: timestamp('verificationTokenExpiry', { mode: 'date' }), // Quoted identifier
  resetToken: varchar('resetToken', { length: 255 }), // Quoted identifier
  resetTokenExpiry: timestamp('resetTokenExpiry', { mode: 'date' }), // Quoted identifier
  otp: varchar('otp', { length: 6 }), // 6-digit OTP
  otpExpiry: timestamp('otpExpiry', { mode: 'date' }), // OTP expiry time
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow(), // Quoted identifier
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(), // Quoted identifier
});

export const accounts = pgTable('account', {
  id: serial('id'),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
}, (table) => ({
  compoundKey: primaryKey({ columns: [table.provider, table.providerAccountId] })
}));

export const sessions = pgTable('session', {
  id: serial('id').primaryKey(),
  // Increase length to support Auth.js v5 encrypted tokens
  sessionToken: varchar('sessionToken', { length: 1024 }).notNull().unique(),
  userId: integer('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  compoundKey: primaryKey({ columns: [table.identifier, table.token] })
}));