# 🏠 Local Setup Guide - UniFinder

This guide will walk you through setting up and running the UniFinder system on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

### Required Software
- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 16+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)
- **PostgreSQL** (optional, SQLite works for development): [Download PostgreSQL](https://www.postgresql.org/download/)

### Verify Installation
```bash
# Check Python version
python3 --version

# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/unifinder.git

# Navigate to the project directory
cd unifinder

# Verify the project structure
ls -la
```

You should see:
```
unifinder/
├── backend/
├── client/
├── README.md
├── LICENSE
├── .gitignore
└── DEPLOYMENT.md
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` at the beginning of your command prompt.

#### 2.3 Install Python Dependencies
```bash
# Install all required packages
pip install -r requirements.txt
```

#### 2.4 Set Up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your configuration
# You can use any text editor like nano, vim, or VS Code
nano .env
```

**Required Environment Variables:**
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# Google Gemini AI (Required for AI features)
GOOGLE_API_KEY=your-gemini-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**To get a Google Gemini API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and paste it in your `.env` file

#### 2.5 Run Database Migrations
```bash
# Create database tables
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate
```

#### 2.6 Create Superuser (Admin)
```bash
# Create an admin user
python3 manage.py createsuperuser

# Follow the prompts to create your admin account
# Username: admin
# Email: admin@example.com
# Password: (create a secure password)
```

#### 2.7 Test Backend Server
```bash
# Start the Django development server
python3 manage.py runserver
```

You should see output like:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
Month Day, Year - HH:MM:SS
Django version X.X.X, using settings 'university_recommender.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

**Test the backend:**
- Open your browser and go to: http://127.0.0.1:8000/admin/
- Login with your superuser credentials
- You should see the Django admin interface

**Stop the backend server:**
- Press `Ctrl+C` in the terminal

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
# Open a new terminal window/tab
# Navigate to the client directory
cd client
```

#### 3.2 Install Node.js Dependencies
```bash
# Install all required packages
npm install
```

This may take a few minutes. You should see output showing packages being installed.

#### 3.3 Test Frontend Development Server
```bash
# Start the development server
npm run dev
```

You should see output like:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Test the frontend:**
- Open your browser and go to: http://localhost:5173/
- You should see the UniFinder homepage

**Stop the frontend server:**
- Press `Ctrl+C` in the terminal

### Step 4: Run Both Servers

You need to run both the backend and frontend servers simultaneously.

#### 4.1 Terminal 1 - Backend Server
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already activated)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start Django server
python3 manage.py runserver
```

#### 4.2 Terminal 2 - Frontend Server
```bash
# Navigate to client directory
cd client

# Start Vite development server
npm run dev
```

### Step 5: Test the Complete System

#### 5.1 Access the Application
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/
- **Admin Panel**: http://localhost:8000/admin/

#### 5.2 Test User Registration
1. Go to http://localhost:5173/
2. Click "Login" in the navbar
3. Click "Register" to create a new account
4. Fill in your details and register

#### 5.3 Test University Search
1. Login to your account
2. Click "Find University" in the navbar
3. Fill in your preferences:
   - Degree level (Bachelor, Master, etc.)
   - Course (Computer Science, Business, etc.)
   - Country preference
   - Previous degree and course
   - GPA and budget
4. Click "Find Universities"
5. View your personalized recommendations

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Python/Node.js Not Found
```bash
# Check if Python is installed
python3 --version

# If not found, install Python from python.org
# Check if Node.js is installed
node --version

# If not found, install Node.js from nodejs.org
```

#### Issue 2: Virtual Environment Not Activating
```bash
# Make sure you're in the backend directory
cd backend

# Create virtual environment again
python3 -m venv venv

# Activate (note the different syntax for Windows)
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### Issue 3: Dependencies Installation Fails
```bash
# Update pip
pip install --upgrade pip

# Clear pip cache
pip cache purge

# Try installing again
pip install -r requirements.txt
```

#### Issue 4: Database Migration Errors
```bash
# Remove existing migrations (if any)
rm -rf */migrations/0*.py

# Create fresh migrations
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate
```

#### Issue 5: Frontend Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue 6: CORS Errors
Make sure your `.env` file has the correct CORS settings:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### Issue 7: API Key Issues
- Verify your Google Gemini API key is correct
- Make sure the API key has the necessary permissions
- Check if you have sufficient API quota

### Port Conflicts

If you get port conflicts:

#### Backend Port Conflict (8000)
```bash
# Use a different port
python3 manage.py runserver 8001
```

#### Frontend Port Conflict (5173)
```bash
# Vite will automatically try the next available port
# Or specify a port
npm run dev -- --port 3000
```

## 📊 Verify Everything is Working

### Backend Health Check
```bash
# Test backend API
curl http://localhost:8000/api/recommendations/available-options/
```

### Frontend Health Check
- Open http://localhost:5173/
- You should see the UniFinder homepage
- Navigation should work without errors

### Database Check
```bash
# Check database
python3 manage.py dbshell
# Exit with Ctrl+D
```

## 🎯 Next Steps

Once your local setup is working:

1. **Explore the Admin Panel**: http://localhost:8000/admin/
2. **Test User Features**: Register, login, search for universities
3. **Check Logs**: Monitor terminal output for any errors
4. **Customize**: Modify settings, add features, or customize the UI

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: Look at terminal output for error messages
2. **Verify environment**: Make sure all prerequisites are installed
3. **Check configuration**: Verify your `.env` file is correct
4. **Restart servers**: Stop and restart both backend and frontend servers
5. **Clear cache**: Clear browser cache and restart browsers

## 🚀 Development Tips

### Backend Development
```bash
# Run tests
python3 manage.py test

# Check for issues
python3 manage.py check

# Create new Django app
python3 manage.py startapp myapp
```

### Frontend Development
```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management
```bash
# Create new migration
python3 manage.py makemigrations

# Apply migrations
python3 manage.py migrate

# Reset database (WARNING: deletes all data)
python3 manage.py flush
```

---

**🎉 Congratulations! You now have UniFinder running locally!**

You can now develop, test, and customize the system to your needs. 