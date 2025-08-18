# SvelteKit Application

## Overview
This is a SvelteKit application with authentication, chat functionality, and dashboard features.

## Features

### 1. Authentication Flow
- Login/Registration forms
- Password validation
- Email verification
- Password reset
- Session management

### 2. Dashboard Functionality
- User dashboard
- Admin dashboard
- Navigation between pages
- User management

### 3. Chat System
- Message sending/receiving
- Real-time updates
- User interactions

### 4. API Endpoints
- Authentication endpoints
- User management
- Chat functionality
- Profile management

### 5. Database Operations
- User CRUD operations
- Message storage
- Session management

## Project Structure
```
├── src/
│   ├── lib/
│   │   ├── auth.js           # Authentication utilities
│   │   ├── db.js             # Database configuration
│   │   ├── email.js          # Email utilities
│   │   └── components/       # UI components
│   └── routes/               # Application routes
├── scripts/                  # Utility scripts
├── static/                   # Static assets
└── README.md                 # This file
```

## Getting Started

1. Clone this repository:
```bash
git clone <repository-url>
cd chmjunaid-and-muzamil-task-2
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (see .env.example)

4. Start the database:
```bash
pnpm run db:start
```

5. Push database schema:
```bash
pnpm run db:push
```

6. Start the development server:
```bash
pnpm run dev
```

## Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm db:start` - Start database
- `pnpm db:stop` - Stop database
- `pnpm db:migrate` - Run database migrations
- `pnpm seed:admin` - Seed admin user
