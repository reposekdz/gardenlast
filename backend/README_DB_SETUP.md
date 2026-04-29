# Garden TVET Backend - Database Setup Guide

## Quick Start (Static files work now!)
Backend server starts immediately 🚀
- Static `/uploads/` images served ✅
- `/api/health` works ✅  
- Vite proxy errors fixed (no more ECONNRESET)

## Full API Setup (MySQL required)

### 1. Install & Start MySQL (Windows)
**Option A: XAMPP (Recommended)**
```
Download: https://www.apachefriends.org/download.html
1. Install XAMPP 
2. Start → XAMPP Control Panel → Start MySQL
3. Default: localhost/root/(empty password)
```

**Option B: MySQL Installer**
```
https://dev.mysql.com/downloads/installer/
root / set password
```

### 2. Create Database
```sql
CREATE DATABASE garden_tvet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure .env (backend/.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=garden_tvet
PORT=5000
```

### 4. Import Full Schema (Optional - auto-creates tables)
```
cd backend/scripts
node local_setup.js
# or
node import_full_db.js
```

### 5. Start Backend
```bash
cd backend
npm install
node server.js
```

**Expected Logs:**
```
🚀 Server is running on port 5000
📁 Static uploads served at http://localhost:5000/uploads/
🔄 Initializing database...
✅ Applications table ready
✅ Admin user created
```

## Test Endpoints
```bash
curl http://localhost:5000/api/health              # OK
curl http://localhost:5000/uploads/school view/IMG-20250222-WA0013.jpg  # Image
curl http://localhost:5000/api/hero               # Hero slides (after DB)
```

## Default Login
```
Username: admin
Password: admin123
```

---

**Proxy errors fixed! 🎉** Frontend Vite now proxies successfully to backend.

