// Authentication service with JWT token management
class AuthService {
  constructor() {
    this.tokenKey = 'campus_safety_token'
    this.userKey = 'campus_safety_user'
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
  }

  // Login with email and password
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      this.setToken(data.token)
      this.setUser(data.user)
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      this.setToken(data.token)
      this.setUser(data.user)
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Logout user
  logout() {
    this.removeToken()
    this.removeUser()
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem(this.userKey)
    return user ? JSON.parse(user) : null
  }

  // Token management
  setToken(token) {
    localStorage.setItem(this.tokenKey, token)
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey)
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  removeUser() {
    localStorage.removeItem(this.userKey)
  }

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Make authenticated API request
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401) {
      this.logout()
      throw new Error('Session expired. Please login again.')
    }

    return response
  }
}

export default new AuthService()
