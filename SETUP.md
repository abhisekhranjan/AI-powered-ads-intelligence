# RiseRoutes Setup Guide

This guide will help you set up the RiseRoutes AI Ads Intelligence Platform for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **MySQL** 8.0 ([Download](https://dev.mysql.com/downloads/mysql/))
- **Redis** ([Download](https://redis.io/download))

### Verify Prerequisites

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
mysql --version # Should be 8.0.x
redis-cli --version
```

## Installation Steps

### 1. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend application
- Backend application

### 2. Set Up MySQL Database

Start MySQL and create the database:

```bash
# Start MySQL (varies by OS)
# macOS with Homebrew:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Windows: Start MySQL from Services

# Create database
mysql -u root -p
```

In the MySQL prompt:

```sql
CREATE DATABASE riseroutes_dev;
CREATE USER 'riseroutes'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON riseroutes_dev.* TO 'riseroutes'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Set Up Redis

Start Redis:

```bash
# macOS with Homebrew:
brew services start redis

# Linux:
sudo systemctl start redis

# Windows: Start Redis from installation directory
redis-server
```

Verify Redis is running:

```bash
redis-cli ping
# Should return: PONG
```

### 4. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=riseroutes
DB_PASSWORD=your_secure_password
DB_NAME=riseroutes_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration (generate a secure random string)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long_change_this
JWT_EXPIRES_IN=7d

# OpenAI Configuration (optional for now, required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_ANALYTICS=false
```

### 5. Run Database Migrations

From the root directory:

```bash
npm run migrate --workspace=backend
```

This will create all necessary database tables.

### 6. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start both:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

## Verify Installation

### Check Backend Health

Open your browser or use curl:

```bash
curl http://localhost:3000/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 10.5,
  "services": {
    "database": true,
    "redis": true
  }
}
```

### Check Frontend

Open your browser to http://localhost:5173

You should see the RiseRoutes landing page with the message:
"Fix Your Ads Targeting in Minutes — Not Months"

## Troubleshooting

### Database Connection Issues

**Error**: `ER_ACCESS_DENIED_ERROR`
- Verify your database credentials in `backend/.env`
- Ensure the MySQL user has proper permissions

**Error**: `ER_BAD_DB_ERROR`
- Make sure you created the database: `CREATE DATABASE riseroutes_dev;`

### Redis Connection Issues

**Error**: `Redis connection failed`
- Verify Redis is running: `redis-cli ping`
- Check Redis host and port in `backend/.env`

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`
- Backend (port 3000): Change `PORT` in `backend/.env`
- Frontend (port 5173): Change port in `frontend/vite.config.ts`

### JWT Secret Error

**Error**: `Invalid environment variables: JWT_SECRET`
- Ensure JWT_SECRET is at least 32 characters long
- Generate a secure random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run frontend tests only
npm test --workspace=frontend

# Run backend tests only
npm test --workspace=backend
```

### Linting

```bash
# Lint all code
npm run lint

# Lint frontend only
npm run lint --workspace=frontend

# Lint backend only
npm run lint --workspace=backend
```

### Building for Production

```bash
npm run build
```

## Next Steps

The project setup is complete! The following features will be implemented in subsequent tasks:

- ✅ Task 1: Project Setup and Core Infrastructure (COMPLETE)
- ⏳ Task 2: Database Schema and Models
- ⏳ Task 3: Authentication and User Management
- ⏳ Task 4: Website Analysis Core Engine
- ... and more

## Getting Help

If you encounter issues:

1. Check the logs in `backend/logs/`
2. Verify all environment variables are set correctly
3. Ensure all services (MySQL, Redis) are running
4. Review the error messages in the console

## Project Structure

```
riseroutes-ai-ads-platform/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── ...
│   └── package.json
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── ...
│   ├── migrations/       # Database migrations
│   └── package.json
└── package.json          # Root workspace config
```
