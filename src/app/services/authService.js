// services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/constants';

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthService {
constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
}

/**
 * Process the authentication response and store tokens/user data
 * @param {Object} response - API response
 * @returns {Promise<Object>} User data
 */
async processAuthResponse(response) {
    if (!response || !response.data) {
    throw new Error('Invalid authentication response');
    }

    const { token, refreshToken, user } = response.data;

    if (!token || !user) {
    throw new Error('Missing token or user data in response');
    }

    // Store tokens and user data
    await this.setAuthToken(token);
    if (refreshToken) {
    await this.setRefreshToken(refreshToken);
    }
    await this.setUserData(user);

    return user;
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
async login(email, password) {
    try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
    }

    const data = await response.json();
    return await this.processAuthResponse(data);
    } catch (error) {
    console.error('Login error:', error);
    throw error;
    }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data
 */
async register(userData) {
    try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
    }

    const data = await response.json();
    return await this.processAuthResponse(data);
    } catch (error) {
    console.error('Registration error:', error);
    throw error;
    }
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
async logout() {
    try {
    const token = await this.getAuthToken();
    
    // Call logout endpoint if token exists
    if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        }).catch(() => {}); // Ignore errors on logout call
    }

    // Clear local storage
    await this.clearAuthData();
    } catch (error) {
    console.error('Logout error:', error);
    await this.clearAuthData(); // Ensure data is cleared even on error
    throw error;
    }
}

/**
 * Refresh authentication token
 * @returns {Promise<string>} New auth token
 */
async refreshToken() {
    if (this.isRefreshing) {
    return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
    });
    }

    this.isRefreshing = true;

    try {
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.token) {
        throw new Error('No token in refresh response');
    }

    await this.setAuthToken(data.token);
    
    // Process any queued requests
    this.failedQueue.forEach(({ resolve }) => resolve(data.token));
    this.failedQueue = [];

    return data.token;
    } catch (error) {
    // Process any queued requests with error
    this.failedQueue.forEach(({ reject }) => reject(error));
    this.failedQueue = [];
    
    // Clear auth data if refresh fails
    await this.clearAuthData();
    throw error;
    } finally {
    this.isRefreshing = false;
    }
}

/**
 * Get authenticated user data
 * @returns {Promise<Object|null>} User data or null if not authenticated
 */
async getCurrentUser() {
    try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
    } catch (error) {
    console.error('Error getting user data:', error);
    return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Authentication status
 */
async isAuthenticated() {
    try {
    const token = await this.getAuthToken();
    return !!token;
    } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
    }
}

/**
 * Get authentication token
 * @returns {Promise<string|null>} Auth token or null
 */
async getAuthToken() {
    try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
    }
}

/**
 * Set authentication token
 * @param {string} token - Auth token
 * @returns {Promise<void>}
 */
async setAuthToken(token) {
    try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
    console.error('Error setting auth token:', error);
    throw error;
    }
}

/**
 * Get refresh token
 * @returns {Promise<string|null>} Refresh token or null
 */
async getRefreshToken() {
    try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
    }
}

/**
 * Set refresh token
 * @param {string} token - Refresh token
 * @returns {Promise<void>}
 */
async setRefreshToken(token) {
    try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
    console.error('Error setting refresh token:', error);
    throw error;
    }
}

/**
 * Set user data
 * @param {Object} userData - User data
 * @returns {Promise<void>}
 */
async setUserData(userData) {
    try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error) {
    console.error('Error setting user data:', error);
    throw error;
    }
}

/**
 * Clear all authentication data
 * @returns {Promise<void>}
 */
async clearAuthData() {
    try {
    await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
    ]);
    } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
    }
}

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
async resetPassword(email) {
    try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Password reset failed: ${response.status}`);
    }

    return await response.json();
    } catch (error) {
    console.error('Password reset error:', error);
    throw error;
    }
}

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
async changePassword(currentPassword, newPassword) {
    try {
    const token = await this.getAuthToken();
    
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Password change failed: ${response.status}`);
    }

    return await response.json();
    } catch (error) {
    console.error('Password change error:', error);
    throw error;
    }
}

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
async verifyEmail(token) {
    try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Email verification failed: ${response.status}`);
    }

    return await response.json();
    } catch (error) {
    console.error('Email verification error:', error);
    throw error;
    }
}

/**
 * Get auth headers for API requests
 * @returns {Promise<Object>} Headers object
 */
async getAuthHeaders() {
    const token = await this.getAuthToken();
    return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
    };
}
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export individual functions for convenience
export default authService;


// Usage Examples:
// javascript
// import authService from '../services/auth';

// // Login
// try {
//   const user = await authService.login('user@example.com', 'password123');
//   console.log('Logged in user:', user);
// } catch (error) {
//   console.error('Login failed:', error.message);
// }

// // Check authentication status
// const isAuthenticated = await authService.isAuthenticated();

// // Get current user
// const currentUser = await authService.getCurrentUser();

// // Logout
// await authService.logout();

// // Get auth headers for API calls
// const headers = await authService.getAuthHeaders();

// Key Features:
// Authentication Methods: Login, register, logout

// Token Management: JWT token storage and refresh mechanism

// User Data Storage: Secure storage of user information

// Password Operations: Reset and change password functionality

// Email Verification: Verify email addresses

// Error Handling: Comprehensive error handling and logging

// Queue System: Handles concurrent token refresh requests

// Storage Utilities: AsyncStorage integration for data persistence

// Auth Headers: Utility for API request authentication