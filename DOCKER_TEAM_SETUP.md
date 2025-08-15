# Docker Team Setup Guide

This guide will help your team members connect to the shared PostgreSQL database running in Docker.

## Prerequisites

- Docker Desktop installed and running
- Node.js and pnpm installed
- Access to the project repository

## Current Database Setup

The database is running in a Docker container with these details:
- **Host**: localhost (or your machine's IP address)
- **Port**: 5434
- **Database**: app
- **Username**: postgres
- **Password**: postgres

## For Team Members

### Option 1: Connect to Host Machine's Database (Recommended)

1. **Get the host machine's IP address:**
   ```bash
   # On the host machine (where Docker is running)
   ipconfig
   # Look for IPv4 Address (usually 192.168.x.x)
   ```

2. **Create .env file in your project:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"
   ```
   
   Example:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"
   ```

3. **Install dependencies and start:**
   ```bash
   pnpm install
   pnpm run dev
   ```

### Option 2: Run Your Own Database Container

If you prefer to run your own database locally:

1. **Start your own PostgreSQL container:**
   ```bash
   pnpm run db:start
   ```

2. **Create .env file:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/app"
   ```

3. **Set up schema:**
   ```bash
   pnpm run db:push
   ```

4. **Start development server:**
   ```bash
   pnpm run dev
   ```

## Database Management Commands

```bash
# View database in browser (Drizzle Studio)
pnpm run db:studio

# Generate new migrations
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Push schema changes
pnpm run db:push

# Start database container
pnpm run db:start

# Stop database container
pnpm run db:stop
```

## Team Collaboration Workflow

### When Working Together:

1. **Always pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Sync database schema:**
   ```bash
   pnpm run db:push
   ```

3. **Coordinate schema changes:**
   - If you modify the database schema, run `pnpm run db:generate`
   - Commit the migration files
   - Other team members run `pnpm run db:migrate`

### Database Schema Changes:

1. **Modify schema.js file**
2. **Generate migration:**
   ```bash
   pnpm run db:generate
   ```
3. **Commit migration files to git**
4. **Team members pull and run:**
   ```bash
   pnpm run db:migrate
   ```

## Troubleshooting

### Connection Issues:
- Check if host machine's Docker container is running
- Verify IP address is correct
- Ensure port 5434 is accessible
- Check firewall settings

### Port Conflicts:
- If port 5432 is in use, modify the Docker run command:
  ```bash
  docker run --name sveltekit-postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=app \
    -p 5433:5432 \
    -d postgres:16-alpine
  ```
- Update DATABASE_URL to use the new port (5434)

### Container Issues:
```bash
# Check container status
docker ps

# View container logs
docker logs sveltekit-postgres

# Restart container
docker restart sveltekit-postgres
```

## Security Notes

- The current setup uses default passwords (not recommended for production)
- Consider using environment variables for sensitive data
- For production, use proper authentication and SSL
- Regularly update Docker images for security patches

## Quick Start Commands

```bash
# Clone repository
git clone [your-repo-url]
cd [project-directory]

# Install dependencies
pnpm install

# Create .env file with DATABASE_URL
# (Use host machine's IP address)

# Start development server
pnpm run dev
```

Your application should now be accessible at `http://localhost:5173` (or your machine's IP address).

