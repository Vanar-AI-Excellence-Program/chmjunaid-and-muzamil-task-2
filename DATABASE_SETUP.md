# Database Configuration Guide

This SvelteKit application uses **PostgreSQL** with **Drizzle ORM** for database management.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. All dependencies installed (`npm install`)

## Step 1: Set up Environment Variables

Create a `.env` file in your project root with your database connection:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# Example for local development:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/my_app_dev"

# Example for production:
# DATABASE_URL="postgresql://user:pass@host:port/database"
```

## Step 2: Create Database

1. **Using PostgreSQL CLI:**
   ```bash
   psql -U postgres
   CREATE DATABASE my_app_dev;
   ```

2. **Using pgAdmin or other GUI tools:**
   - Connect to your PostgreSQL server
   - Create a new database (e.g., `my_app_dev`)

## Step 3: Generate and Run Migrations

1. **Generate migration files:**
   ```bash
   npm run db:generate
   ```

2. **Push schema to database:**
   ```bash
   npm run db:push
   ```

   Or run migrations:
   ```bash
   npm run db:migrate
   ```

## Step 4: Verify Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open Drizzle Studio (optional):**
   ```bash
   npm run db:studio
   ```

## Database Schema

The application includes the following tables:

- **users** - User accounts with authentication
- **sessions** - User sessions for authentication
- **emailVerifications** - Email verification tokens
- **passwordResets** - Password reset tokens
- **accounts** - OAuth provider accounts

## Available Database Commands

- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:push` - Push schema changes directly to database
- `npm run db:migrate` - Run pending migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Troubleshooting

### Common Issues:

1. **Connection refused:**
   - Ensure PostgreSQL is running
   - Check your DATABASE_URL format
   - Verify database exists

2. **Authentication failed:**
   - Check username/password in DATABASE_URL
   - Ensure user has proper permissions

3. **Schema not found:**
   - Run `npm run db:push` to create tables
   - Check that schema.js is properly configured

### Environment Variables:

Make sure your `.env` file is in the project root and contains:
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Production Deployment

For production, consider:

1. **Environment Variables:** Use your hosting platform's environment variable system
2. **Connection Pooling:** The current setup includes basic connection pooling
3. **SSL:** Enable SSL for production databases
4. **Backup:** Set up regular database backups

Example production DATABASE_URL:
```
DATABASE_URL="postgresql://user:pass@host:5432/database?sslmode=require"
``` 