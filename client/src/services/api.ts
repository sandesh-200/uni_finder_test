import axios from 'axios';

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
      console.warn('System is initializing, retrying in 30 seconds...');
    }
    return Promise.reject(error);
  }
);

// Types
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
}

export interface SystemHealth {
  status: 'operational' | 'initializing' | 'error';
  message: string;
  cache_status: 'ready' | 'building' | 'error';
  ready: boolean;
  cache_exists?: boolean;
  programs_count?: number;
}

// API Service
class ApiService {
  private baseURL: string;
  private healthCheckInterval: number | null = null;
  private isSystemReady = false;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Token ${token}` } : {};
  }

  // Health check to verify system status
  async checkSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await axios.get(`${this.baseURL}/health/`);
      this.isSystemReady = response.data.ready;
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Unable to connect to system',
        cache_status: 'error',
        ready: false
      };
    }
  }

  // Wait for system to be ready with retry logic
  async waitForSystemReady(maxAttempts = 20, delayMs = 30000): Promise<boolean> {
    console.log('🔄 Checking if system is ready...');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const health = await this.checkSystemHealth();
        
        if (health.ready) {
          console.log('✅ System is ready!');
          this.isSystemReady = true;
          return true;
        }
        
        console.log(`⏳ System is still initializing (attempt ${attempt}/${maxAttempts})...`);
        console.log(`📊 Status: ${health.status}, Cache: ${health.cache_status}`);
        
        if (attempt < maxAttempts) {
          console.log(`⏰ Waiting ${delayMs/1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`❌ Health check attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.error('❌ System failed to initialize within expected time');
    return false;
  }

  // Start periodic health checks
  startHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.checkSystemHealth();
        this.isSystemReady = health.ready;
      } catch (error) {
        console.error('Health monitoring error:', error);
        this.isSystemReady = false;
      }
    }, 60000); // Check every minute
  }

  // Stop health monitoring
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Get available options for dropdowns
  async getAvailableOptions(): Promise<AvailableOptions> {
    try {
      // Check if system is ready first
      if (!this.isSystemReady) {
        const isReady = await this.waitForSystemReady();
        if (!isReady) {
          throw new Error('System is not ready. Please try again in a few minutes.');
        }
      }

      const response = await axios.get(`${this.baseURL}/available-options/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 503) {
        throw new Error('System is still initializing. Please wait a few minutes and try again.');
      }
      console.error('Error fetching available options:', error);
      throw new Error(error.response?.data?.message || 'Failed to load available options');
    }
  }

  // Get university recommendations
  async getRecommendations(preferences: UserPreferences): Promise<{ recommendations: UniversityRecommendation[]; search_duration_ms: number; submission_id?: number }> {
    try {
      // Check if system is ready first
      if (!this.isSystemReady) {
        const isReady = await this.waitForSystemReady();
        if (!isReady) {
          throw new Error('System is not ready. Please try again in a few minutes.');
        }
      }

      const response = await axios.post(`${this.baseURL}/recommendations/`, preferences, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 503) {
        throw new Error('System is still initializing. Please wait a few minutes and try again.');
      }
      console.error('Error fetching recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }

  // Get user submissions (search history)
  async getUserSubmissions(): Promise<{ submissions: any[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/user-submissions/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user submissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to load search history');
    }
  }

  // Check if system is currently ready
  isReady(): boolean {
    return this.isSystemReady;
  }
}

const apiService = new ApiService();
export default apiService; 