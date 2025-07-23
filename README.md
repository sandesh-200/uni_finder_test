# 🎓 UniFinder - AI-Powered University Recommendation System

UniFinder is an intelligent university recommendation platform that helps students find the perfect university based on their qualifications, preferences, and budget using advanced AI technology.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Recommendations**: Uses LangChain and Google Gemini AI for intelligent university matching
- **Smart Search**: Searchable dropdowns for courses, countries, and academic backgrounds
- **Personalized Results**: Recommendations based on GPA, budget, country preferences, and more
- **Real-time Processing**: Fast recommendation generation with detailed reasoning
- **🆕 Robust Initialization**: Automatic cache creation with real-time status monitoring

### 🔐 Authentication System
- **User Registration & Login**: Secure authentication with Django REST Framework
- **Profile Management**: User profiles with extended information
- **Password Reset**: Secure password recovery system
- **Login History**: Track user login activities

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Sticky Navigation**: Always accessible navigation bar
- **Auto-scroll**: Automatic scrolling to results after form submission
- **Loading States**: Smooth loading indicators and transitions
- **🆕 System Status Monitoring**: Real-time initialization progress and health checks

### 📊 Data Management
- **User Submissions**: Track and store all user search queries and results
- **Search Analytics**: Monitor search duration and performance
- **Caching System**: Persistent cache for faster recommendations
- **🆕 Automatic Cache Creation**: No manual setup required for first-time users

## 🛠️ Tech Stack

### Backend
- **Django 4.2+**: Web framework
- **Django REST Framework**: API development
- **LangChain**: AI/ML integration
- **Google Gemini AI**: Embeddings and reasoning
- **FAISS**: Vector similarity search
- **PostgreSQL**: Database (configurable)

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Axios**: HTTP client

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/unifinder.git
   cd unifinder
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your Google Gemini API key
   ```

4. **Database Setup**
   ```bash
   python3 manage.py makemigrations
   python3 manage.py migrate
   python3 manage.py createsuperuser
   ```

5. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

6. **Run the Application**
   ```bash
   # Terminal 1 - Backend (cache will be created automatically)
   cd backend
   python3 manage.py runserver
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 🚀 First Time Setup

**🆕 NEW: Robust Initialization System**

The system now automatically handles first-time setup with real-time feedback:

1. **Automatic Cache Creation**: Vector store cache is created automatically on first startup
2. **Real-time Status**: Frontend shows initialization progress to users
3. **Graceful Handling**: No data loading failures during setup
4. **Clear Feedback**: Users see exactly what's happening during initialization

**What you'll see on first run:**
```
🚀 First-time setup detected. Creating vector store cache...
This may take 5-10 minutes on first run...
📦 Loading university data...
✅ Cache created successfully in 47.8 seconds
✅ Test recommendations generated: 3 results
🎉 System is now optimized for fast startup!
```

**Frontend will show:**
- "System Initializing" → "System Ready" status
- Form disabled until system is ready
- Clear progress indicators
- Automatic data loading when ready

**For detailed setup instructions and troubleshooting, see:**
📖 **[ROBUST_SETUP.md](ROBUST_SETUP.md)** - Comprehensive guide for reliable system setup

   - Admin Panel: http://localhost:8000/admin

## 📁 Project Structure

```
unifinder/
├── backend/
│   ├── authentication/          # User authentication system
│   ├── recommendations/         # AI recommendation logic
│   ├── university_recommender/  # Django project settings
│   ├── cleaned_combined_dataset.json  # University data
│   ├── vector_store_cache/     # 🆕 Automatic cache storage
│   └── requirements.txt
├── client/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── SystemStatus.tsx  # 🆕 System monitoring
│   │   │   └── TellUs.tsx        # Updated with status integration
│   │   ├── contexts/           # React contexts
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services (🆕 Enhanced)
│   │   └── types/              # TypeScript types
│   └── package.json
├── ROBUST_SETUP.md             # 🆕 Detailed setup guide
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/unifinder

# Google Gemini AI
GOOGLE_API_KEY=your-gemini-api-key

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### API Endpoints

#### System Health
- `GET /api/v1/health/` - 🆕 System status and cache readiness

#### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

#### Recommendations
- `GET /api/v1/available-options/` - Get available options
- `POST /api/v1/recommendations/` - Get university recommendations
- `GET /api/v1/user-submissions/` - Get user search history

## 🎯 Usage

### For Students
1. **Register/Login**: Create an account or sign in
2. **Wait for System**: 🆕 System will show initialization status
3. **Fill Preferences**: Enter your academic background, desired program, and preferences
4. **Get Recommendations**: Receive personalized university suggestions
5. **Review Results**: View detailed university information and reasoning

### For Administrators
1. **Access Admin Panel**: Use Django admin at `/admin`
2. **Monitor Submissions**: View user search history and analytics
3. **Manage Users**: Handle user accounts and profiles
4. **System Analytics**: Monitor recommendation performance
5. **🆕 System Health**: Check cache status and system readiness

## 🔒 Security Features

- **Token Authentication**: Secure API access
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API request throttling

## 📈 Performance

- **Caching**: FAISS vector store with persistent cache
- **🆕 Automatic Cache Creation**: No manual setup required
- **🆕 Health Monitoring**: Real-time system status
- **Optimized Queries**: Efficient database operations
- **Lazy Loading**: Frontend component optimization
- **CDN Ready**: Static asset optimization

## 🛡️ Error Handling

### 🆕 Robust Error Management
- **Initialization Failures**: Graceful degradation with clear messages
- **Cache Issues**: Automatic retry with fallback options
- **API Failures**: User-friendly error messages
- **Connection Problems**: Automatic retry with exponential backoff

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For providing the AI capabilities
- **LangChain**: For the AI framework
- **Django & React**: For the robust web framework
- **Tailwind CSS**: For the beautiful styling

## 📞 Support

- **Email**: info@unifinder.com
- **Documentation**: [Wiki](https://github.com/yourusername/unifinder/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/unifinder/issues)
- **🆕 Setup Guide**: [ROBUST_SETUP.md](ROBUST_SETUP.md)

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Starring the repository
- Following releases
- Joining our community discussions

---

**Made with ❤️ for students worldwide**

**🆕 Now with robust initialization for seamless first-time setup!** 