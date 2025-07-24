import axios from 'axios';
import { logger } from '../utils/logger';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000; // 30 seconds timeout

// Add request interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503) {
      // System is initializing
      logger.warn('System is initializing, please wait...');
    } else if (error.response?.status === 500) {
      logger.error('Server error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      logger.error('Cannot connect to server. Please check if the backend is running.');
    }
    return Promise.reject(error);
  }
);

// Type definitions
export interface AvailableOptions {
  programs: string[];
  countries: string[];
  previous_degrees: string[];
  previous_courses: string[];
}

export interface UserPreferences {
  desired_program: string;
  program_level: string;
  program_type?: string;
  preferred_countries: string[];
  preferred_locations?: string[];
  max_tuition_usd?: number;
  preferred_currency?: string;
  min_global_rank?: number;
  university_types?: string[];
  gpa?: number;
  test_scores?: Record<string, any>;
  additional_preferences?: string;
}

export interface UniversityRecommendation {
  university_name: string;
  program_name: string;
  country: string;
  tuition_fee_usd?: number;
  global_rank?: number;
  match_percentage: number;
  reasoning: string;
  location?: string;
  program_duration?: string;
  application_deadline?: string;
  language_requirements?: string;
  // Additional fields that might be available
  course_name?: string;
  parent_course?: string;
  course_program_label?: string;
  university_id?: string;
  course_id?: string;
  university_slug?: string;
  program_level?: string;
  program_type?: string;
  credential?: string;
  tuition_local?: number;
  university_type?: string;
  currency?: string;
  is_partner?: boolean;
  is_published?: boolean;
  university_views?: number;
  scholarship_count?: number;
  is_gre_required?: string;
  tuition_affordability?: number;
  university_quality?: number;
  country_popularity?: number;
  similarity_score?: number;
  relevance_score?: number;
}

// API Service
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Token ${token}` } : {};
  }

  async getAvailableOptions(): Promise<AvailableOptions> {
    try {
      const response = await axios.get('/available-options/');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch available options:', error);
      throw new Error(error.response?.data?.message || 'Failed to load available options');
    }
  }

  async getRecommendations(preferences: UserPreferences): Promise<{ recommendations: UniversityRecommendation[]; search_duration_ms: number; submission_id?: number }> {
    try {
      const response = await axios.post('/recommendations/', preferences);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }

  async getUserSubmissions(): Promise<{ submissions: any[] }> {
    try {
      const response = await axios.get('/user-submissions/');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to fetch user submissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to load user submissions');
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 