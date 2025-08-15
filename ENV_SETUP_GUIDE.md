# Environment Variables Setup Guide

This guide explains all the environment variables you need for the AuthChat application and how to obtain them.

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration (Required)
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"

# Authentication Secret (Required)
AUTH_SECRET="your-super-secret-key-here"

# OAuth Providers (Optional - for Google & GitHub login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email Configuration (Optional - for OTP verification)
GMAIL_USER="your-gmail@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# AI Integration (Optional - for chatbot functionality)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Admin Configuration (Required for admin registration)
ADMIN_SECRET_KEY="your-super-secret-admin-key-here"

# Development Settings
NODE_ENV="development"
```

## How to Get Each Variable

### 1. DATABASE_URL (Required)
**What it is**: Connection string for your PostgreSQL database
**How to get it**: 
- **For Docker (current setup)**: `postgresql://postgres:postgres@localhost:5434/app`
- **For team members**: `postgresql://postgres:postgres@localhost:5434/app`
- **For cloud databases**: Provided by your database service

### 2. AUTH_SECRET (Required)
**What it is**: Secret key for JWT token encryption and session security
**How to get it**: Generate a random string (at least 32 characters)
**Quick generation**:
```bash
# On Windows PowerShell:
$random = -join ((65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
echo $random

# Or use this online generator: https://generate-secret.vercel.app/32
```

**Example**: `AUTH_SECRET="my-super-secret-key-12345-abcdef-ghijkl"`

### 3. GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (Optional)
**What it is**: OAuth credentials for Google login
**How to get it**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs: `http://localhost:5173/auth/callback/google`
7. Copy Client ID and Client Secret

### 4. GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET (Optional)
**What it is**: OAuth credentials for GitHub login
**How to get it**:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `AuthChat`
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback/github`
4. Copy Client ID and Client Secret

### 5. GMAIL_USER & GMAIL_APP_PASSWORD (Optional)
**What it is**: Gmail credentials for sending OTP verification emails
**How to get it**:
1. **GMAIL_USER**: Your Gmail address
2. **GMAIL_APP_PASSWORD**: 
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Factor Authentication if not already enabled
   - Go to "App passwords"
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password)

### 6. GOOGLE_GENERATIVE_AI_API_KEY (Optional)
**What it is**: API key for Google's Gemini AI (used in chatbot)
**How to get it**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 7. ADMIN_SECRET_KEY (Required for admin registration)
**What it is**: Secret key required to register admin accounts
**How to get it**: Generate a secure random string (at least 16 characters)
**Quick generation**:
```bash
# On Windows PowerShell:
$random = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
echo $random

# Or use this online generator: https://generate-secret.vercel.app/32
```

**Example**: `ADMIN_SECRET_KEY="admin-secret-key-12345-abcdef-ghijkl"`

## Quick Setup for Development

For immediate development, you only need these **required** variables:

```env
# Required for basic functionality
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"
AUTH_SECRET="your-super-secret-key-here"
ADMIN_SECRET_KEY="your-super-secret-admin-key-here"

# Optional - add these later for full features
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""
# GMAIL_USER=""
# GMAIL_APP_PASSWORD=""
# GOOGLE_GENERATIVE_AI_API_KEY=""
```

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file to git!
- Add `.env` to your `.gitignore` file
- Share environment variables securely with your team
- Use different values for development vs production

## Team Sharing

For your team members, share only the **DATABASE_URL** with your machine's IP:

```env
# Team members use this to connect to your database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"
AUTH_SECRET="[EACH_MEMBER_GENERATES_THEIR_OWN]"
```

## Testing Your Setup

After setting up your `.env` file:

1. **Restart your development server**:
   ```bash
   pnpm run dev
   ```

2. **Check for errors** in the console

3. **Test the application** at http://localhost:5173

## Troubleshooting

### Common Issues:

1. **"MissingSecret" error**: Make sure `AUTH_SECRET` is set
2. **Database connection failed**: Check `DATABASE_URL` format
3. **OAuth not working**: Verify OAuth credentials are correct
4. **Email not sending**: Check Gmail app password

### Verify Environment Variables:

```bash
# Check if .env is loaded
echo $env:DATABASE_URL
echo $env:AUTH_SECRET
```

