import { API_CONFIG } from '../config/api.js'

// Authentication service for handling login, signup, and token management
class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.token = localStorage.getItem('authToken')
    this.user = JSON.parse(localStorage.getItem('user') || 'null')
  }

  // Set authentication token and user data
  setAuth(token, user) {
    this.token = token
    this.user = user
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // Clear authentication data
  clearAuth() {
    this.token = null
    this.user = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Get auth token
  getToken() {
    return this.token
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.role === role
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.includes(this.user?.role)
  }

  // Sign up new user
  async signup(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      // Set authentication data
      this.setAuth(data.data.token, data.data.user)

      return data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Set authentication data
      this.setAuth(data.data.token, data.data.user)

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout user
  logout() {
    this.clearAuth()
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ token: this.token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile')
      }

      return data
    } catch (error) {
      console.error('Profile error:', error)
      throw error
    }
  }

  // Make authenticated API request
  async authenticatedRequest(url, options = {}) {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, config)
      const data = await response.json()

      if (!response.ok) {
        const error = new Error(data.message || 'Request failed')
        error.response = response
        error.data = data
        throw error
      }

      return data
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const authService = new AuthService()
export default authService
