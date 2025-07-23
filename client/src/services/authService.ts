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

export interface AuthStatus {
    authenticated: boolean;
    user?: User;
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

    async register(data: RegisterData): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/register/`, data);
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, {
                email,
                password
            });
            if (response.data.token) {
                this.setToken(response.data.token);
            }
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
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
            throw new Error(error.response?.data?.message || 'Failed to get profile');
        }
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        try {
            const response = await axios.put(`${API_BASE_URL}/profile/`, data, {
                headers: this.getHeaders()
            });
            return response.data.user;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
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
            throw new Error(error.response?.data?.message || 'Failed to change password');
        }
    }

    async requestPasswordReset(email: string): Promise<{ message: string; token: string }> {
        try {
            const response = await axios.post(`${API_BASE_URL}/password/reset/`, { email });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to request password reset');
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
            throw new Error(error.response?.data?.message || 'Failed to confirm password reset');
        }
    }

    async checkAuthStatus(): Promise<AuthStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth-status/`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            return { authenticated: false };
        }
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export const authService = new AuthService(); 