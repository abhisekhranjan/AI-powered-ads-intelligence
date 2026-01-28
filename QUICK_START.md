# Quick Start Guide

Get RiseRoutes up and running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Need >= 18.0.0
npm --version   # Need >= 9.0.0
```

## Installation

```bash
# 1. Install dependencies
npm run install:all

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and set:
# - DB_PASSWORD (your MySQL password)
# - JWT_SECRET (minimum 32 characters)
# - OPENAI_API_KEY (optional for now)

# 3. Create MySQL database
mysql -u root -p
# Then run: CREATE DATABASE riseroutes_dev;

# 4. Start Redis
redis-server

# 5. Run migrations (Task 2 will add migration files)
npm run migrate --workspace=backend

# 6. Start development servers
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Common Commands

```bash
# Development
npm run dev              # Start both frontend and backend

# Testing
npm test                 # Run all tests
npm test --workspace=frontend
npm test --workspace=backend

# Linting
npm run lint            # Lint all code

# Building
npm run build           # Build for production
```

## What's Included

✅ **Frontend**
- React 18 with TypeScript
- Tailwind CSS with custom design system
- Vite for fast development
- React Query for state management
- Framer Motion for animations

✅ **Backend**
- Express.js with TypeScript
- MySQL connection pooling
- Redis caching
- JWT authentication middleware
- Rate limiting
- Error handling
- Logging with Winston
- Database migration system

✅ **Infrastructure**
- Monorepo workspace setup
- Environment configuration
- Health check endpoints
- Security middleware (Helmet, CORS)
- Development and production configs

## Next Steps

Task 1 is complete! The following tasks will add:

- Database schema and models (Task 2)
- User authentication (Task 3)
- Website analysis engine (Task 4)
- AI-powered targeting (Task 6)
- Dashboard UI (Tasks 10-13)
- Export functionality (Task 14)

## Need Help?

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.
