# Team Database Setup Guide

This guide will help you and your team members set up a shared database for the AuthChat project.

## Option 1: Supabase (Recommended for Teams)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `authchat-team`
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your team
6. Click "Create new project"

### Step 2: Get Database Connection String
1. In your Supabase dashboard, go to Settings → Database
2. Copy the "Connection string" (URI format)
3. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Share with Team Members
1. Share the connection string with your team
2. Each team member needs to create a `.env` file with:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Step 4: Set Up Database Schema
1. Run this command to create the database tables:
   ```bash
   pnpm run db:push
   ```

## Option 2: Neon (Alternative)

### Step 1: Create Neon Project
1. Go to [neon.tech](https://neon.tech)
2. Sign up/Login
3. Click "Create Project"
4. Choose a name and region
5. Copy the connection string

### Step 2: Same as Supabase steps 3-4

## Option 3: Local PostgreSQL Server (Advanced)

If you prefer to host locally:

1. Install PostgreSQL on a server/VM
2. Configure it to accept connections from your team's IP addresses
3. Create a database and user
4. Share the connection details

## Team Collaboration Workflow

### Initial Setup (One person does this):
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
# Create .env file with DATABASE_URL

# 3. Create database schema
pnpm run db:push

# 4. Start development server
pnpm run dev
```

### For Each Team Member:
```bash
# 1. Clone the repository
git clone [your-repo-url]

# 2. Install dependencies
pnpm install

# 3. Create .env file with shared DATABASE_URL

# 4. Start development server
pnpm run dev
```

## Environment Variables Template

Create a `.env` file in your project root:

```env
# Database Configuration (shared with team)
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"

# Development Settings
NODE_ENV=development

# Add other variables as needed
```

## Database Management Commands

```bash
# View database in browser
pnpm run db:studio

# Generate new migrations
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Push schema changes
pnpm run db:push
```

## Troubleshooting

### Connection Issues:
- Check if DATABASE_URL is correct
- Ensure database is accessible from your IP
- Verify database credentials

### Schema Issues:
- Run `pnpm run db:push` to sync schema
- Check if all team members have the latest schema

### Team Sync:
- Always pull latest changes before starting work
- Coordinate schema changes with the team
- Use `pnpm run db:generate` for schema changes

## Security Notes

- Never commit `.env` files to git
- Use strong database passwords
- Consider IP restrictions for production
- Regularly rotate database credentials

