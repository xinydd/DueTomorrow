// Password reset service with email verification and security
class PasswordResetService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    this.resetTokens = new Map() // In-memory storage for demo
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      // Simulate API call
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }

      // For demo purposes, generate a reset token
      const resetToken = this.generateResetToken()
      this.resetTokens.set(email, {
        token: resetToken,
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        used: false
      })

      // Simulate sending email
      console.log(`Password reset email sent to: ${email}`)
      console.log(`Reset token: ${resetToken}`) // For demo purposes

      return {
        success: true,
        message: 'Password reset instructions sent to your email',
        token: resetToken // For demo purposes only
      }
    } catch (error) {
      console.error('Password reset error:', error)
      throw new Error('Failed to send password reset email. Please try again.')
    }
  }

  // Verify reset token
  async verifyResetToken(email, token) {
    try {
      const resetData = this.resetTokens.get(email)
      
      if (!resetData) {
        throw new Error('Invalid or expired reset token')
      }

      if (resetData.used) {
        throw new Error('Reset token has already been used')
      }

      if (Date.now() > resetData.expires) {
        this.resetTokens.delete(email)
        throw new Error('Reset token has expired')
      }

      if (resetData.token !== token) {
        throw new Error('Invalid reset token')
      }

      return { valid: true }
    } catch (error) {
      throw error
    }
  }

  // Reset password with token
  async resetPassword(email, token, newPassword) {
    try {
      // Verify token first
      await this.verifyResetToken(email, token)

      // Simulate API call
      const response = await fetch(`${this.baseURL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          token, 
          newPassword 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reset password')
      }

      // Mark token as used
      const resetData = this.resetTokens.get(email)
      if (resetData) {
        resetData.used = true
        this.resetTokens.set(email, resetData)
      }

      return {
        success: true,
        message: 'Password has been reset successfully'
      }
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  // Generate a secure reset token
  generateResetToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password strength
  validatePassword(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      strength: this.calculatePasswordStrength(password)
    }
  }

  // Calculate password strength
  calculatePasswordStrength(password) {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    return 'strong'
  }

  // Clean up expired tokens
  cleanupExpiredTokens() {
    const now = Date.now()
    for (const [email, data] of this.resetTokens.entries()) {
      if (now > data.expires) {
        this.resetTokens.delete(email)
      }
    }
  }

  // Get reset status for email
  getResetStatus(email) {
    const resetData = this.resetTokens.get(email)
    if (!resetData) return null

    return {
      hasToken: true,
      isExpired: Date.now() > resetData.expires,
      isUsed: resetData.used,
      expiresIn: Math.max(0, resetData.expires - Date.now())
    }
  }
}

export default new PasswordResetService()
