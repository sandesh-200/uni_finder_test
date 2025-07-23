# 🔐 Authentication API Documentation

## Overview
This document describes the comprehensive authentication system built for the University Recommendation platform. The system provides secure user registration, login, profile management, and password reset functionality.

## 🏗️ Architecture

### Models
- **User**: Custom user model with email-based authentication
- **UserProfile**: Extended user profile with academic preferences
- **LoginHistory**: Track user login activity

### Features
- ✅ Email-based authentication
- ✅ Token-based API authentication
- ✅ Password validation and security
- ✅ Profile management
- ✅ Password reset functionality
- ✅ Login history tracking
- ✅ Terms and conditions acceptance
- ✅ Phone number validation

## 📋 API Endpoints

### Base URL
```
http://localhost:8000/api/v1/auth/
```

### 1. User Registration
**POST** `/register/`

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "+1234567890",
    "password": "securepassword123",
    "confirm_password": "securepassword123",
    "terms_accepted": true
}
```

**Response:**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890",
        "is_email_verified": false,
        "terms_accepted": true,
        "date_joined": "2024-01-01T00:00:00Z",
        "profile": {
            "current_education_level": "",
            "current_institution": "",
            "gpa": null,
            "preferred_countries": [],
            "preferred_programs": [],
            "budget_range": "",
            "login_count": 0
        }
    },
    "token": "your-auth-token"
}
```

### 2. User Login
**POST** `/login/`

**Request Body:**
```json
{
    "email": "john.doe@example.com",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "message": "Login successful",
    "user": {
        "id": "uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890",
        "is_email_verified": false,
        "terms_accepted": true,
        "date_joined": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-01T12:00:00Z",
        "profile": {
            "current_education_level": "",
            "current_institution": "",
            "gpa": null,
            "preferred_countries": [],
            "preferred_programs": [],
            "budget_range": "",
            "login_count": 1
        }
    },
    "token": "your-auth-token"
}
```

### 3. User Logout
**POST** `/logout/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Response:**
```json
{
    "message": "Logout successful"
}
```

### 4. Get User Profile
**GET** `/profile/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Response:**
```json
{
    "user": {
        "id": "uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "+1234567890",
        "is_email_verified": false,
        "terms_accepted": true,
        "date_joined": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-01T12:00:00Z",
        "profile": {
            "current_education_level": "Bachelor",
            "current_institution": "University of Example",
            "gpa": 3.8,
            "preferred_countries": ["United States", "Canada"],
            "preferred_programs": ["Computer Science", "Engineering"],
            "budget_range": "20000-50000",
            "login_count": 5
        }
    }
}
```

### 5. Update User Profile
**PUT** `/profile/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Smith",
    "phone_number": "+1234567890",
    "profile": {
        "current_education_level": "Master",
        "current_institution": "MIT",
        "gpa": 3.9,
        "preferred_countries": ["United States", "Canada", "United Kingdom"],
        "preferred_programs": ["Computer Science", "Data Science"],
        "budget_range": "30000-60000"
    }
}
```

**Response:**
```json
{
    "message": "Profile updated successfully",
    "user": {
        "id": "uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Smith",
        "phone_number": "+1234567890",
        "profile": {
            "current_education_level": "Master",
            "current_institution": "MIT",
            "gpa": 3.9,
            "preferred_countries": ["United States", "Canada", "United Kingdom"],
            "preferred_programs": ["Computer Science", "Data Science"],
            "budget_range": "30000-60000"
        }
    }
}
```

### 6. Change Password
**POST** `/password/change/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Request Body:**
```json
{
    "old_password": "currentpassword",
    "new_password": "newsecurepassword123",
    "confirm_password": "newsecurepassword123"
}
```

**Response:**
```json
{
    "message": "Password changed successfully. Please login again."
}
```

### 7. Request Password Reset
**POST** `/password/reset/`

**Request Body:**
```json
{
    "email": "john.doe@example.com"
}
```

**Response:**
```json
{
    "message": "Password reset email sent",
    "token": "reset-token-uuid"
}
```

### 8. Confirm Password Reset
**POST** `/password/reset/confirm/`

**Request Body:**
```json
{
    "token": "reset-token-uuid",
    "new_password": "newsecurepassword123",
    "confirm_password": "newsecurepassword123"
}
```

**Response:**
```json
{
    "message": "Password reset successful. Please login with your new password."
}
```

### 9. Get Login History
**GET** `/login-history/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Response:**
```json
{
    "login_history": [
        {
            "login_time": "2024-01-01T12:00:00Z",
            "ip_address": "192.168.1.1",
            "user_agent": "Mozilla/5.0...",
            "success": true
        }
    ]
}
```

