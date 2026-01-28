# 🚀 START HERE - Quick Launch Guide for Mac

## ⚡ 5-Minute Setup

### Step 1: Install Prerequisites (One-Time Setup)
```bash
# Install Homebrew (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install everything you need
brew install node mysql redis

# Start MySQL and Redis
brew services start mysql
brew services start redis
```

### Step 2: Setup Database
```bash
# Login to MySQL (press Enter if no password set)
mysql -u root -p

# In MySQL, run these commands:
CREATE DATABASE riseroutes_dev;
CREATE USER 'riseroutes'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON riseroutes_dev.* TO 'riseroutes'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Configure Project
```bash
# Install dependencies
npm run install:all

# Setup backend environment
cd backend
cp .env.example .env
```

**Edit `backend/.env` and change these lines:**
```env
DB_PASSWORD=password123
JWT_SECRET=your_super_secret_key_at_least_32_characters_long_12345
```

```bash
# Setup frontend environment
cd ../frontend
cp .env.example .env
cd ..
```

### Step 4: Initialize Database
```bash
npm run migrate --workspace=backend
```

### Step 5: START THE APP! 🎉
```bash
npm run dev
```

**That's it!** Open http://localhost:5173 in your browser!

---

## 🎯 What You Can Do Now

1. **Visit** http://localhost:5173
2. **Click** "Analyze My Website"
3. **Enter** any website URL (try https://stripe.com)
4. **Watch** the AI analyze and generate targeting recommendations
5. **Export** Meta & Google Ads targeting data

---

## 🔧 Troubleshooting

### "MySQL connection failed"
```bash
brew services restart mysql
mysql -u riseroutes -p riseroutes_dev  # Test connection
```

### "Redis connection failed"
```bash
brew services restart redis
redis-cli ping  # Should return "PONG"
```

### "Port already in use"
```bash
# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Kill process on port 5173
kill -9 $(lsof -ti:5173)
```

### "Module not found"
```bash
rm -rf node_modules */node_modules
npm run install:all
```

---

## 📚 Full Documentation

- **Complete Setup**: See `MAC_SETUP_GUIDE.md`
- **Project Status**: See `PROJECT_STATUS.md`
- **Quick Start**: See `QUICK_START.md`
- **Detailed Setup**: See `SETUP.md`

---

## ✅ Verify Everything Works

```bash
# Check services
brew services list

# Test MySQL
mysql -u riseroutes -p riseroutes_dev -e "SHOW TABLES;"

# Test Redis
redis-cli ping

# Test Backend
curl http://localhost:3000/health

# Test Frontend
open http://localhost:5173
```

---

## 🎉 You're Ready!

The RiseRoutes AI Ads Intelligence Platform is now running on your Mac!

**Frontend**: http://localhost:5173
**Backend API**: http://localhost:3000/api
**Health Check**: http://localhost:3000/health

Enjoy! 🚀
