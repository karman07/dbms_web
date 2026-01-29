import axiosInstance from '@/lib/axios';
import { AuthResponse, RegisterUserDto, LoginDto, FirebaseLoginDto } from '@/types/user';

class AuthService {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(data: RegisterUserDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
    }
    
    return response.data;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
    }
    
    return response.data;
  }

  /**
   * Firebase login
   * POST /auth/firebase-login
   */
  async firebaseLogin(data: FirebaseLoginDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/firebase-login', data);
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
    }
    
    return response.data;
  }

  /**
   * Logout user (client-side only)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
  }

  /**
   * Get current user from local storage
   */
  getCurrentUser(): AuthResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
