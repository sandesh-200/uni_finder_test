# 🎓 University Recommendation System

An intelligent AI-powered university recommendation system that helps students find the perfect university based on their preferences, using LangChain, Google Gemini AI, and advanced vector similarity search.

## ✨ Features

### 🧠 AI-Powered Recommendations
- **Intelligent Matching**: Uses LangChain with Google Gemini AI for smart recommendations
- **Vector Similarity Search**: FAISS-based similarity search for accurate matches
- **Dynamic Reasoning**: AI-generated explanations for each recommendation
- **Match Percentage**: Precise matching scores based on user preferences

### 🔧 System Features
- **Robust Initialization**: Automatic cache creation and system health monitoring
- **Real-time Processing**: Fast recommendation generation with fallback reasoning
- **Comprehensive Data**: 25+ fields including tuition, rankings, scholarships, and more
- **Dynamic Options**: Program and country lists generated from actual dataset

### 👤 User Experience
- **Modern UI**: React with TypeScript, Tailwind CSS, and responsive design
- **Smart Forms**: Searchable dropdowns with real-time validation
- **Detailed Cards**: Complete university information with reasoning
- **Error Handling**: Graceful error handling with user-friendly messages

### 🔐 Authentication System
- **Secure Registration**: Comprehensive validation with detailed error messages
- **Robust Login**: Field-specific error handling and user feedback
- **Password Management**: Strength validation and reset functionality
- **Profile Management**: User profile and submission history

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API Key

### 1. Clone and Setup
```bash
git clone <repository-url>
cd university-recommendation-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set your Google Gemini API key
export GEMINI_API_KEY="your-api-key-here"

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📊 System Architecture

### Backend Stack
- **Django 4.2+**: Web framework with REST API
- **Django REST Framework**: API development
- **LangChain**: AI/ML framework for recommendations
- **Google Gemini AI**: Advanced language model
- **FAISS**: Vector similarity search
- **SQLite/PostgreSQL**: Database (dev/prod)

### Frontend Stack
- **React 18**: UI framework with TypeScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

### AI/ML Components
- **Vector Store**: FAISS-based similarity search
- **Embeddings**: Google Gemini embedding model
- **Reasoning Engine**: AI-generated explanations
- **Match Algorithm**: Multi-factor preference matching

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
GEMINI_API_KEY=your-google-gemini-api-key
DEBUG=True
SECRET_KEY=your-django-secret-key
DATABASE_URL=your-database-url

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### API Endpoints
- `GET /api/v1/health/` - System health check
- `GET /api/v1/available-options/` - Dynamic dropdown options
- `POST /api/v1/recommendations/` - Get university recommendations
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `GET /api/v1/auth/profile/` - User profile

## 📈 Performance & Scalability

### Caching System
- **Vector Store Cache**: FAISS index for fast similarity search
- **Automatic Cache Creation**: Built on first startup
- **Cache Persistence**: Survives server restarts
- **Background Processing**: Non-blocking cache building

### Production Features
- **Health Monitoring**: Real-time system status
- **Error Handling**: Graceful degradation
- **Logging**: Structured logging with proper levels
- **Performance Metrics**: Search duration and accuracy tracking

## 🛠️ Development

### Project Structure
```
university-recommendation-system/
├── backend/
│   ├── recommendations/
│   │   ├── langchain_service_fast.py  # AI recommendation service
│   │   ├── views.py                   # API endpoints
│   │   ├── models.py                  # Database models
│   │   └── serializers.py            # Data serialization
│   ├── authentication/                # User auth system
│   └── manage.py
├── client/
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── services/                 # API services
│   │   └── utils/                    # Utilities
│   └── package.json
└── cleaned_combined_dataset.json     # University data
```

### Key Components

#### Backend Service (`langchain_service_fast.py`)
- **Data Loading**: Processes university dataset
- **Vector Search**: FAISS-based similarity search
- **Recommendation Engine**: AI-powered matching
- **Reasoning Generation**: Intelligent explanations

#### Frontend Components
- **TellUs**: Main recommendation form
- **SearchableDropdown**: Dynamic option selection
- **Recommendation Cards**: University display cards
- **Auth Components**: Login/registration forms

## 🔍 Data Fields

The system includes comprehensive university data:

### Core Information
- University name, ID, slug
- Course name, program label, level
- Location, country, global rank

### Financial Information
- Tuition (USD and local currency)
- Tuition affordability score
- Scholarship count

### Academic Details
- Program type and credential
- GRE requirements
- University quality score

### Analytics
- University views and popularity
- Country popularity
- Partner status

## 🚀 Deployment

### Local Development
```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd client
npm run dev
```

### Production Deployment
```bash
# Backend
cd backend
python manage.py collectstatic
gunicorn university_recommender.wsgi:application

# Frontend
cd client
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd client
npm test
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health/

# Test recommendations
curl -X POST http://localhost:8000/api/v1/recommendations/ \
  -H "Content-Type: application/json" \
  -d '{"desired_program": "Computer Science", "program_level": "Master"}'
```

## 📝 Logging & Monitoring

### Logging Levels
- **ERROR**: System failures and critical issues
- **WARNING**: Missing data and validation issues
- **INFO**: Performance metrics and user activity
- **DEBUG**: Development-only detailed information

### Monitoring
- **Health Checks**: System status monitoring
- **Performance Metrics**: Search duration tracking
- **Error Tracking**: Structured error logging
- **User Analytics**: Search patterns and preferences

## 🔧 Troubleshooting

### Common Issues

#### System Initialization
```bash
# Check if cache exists
ls -la backend/vector_store_cache/

# Rebuild cache if needed
rm -rf backend/vector_store_cache/
python manage.py runserver
```

#### API Connection Issues
```bash
# Check backend status
curl http://localhost:8000/api/v1/health/

# Check CORS settings
# Ensure frontend URL is in CORS_ALLOWED_ORIGINS
```

#### Frontend Issues
```bash
# Clear node modules
rm -rf node_modules/
npm install

# Check API base URL
# Verify VITE_API_BASE_URL in .env
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **Python**: PEP 8, type hints, docstrings
- **TypeScript**: ESLint, Prettier, strict mode
- **React**: Functional components, hooks
- **Testing**: Unit tests for critical functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced language model capabilities
- **LangChain** for AI/ML framework
- **FAISS** for efficient vector similarity search
- **Django** and **React** communities for excellent frameworks

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the system status endpoint

---

**Built with ❤️ for students worldwide** 