### 10. Check Authentication Status
**GET** `/auth-status/`

**Headers:**
```
Authorization: Token your-auth-token
```

**Response:**
```json
{
    "authenticated": true,
    "user": {
        "id": "uuid",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

## 🔧 Frontend Integration

### Authentication Service (TypeScript)
```typescript
// authService.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1/auth';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    is_email_verified: boolean;
    terms_accepted: boolean;
    date_joined: string;
    last_login?: string;
    profile: UserProfile;
}

export interface UserProfile {
    current_education_level: string;
    current_institution: string;
    gpa?: number;
    preferred_countries: string[];
    preferred_programs: string[];
    budget_range: string;
    login_count: number;
}

export interface LoginResponse {
    message: string;
    user: User;
    token: string;
}

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    password: string;
    confirm_password: string;
    terms_accepted: boolean;
}

class AuthService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('auth_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    private getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Token ${token}` })
        };
    }

    async register(data: RegisterData): Promise<LoginResponse> {
        const response = await axios.post(`${API_BASE_URL}/register/`, data);
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response.data;
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await axios.post(`${API_BASE_URL}/login/`, {
            email,
            password
        });
        if (response.data.token) {
            this.setToken(response.data.token);
        }
        return response.data;
    }

    async logout(): Promise<void> {
        await axios.post(`${API_BASE_URL}/logout/`, {}, {
            headers: this.getHeaders()
        });
        this.clearToken();
    }

    async getProfile(): Promise<User> {
        const response = await axios.get(`${API_BASE_URL}/profile/`, {
            headers: this.getHeaders()
        });
        return response.data.user;
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await axios.put(`${API_BASE_URL}/profile/`, data, {
            headers: this.getHeaders()
        });
        return response.data.user;
    }

    async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/password/change/`, {
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        }, {
            headers: this.getHeaders()
        });
        this.clearToken(); // Force re-login
    }

    async requestPasswordReset(email: string): Promise<{ message: string; token: string }> {
        const response = await axios.post(`${API_BASE_URL}/password/reset/`, { email });
        return response.data;
    }

    async confirmPasswordReset(token: string, newPassword: string, confirmPassword: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/password/reset/confirm/`, {
            token,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
    }

    async checkAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth-status/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch {
            return { authenticated: false };
        }
    }
}

export const authService = new AuthService();
```

## 🚀 Usage Examples

### React Component Example
```typescript
import React, { useState, useEffect } from 'react';
import { authService, User } from './authService';

const LoginComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(email, password);
            console.log('Login successful:', response.user);
            // Redirect or update app state
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};
```

## 🔒 Security Features

- **Password Validation**: Django's built-in password validation
- **Token Authentication**: Secure token-based API authentication
- **Login History**: Track login attempts and IP addresses
- **Password Reset**: Secure token-based password reset
- **Terms Acceptance**: Required terms and conditions acceptance
- **Email Verification**: Framework for email verification (ready for implementation)

## 📊 Database Schema

### User Table
- `id` (UUID, Primary Key)
- `email` (Email, Unique)
- `first_name` (CharField)
- `last_name` (CharField)
- `phone_number` (CharField, Optional)
- `is_email_verified` (Boolean)
- `terms_accepted` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### UserProfile Table
- `user` (OneToOne to User)
- `current_education_level` (CharField)
- `current_institution` (CharField)
- `gpa` (DecimalField)
- `preferred_countries` (JSONField)
- `preferred_programs` (JSONField)
- `budget_range` (CharField)
- `login_count` (IntegerField)

### LoginHistory Table
- `user` (ForeignKey to User)
- `login_time` (DateTime)
- `ip_address` (IPAddressField)
- `user_agent` (TextField)
- `success` (BooleanField)

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

3. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

4. **Start Server**
   ```bash
   python manage.py runserver
   ```

## 🧪 Testing

Test the API endpoints using curl or Postman:

```bash
# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "confirm_password": "securepass123",
    "terms_accepted": true
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

## 📝 Notes

- The system uses email as the primary identifier instead of username
- All passwords are hashed using Django's secure password hashing
- Token authentication is used for API access
- Login history is automatically tracked
- Profile creation is automatic upon user registration
- Password reset tokens expire after 24 hours
- The system is ready for email verification implementation 