# 🐳 Docker Setup for Friends

This is a simple Docker setup to run the University Recommendation System locally.

## 🚀 Quick Start

### Prerequisites
1. **Docker** - [Install Docker](https://docs.docker.com/get-docker/)
2. **Docker Compose** - [Install Docker Compose](https://docs.docker.com/compose/install/)
3. **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### Step 1: Get the Code
```bash
git clone <your-repo-url>
cd university-recommendation-system
```

### Step 2: Set Up Environment
```bash
# Make the run script executable
chmod +x run.sh

# Run the setup script
./run.sh
```

The script will:
- ✅ Check if Docker is installed
- ✅ Create a `.env` file for you
- ⚠️ Ask you to add your Google Gemini API key
- 🚀 Start the system automatically

### Step 3: Add Your API Key
1. Get your Google Gemini API key from: https://makersuite.google.com/app/apikey
2. Edit the `.env` file and replace `your-google-gemini-api-key-here` with your actual API key
3. Run `./run.sh` again

### Step 4: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## 📋 Available Commands

```bash
# Start the system
./run.sh

# View logs
./run.sh logs

# Stop the system
./run.sh stop

# Restart the system
./run.sh restart

# Check status
./run.sh status
```

## 🔧 Manual Commands

If you prefer to run commands manually:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🐛 Troubleshooting

### System won't start?
1. Check if Docker is running
2. Make sure you have a valid Google Gemini API key in `.env`
3. Check logs: `docker-compose logs`

### Cache issues?
The system automatically builds a cache on first run. If you have issues:
```bash
# Remove cache and restart
docker-compose down
rm -rf backend/vector_store_cache
./run.sh
```

### Port conflicts?
If ports 3000 or 8000 are already in use:
1. Stop other services using those ports
2. Or modify the ports in `docker-compose.yml`

## 📁 What's Included

- **Backend**: Django with AI recommendation system
- **Frontend**: React with modern UI
- **Cache**: Pre-built vector store for fast recommendations
- **Dataset**: University data with 25+ fields

## 🎯 Features

- ✅ AI-powered university recommendations
- ✅ Modern React frontend
- ✅ Fast vector similarity search
- ✅ Detailed university information
- ✅ Easy Docker setup
- ✅ Automatic cache building

## 🆘 Need Help?

1. Check the logs: `./run.sh logs`
2. Restart the system: `./run.sh restart`
3. Make sure your API key is correct
4. Ensure Docker has enough resources (4GB RAM recommended)

---

**Happy University Hunting! 🎓** 