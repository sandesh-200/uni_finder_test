#!/bin/bash

# Simple run script for University Recommendation System
# For friends to easily run the system

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "   https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first:"
        echo "   https://docs.docker.com/compose/install/"
        exit 1
    fi
    
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
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ALLOWED_HOSTS=localhost,127.0.0.1,backend
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

# Function to start services
start_services() {
    print_status "Starting the system..."
    echo "   This may take a few minutes on first run..."
    
    # Build and start services
    docker-compose up --build -d
    
    echo ""
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
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
        echo "🎉 Enjoy using the University Recommendation System!"
    else
        print_error "Failed to start services. Check logs:"
        docker-compose logs
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped!"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_success "Services restarted!"
}

# Function to check status
check_status() {
    print_status "Checking service status..."
    echo ""
    echo "Service Status:"
    docker-compose ps
    echo ""
    echo "Service Logs (last 10 lines each):"
    docker-compose logs --tail=10
}

# Function to show help
show_help() {
    echo "🎓 University Recommendation System - Easy Setup"
    echo "================================================"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  (no args)    Start the system (default)"
    echo "  logs         Show service logs"
    echo "  stop         Stop all services"
    echo "  restart      Restart all services"
    echo "  status       Check service status"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Start the system"
    echo "  $0 logs         # Show logs"
    echo "  $0 stop         # Stop services"
    echo "  $0 status       # Check status"
}

# Main script logic
case "${1:-start}" in
    "start"|"")
        echo "🎓 University Recommendation System - Easy Setup"
        echo "================================================"
        check_prerequisites
        setup_environment
        start_services
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
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