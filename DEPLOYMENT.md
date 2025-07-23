# 🚀 Deployment Guide

This guide covers deploying UniFinder to various platforms and environments.

## 📋 Prerequisites

- Git
- Python 3.8+
- Node.js 16+
- PostgreSQL (for production)
- Google Gemini API key

## 🌐 Platform Options

### 1. Heroku Deployment

#### Backend Setup
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-unifinder-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set GOOGLE_API_KEY=your-gemini-api-key
heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com

# Deploy backend
cd backend
git subtree push --prefix backend heroku main
```

#### Frontend Setup
```bash
# Build frontend
cd client
npm run build

# Deploy to Netlify/Vercel
# Upload dist/ folder contents
```

### 2. DigitalOcean App Platform

#### Backend Configuration
```yaml
# app.yaml
name: unifinder-backend
services:
- name: web
  source_dir: /backend
  github:
    repo: yourusername/unifinder
    branch: main
  run_command: gunicorn university_recommender.wsgi:application
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: SECRET_KEY
    value: your-secret-key
  - key: DEBUG
    value: "False"
  - key: GOOGLE_API_KEY
    value: your-gemini-api-key
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
```

#### Frontend Configuration
```yaml
# app.yaml
name: unifinder-frontend
services:
- name: web
  source_dir: /client
  github:
    repo: yourusername/unifinder
    branch: main
  run_command: npm run preview
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### 3. AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB Application**
```bash
cd backend
eb init -p python-3.8 unifinder-backend
eb create unifinder-production
```

3. **Configure Environment**
```bash
eb setenv SECRET_KEY=your-secret-key
eb setenv DEBUG=False
eb setenv GOOGLE_API_KEY=your-gemini-api-key
```

4. **Deploy**
```bash
eb deploy
```

#### Frontend on S3 + CloudFront
```bash
# Build frontend
cd client
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Configure CloudFront for CDN
```

### 4. Docker Deployment

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "university_recommender.wsgi:application"]
```

#### Frontend Dockerfile
```dockerfile
# client/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your-secret-key
      - DEBUG=False
      - GOOGLE_API_KEY=your-gemini-api-key
    depends_on:
      - db

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=unifinder
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔧 Production Configuration

### Environment Variables
```env
# Production Settings
SECRET_KEY=your-super-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Google Gemini AI
GOOGLE_API_KEY=your-gemini-api-key

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Django Settings for Production
```python
# settings.py
import os
from pathlib import Path

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### Frontend Production Build
```bash
# Build for production
npm run build

# Test production build
npm run preview
```

## 📊 Performance Optimization

### Backend
- **Caching**: Add Redis for session and cache storage
- **Database**: Use connection pooling
- **Static Files**: Serve via CDN
- **Gunicorn**: Configure workers based on CPU cores

### Frontend
- **Code Splitting**: Implement lazy loading
- **Image Optimization**: Use WebP format
- **CDN**: Serve assets from CDN
- **Caching**: Implement service workers

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection active
- [ ] Security headers set

## 📈 Monitoring

### Application Monitoring
- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **Logs**: Centralized logging

### Infrastructure Monitoring
- **AWS CloudWatch**: AWS monitoring
- **DigitalOcean**: Built-in monitoring
- **Heroku**: Add-on monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
```bash
# Check database connectivity
python manage.py dbshell
```

2. **Static Files**
```bash
# Collect static files
python manage.py collectstatic
```

3. **Environment Variables**
```bash
# Verify environment variables
python manage.py check --deploy
```

4. **Frontend Build Issues**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

For deployment issues:
- Check platform-specific documentation
- Review environment variable configuration
- Verify API key permissions
- Test locally before deploying

---

**Happy Deploying! 🚀** 