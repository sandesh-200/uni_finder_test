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
    success: boolean;
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

export interface AuthStatus {
    success: boolean;
    authenticated: boolean;
    user?: User;
    message?: string;
    error?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string>;
    error_type?: string;
    error?: string;
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

    private handleApiError(error: any): never {
        if (error.response?.data) {
            const apiError: ApiError = error.response.data;
            
            // Handle field-specific errors
            if (apiError.errors && Object.keys(apiError.errors).length > 0) {
                const errorMessages = Object.values(apiError.errors).join('. ');
                throw new Error(errorMessages);
            }
            
            // Handle general error messages
            if (apiError.message) {
                throw new Error(apiError.message);
            }
        }
        
        // Fallback error messages
        if (error.response?.status === 400) {
            throw new Error('Invalid request. Please check your input and try again.');
        } else if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please login again.');
        } else if (error.response?.status === 403) {
            throw new Error('Access denied. You do not have permission to perform this action.');
        } else if (error.response?.status === 404) {
            throw new Error('Resource not found. Please check your request.');
        } else if (error.response?.status === 500) {
            throw new Error('Server error. Please try again later.');
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error('Cannot connect to server. Please check your internet connection.');
        } else if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your internet connection.');
        } else {
            throw new Error('An unexpected error occurred. Please try again.');
        }
    }

    async register(data: RegisterData): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/register/`, data);
            
            if (response.data.success && response.data.token) {
                this.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, {
                email,
                password
            });
            
            if (response.data.success && response.data.token) {
                this.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async logout(): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/logout/`, {}, {
                headers: this.getHeaders()
            });
        } catch (error: any) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
        }
    }

    async getProfile(): Promise<User> {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile/`, {
                headers: this.getHeaders()
            });
            return response.data.user;
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        try {
            const response = await axios.put(`${API_BASE_URL}/profile/`, data, {
                headers: this.getHeaders()
            });
            return response.data.user;
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/password/change/`, {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            }, {
                headers: this.getHeaders()
            });
            this.clearToken(); // Force re-login
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async requestPasswordReset(email: string): Promise<{ message: string; token: string }> {
        try {
            const response = await axios.post(`${API_BASE_URL}/password/reset/`, { email });
            return response.data;
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async confirmPasswordReset(token: string, newPassword: string, confirmPassword: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/password/reset/confirm/`, {
                token,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
        } catch (error: any) {
            this.handleApiError(error);
        }
    }

    async checkAuthStatus(): Promise<AuthStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth-status/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            return { 
                success: false,
                authenticated: false,
                message: 'Authentication check failed'
            };
        }
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authService = new AuthService(); 