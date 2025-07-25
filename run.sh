#!/bin/bash

# Single lightweight setup for University Recommendation System
# Uses Docker networking to make system accessible from local device

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to detect Docker Compose version
detect_compose_command() {
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        print_status "Using Docker Compose V1"
    elif docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        print_status "Using Docker Compose V2"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose first:"
        echo "   https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# Function to check system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Check available memory
    available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$available_mem" -lt 2048 ]; then
        print_warning "Low memory available: ${available_mem}MB"
        print_warning "Consider closing other applications for better performance"
    else
        print_success "Memory available: ${available_mem}MB"
    fi
    
    # Check CPU cores
    cpu_cores=$(nproc)
    print_status "CPU cores available: $cpu_cores"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "   https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Detect Docker Compose version
    detect_compose_command
    
    print_success "Prerequisites check passed!"
}

# Function to setup environment
setup_environment() {
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
# University Recommendation System Environment Variables
GEMINI_API_KEY=your-google-gemini-api-key-here
DEBUG=True
SECRET_KEY=dev-secret-key-for-friends
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://0.0.0.0:3000
ALLOWED_HOSTS=localhost,127.0.0.1,backend,0.0.0.0
EOF
        print_warning "Please update the .env file with your Google Gemini API key!"
        echo "   Get your API key from: https://makersuite.google.com/app/apikey"
        echo ""
        echo "   Then run this script again."
        exit 1
    fi

    # Check if API key is set
    if grep -q "your-google-gemini-api-key-here" .env; then
        print_warning "Please set your Google Gemini API key in the .env file!"
        echo "   Get your API key from: https://makersuite.google.com/app/apikey"
        exit 1
    fi
}

# Function to start services efficiently
start_services() {
    print_status "Starting the system with Docker networking..."
    echo "   Services will run in containers but be accessible from your device"
    
    # Clean up any existing containers
    $COMPOSE_CMD down --remove-orphans 2>/dev/null || true
    
    # Build and start services with resource limits
    $COMPOSE_CMD up --build -d
    
    echo ""
    print_status "Waiting for services to start..."
    echo "   Backend is running migrations and setting up database..."
    sleep 10
    
    # Wait for backend to be ready (check if migrations are complete)
    print_status "Checking backend readiness..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:8000/api/v1/health/ > /dev/null 2>&1; then
            print_success "Backend is ready!"
            break
        elif [ $attempt -eq $max_attempts ]; then
            print_warning "Backend is taking longer than expected to start."
            echo "   This is normal for the first run as it's setting up the database."
            echo "   You can check the logs with: ./run.sh logs"
            break
        else
            echo "   Attempt $attempt/$max_attempts: Backend is still starting..."
            sleep 5
            attempt=$((attempt + 1))
        fi
    done
    
    # Check if services are running
    if $COMPOSE_CMD ps | grep -q "Up"; then
        echo ""
        print_success "System is running!"
        echo ""
        echo "🌐 Access the application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8000"
        echo ""
        echo "📊 To see logs: ./run.sh logs"
        echo "🛑 To stop: ./run.sh stop"
        echo ""
        echo "💡 Docker Networking Benefits:"
        echo "   - Services run in isolated containers"
        echo "   - Accessible from your local device"
        echo "   - Resource limits prevent system lag"
        echo "   - Automatic cache building"
        echo ""
        echo "🎉 Enjoy using the University Recommendation System!"
    else
        print_error "Failed to start services. Check logs:"
        $COMPOSE_CMD logs
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    $COMPOSE_CMD logs -f
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    $COMPOSE_CMD down
    print_success "Services stopped!"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    $COMPOSE_CMD restart
    print_success "Services restarted!"
}

# Function to check status
check_status() {
    print_status "Checking service status..."
    echo ""
    echo "Service Status:"
    $COMPOSE_CMD ps
    echo ""
    echo "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""
    echo "Network Ports:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:8000"
    echo ""
    echo "Service Logs (last 10 lines each):"
    $COMPOSE_CMD logs --tail=10
}

# Function to show help
show_help() {
    echo "🎓 University Recommendation System - Docker Setup"
    echo "================================================"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  (no args)    Start the system (default)"
    echo "  logs         Show service logs"
    echo "  stop         Stop all services"
    echo "  restart      Restart all services"
    echo "  status       Check service status and resource usage"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Start the system"
    echo "  $0 logs         # Show logs"
    echo "  $0 stop         # Stop services"
    echo "  $0 status       # Check status and resources"
    echo ""
    echo "💡 Docker Networking:"
    echo "  - Services run in isolated containers"
    echo "  - Accessible from your local device via localhost"
    echo "  - Resource limits prevent system lag"
    echo "  - Automatic cache building on first run"
}

# Main script logic
case "${1:-start}" in
    "start"|"")
        echo "🎓 University Recommendation System - Docker Setup"
        echo "================================================"
        check_prerequisites
        check_resources
        setup_environment
        start_services
        ;;
    "logs")
        detect_compose_command
        show_logs
        ;;
    "stop")
        detect_compose_command
        stop_services
        ;;
    "restart")
        detect_compose_command
        restart_services
        ;;
    "status")
        detect_compose_command
        check_status
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
