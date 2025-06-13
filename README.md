# BraddahGPT

A ChatGPT clone with Hawaiian pidgin personality, built with Next.js, TypeScript, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (OAuth + email/password)
- **Runtime**: Bun
- **Deployment**: Ready for production deployment

## Features

- Google and GitHub OAuth authentication
- Email/password registration and login
- Protected routes with session management
- Database-backed user management
- Responsive UI with Tailwind CSS
- Chat interface template (AI integration pending)

## Prerequisites

- Bun installed
- PostgreSQL running locally
- Google OAuth app configured
- GitHub OAuth app configured

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://braddahgpt_user:your_password@localhost:5432/braddahgpt"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

## Database Setup

### macOS
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database and user
psql postgres
CREATE DATABASE braddahgpt;
CREATE USER braddahgpt_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE braddahgpt TO braddahgpt_user;
ALTER USER braddahgpt_user CREATEDB;
\q

# Connect to database and grant schema permissions
psql braddahgpt
GRANT ALL ON SCHEMA public TO braddahgpt_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO braddahgpt_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO braddahgpt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO braddahgpt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO braddahgpt_user;
\q
```

### Linux/WSL
```bash
# Update package list and install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service (WSL uses 'service' instead of 'systemctl')
sudo service postgresql start

# Create database and user
sudo -u postgres psql
CREATE DATABASE braddahgpt;
CREATE USER braddahgpt_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE braddahgpt TO braddahgpt_user;
ALTER USER braddahgpt_user CREATEDB;
\q

# Connect to database and grant schema permissions
sudo -u postgres psql braddahgpt
GRANT ALL ON SCHEMA public TO braddahgpt_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO braddahgpt_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO braddahgpt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO braddahgpt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO braddahgpt_user;
\q

# Note: You may see "could not flush dirty data" warnings in WSL - these are harmless
# You'll need to start PostgreSQL manually each time you restart WSL:
# sudo service postgresql start
```

## Installation

```bash
# Clone repository
git clone <repository-url>
cd braddahgpt

# Install dependencies
bun install

# Run database migrations
bunx prisma migrate dev

# Generate Prisma client
bunx prisma generate

# Start development server
bun run dev
```

## Development Commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Database operations
bunx prisma migrate dev          # Create and apply new migration
bunx prisma generate            # Regenerate Prisma client
bunx prisma studio             # Open database GUI
bunx prisma db push            # Push schema changes without migration

# Database inspection
psql braddahgpt                # Connect to database (macOS)
sudo -u postgres psql braddahgpt  # Connect to database (Linux/WSL)
```

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add credentials to `.env`

## Project Structure
braddahgpt/
├── src/app/
│ ├── api/auth/ # Authentication API routes
│ ├── auth/ # Authentication pages
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Homepage/chat interface
│ └── providers.tsx # NextAuth session provider
├── prisma/
│ ├── migrations/ # Database migrations
│ └── schema.prisma # Database schema
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js # PostCSS configuration
└── package.json # Dependencies and scripts
```


## Database Schema

- **Users**: Authentication and profile data
- **Accounts**: OAuth provider connections  
- **Chats**: Chat conversations with titles and timestamps
- **Messages**: Individual messages with role (USER/ASSISTANT) and content

## Next Steps (Future Enhancements)

- **Streaming AI responses** - Real-time typing effect for AI messages
- **URL routing** - Individual URLs for each chat (`/chat/[chatId]`)
- **Smart chat titles** - Auto-generate meaningful titles from conversation content
- **Mobile responsiveness** - Optimize UI for mobile devices
- **Message search** - Search across all conversations
- **Export conversations** - Download chat history as text/PDF
- **GPT-4 support** - Upgrade to more advanced AI model
- **Custom system prompts** - User-configurable AI personality
- **Message reactions** - Like/dislike AI responses
- **Production deployment** - Deploy to Vercel/Railway with proper environment setup
