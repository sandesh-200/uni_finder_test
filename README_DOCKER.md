# 🐳 Docker Setup for University Recommendation System

A single, efficient Docker setup that runs the system in containers but makes it accessible from your local device.

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

### Step 2: Set Up and Run
```bash
# Make the run script executable
chmod +x run.sh

# Run the setup script
./run.sh
```

The script will:
- ✅ Check if Docker is installed and running
- ✅ Check system resources
- ✅ Create a `.env` file for you
- ⚠️ Ask you to add your Google Gemini API key
- 🚀 Start the system with Docker networking

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

# Check status and resources
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

### Resource issues?
The system uses resource limits to prevent lag:
- Backend: Max 2GB RAM, 1 CPU core
- Frontend: Max 512MB RAM, 0.5 CPU core

## 📁 What's Included

- **Backend**: Django with AI recommendation system
- **Frontend**: React with modern UI
- **Cache**: Pre-built vector store for fast recommendations
- **Dataset**: University data with 25+ fields
- **Networking**: Docker bridge network for container communication

## 🎯 Features

- ✅ AI-powered university recommendations
- ✅ Modern React frontend
- ✅ Fast vector similarity search
- ✅ Detailed university information
- ✅ Single command setup
- ✅ Resource limits to prevent system lag
- ✅ Docker networking for accessibility
- ✅ Automatic cache building

## 🌐 Docker Networking

The system uses Docker networking to:
- **Run services in isolated containers** - Prevents conflicts
- **Make services accessible from your device** - Access via localhost
- **Limit resource usage** - Prevents system lag
- **Enable container communication** - Backend and frontend can talk

## 🆘 Need Help?

1. Check the logs: `./run.sh logs`
2. Restart the system: `./run.sh restart`
3. Check status: `./run.sh status`
4. Make sure your API key is correct
5. Ensure Docker has enough resources (4GB RAM recommended)

## 💡 Performance Tips

- **First run**: May take longer due to cache building
- **Subsequent runs**: Much faster due to cached images
- **Resource monitoring**: Use `./run.sh status` to check resource usage
- **Memory**: Close other apps if you experience slowdown

---

**Happy University Hunting! 🎓** 