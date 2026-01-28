# 🚀 RiseRoutes - Complete Mac Setup Guide

## Prerequisites Installation

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (v18 or higher)
```bash
brew install node
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 3. Install MySQL 8.0
```bash
brew install mysql
brew services start mysql

# Secure MySQL installation
mysql_secure_installation
# Follow prompts:
# - Set root password (remember this!)
# - Remove anonymous users: Y
# - Disallow root login remotely: Y
# - Remove test database: Y
# - Reload privilege tables: Y
```

### 4. Install Redis
```bash
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping  # Should return "PONG"
```

## Project Setup

### Step 1: Clone and Install Dependencies
```bash
# Navigate to your project directory
cd /path/to/riseroutes-ai-ads-platform

# Install all dependencies (this may take 2-3 minutes)
npm run install:all
```

### Step 2: Configure MySQL Database
```bash
# Login to MySQL
mysql -u root -p
# Enter the password you set during mysql_secure_installation
```

In MySQL prompt, run:
```sql
-- Create database
CREATE DATABASE riseroutes_dev;

-- Create user (replace 'your_password' with a secure password)
CREATE USER 'riseroutes'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON riseroutes_dev.* TO 'riseroutes'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT user FROM mysql.user WHERE user='riseroutes';

-- Exit
EXIT;
```

### Step 3: Configure Environment Variables

#### Backend Configuration
```bash
cd backend
cp .env.example .env
nano .env  # or use your preferred editor (code .env, vim .env, etc.)
```

Edit `backend/.env` with these values:
```env
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# Database - USE YOUR MYSQL PASSWORD HERE
DB_HOST=localhost
DB_PORT=3306
DB_USER=riseroutes
DB_PASSWORD=your_password_from_step2
DB_NAME=riseroutes_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secret - Generate a secure random string
JWT_SECRET=your_jwt_secret_minimum_32_characters_long_change_this_to_something_secure
JWT_EXPIRES_IN=7d

# OpenAI (optional for now - can add later)
OPENAI_API_KEY=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as your JWT_SECRET.

#### Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
nano .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_ANALYTICS=false
```

### Step 4: Run Database Migrations
```bash
# From project root
cd ..
npm run migrate --workspace=backend
```

You should see:
```
Starting database migrations...
✓ Executed migration: 001_create_schema.sql
✓ All migrations completed successfully
```

### Step 5: Verify Services are Running
```bash
# Check MySQL
mysql -u riseroutes -p riseroutes_dev -e "SHOW TABLES;"
# Should show: analysis_cache, analysis_sessions, competitor_analyses, etc.

# Check Redis
redis-cli ping
# Should return: PONG

# Check Node.js
node --version
# Should show: v18.x.x or higher
```

## Running the Application

### Option 1: Run Both Frontend and Backend Together
```bash
# From project root
npm run dev
```

This will start:
- Backend API on http://localhost:3000
- Frontend on http://localhost:5173

### Option 2: Run Separately (for debugging)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 3: Build for Production
```bash
npm run build
npm run start --workspace=backend
```

## Accessing the Application

1. **Frontend**: Open http://localhost:5173 in your browser
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health

## Testing the Application

### 1. Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Expected response:
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

### 2. Test Website Analysis
1. Go to http://localhost:5173
2. Click "Analyze My Website"
3. Enter a website URL (e.g., https://stripe.com)
4. Click "Analyze Ads Targeting"
5. Watch the real-time analysis progress

## Troubleshooting

### MySQL Connection Issues

**Error: "Access denied for user"**
```bash
# Reset MySQL password
mysql -u root -p
ALTER USER 'riseroutes'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
# Update backend/.env with new password
```

**Error: "Can't connect to MySQL server"**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Start MySQL if not running
brew services start mysql

# Check MySQL status
mysql.server status
```

### Redis Connection Issues

**Error: "Redis connection failed"**
```bash
# Check if Redis is running
brew services list | grep redis

# Start Redis if not running
brew services start redis

# Test Redis
redis-cli ping
```

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::3000"**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in backend/.env
PORT=3001
```

**Error: "Port 5173 already in use"**
```bash
# Kill process on port 5173
kill -9 $(lsof -ti:5173)
```

### Puppeteer Issues

**Error: "Failed to launch browser"**
```bash
# Install Chromium dependencies
cd backend
npm install puppeteer --force

# Or use system Chrome
# Edit backend/src/services/websiteAnalyzer.ts
# Change: executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
rm package-lock.json frontend/package-lock.json backend/package-lock.json
npm run install:all
```

## Stopping the Application

### Stop Development Servers
Press `Ctrl + C` in the terminal running `npm run dev`

### Stop MySQL
```bash
brew services stop mysql
```

### Stop Redis
```bash
brew services stop redis
```

## Useful Commands

```bash
# View logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Check database
mysql -u riseroutes -p riseroutes_dev

# Check Redis data
redis-cli
> KEYS *
> GET key_name

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## Next Steps

1. ✅ Application is running
2. 🎨 Customize the design in `frontend/src/index.css`
3. 🤖 Add OpenAI API key for real AI analysis
4. 📊 Explore the dashboard features
5. 🚀 Deploy to production (see DEPLOYMENT.md)

## Quick Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000/api | - |
| MySQL | localhost:3306 | riseroutes / your_password |
| Redis | localhost:6379 | - |

## Support

If you encounter issues:
1. Check the logs in `backend/logs/`
2. Verify all services are running
3. Ensure environment variables are correct
4. Try restarting MySQL and Redis

---

**🎉 You're all set! The RiseRoutes platform is ready to use!**
