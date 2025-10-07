# 🚀 How to Run Elevate Skill Application

## Quick Start (Recommended)

### Option 1: Run Everything at Once

```bash
# Make sure you're in the project root directory
cd /home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill

# Run the startup script
./run_all.sh
```

### Option 2: Manual Setup

#### 1. Start Backend Server

```bash
cd backend
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8004
```

#### 2. Start Frontend Server (in a new terminal)

```bash
npm run dev
```

## 🌐 Access Points

Once both servers are running:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8004
- **Admin Panel**: http://localhost:8080/admin
- **API Health Check**: http://localhost:8004/health

## 🔧 Troubleshooting

### If ports are already in use:

```bash
# Kill all processes
pkill -f "uvicorn"
pkill -f "vite"
pkill -f "npm"
pkill -f "node"
```

### If backend fails to start:

1. Check if virtual environment is activated
2. Check if all dependencies are installed: `pip install -r requirements.txt`
3. Check if database is accessible

### If frontend fails to start:

1. Check if Node.js is installed
2. Install dependencies: `npm install`
3. Check if port 8080 is available

## 📱 Testing the Application

1. **User Registration/Login**: http://localhost:8080
2. **Course Enrollment**: Click "Enroll Now" on any course
3. **Payment Process**: Upload transaction screenshot
4. **Admin Panel**: http://localhost:8080/admin
   - Login: admin@elevateskill.com
   - Password: Admin1234

## 🛑 Stopping the Application

- **If using run_all.sh**: Press `Ctrl+C`
- **If running manually**: Press `Ctrl+C` in each terminal
- **Force stop all**: Run the cleanup commands above

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database
- Virtual environment activated
