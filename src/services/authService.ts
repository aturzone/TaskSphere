
import { getApiBaseUrl } from '../config/networkConfig';

interface AuthResponse {
  success: boolean;
  token?: string;
  username?: string;
  error?: string;
}

interface AuthStatus {
  isFirstTime: boolean;
  serverIP: string;
  ports: {
    frontend: number;
    backend: number;
  };
}

class AuthService {
  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  private async request(url: string, options?: RequestInit & { timeout?: number }) {
    try {
      const baseUrl = this.getBaseUrl();
      console.log(`Making auth request to: ${baseUrl}${url}`);
      
      const controller = new AbortController();
      const timeout = options?.timeout || 10000; // Default 10 second timeout
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('درخواست به علت timeout لغو شد. لطفاً اتصال شبکه و وضعیت سرور را بررسی کنید.');
        }
        console.error('Auth request failed:', error);
        throw error;
      }
      throw new Error('خطای ناشناخته در ارتباط با سرور');
    }
  }

  async getAuthStatus(): Promise<AuthStatus> {
    return this.request('/auth/status', { timeout: 5000 });
  }

  async setupFirstUser(username: string, password: string): Promise<AuthResponse> {
    return this.request('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      timeout: 15000, // Longer timeout for setup
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      timeout: 10000,
    });

    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('username', response.username);
    }

    return response;
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });
      } catch (error) {
        console.error('Logout request failed:', error);
        // Continue with local logout even if server request fails
      }
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      await this.request('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
