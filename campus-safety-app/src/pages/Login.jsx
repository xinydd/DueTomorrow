import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Loader2, Mail, CheckCircle, XCircle } from 'lucide-react'
import authService from '../services/auth.js'
import passwordResetService from '../services/passwordReset.js'

export default function Login() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Forgot password states
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState(null)

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/home')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For demo purposes, accept any credentials
      if (name && password) {
        // Simulate successful login
        const mockUser = {
          id: '1',
          name: name,
          email: `${name.toLowerCase()}@utm.my`,
          role: 'student'
        }
        
        // Store mock token and user
        localStorage.setItem('campus_safety_token', 'mock-jwt-token')
        localStorage.setItem('campus_safety_user', JSON.stringify(mockUser))
        
        navigate('/home')
      } else {
        setError('Please enter both name and password')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot password functions
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address')
      return
    }

    if (!passwordResetService.validateEmail(resetEmail)) {
      setResetError('Please enter a valid email address')
      return
    }

    setResetLoading(true)
    setResetError('')

    try {
      const result = await passwordResetService.requestPasswordReset(resetEmail)
      setResetSuccess(true)
      setResetToken(result.token) // For demo purposes
      setShowResetForm(true)
    } catch (error) {
      setResetError(error.message)
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match')
      return
    }

    const validation = passwordResetService.validatePassword(newPassword)
    if (!validation.isValid) {
      setResetError('Password must be at least 8 characters with uppercase, lowercase, and numbers')
      return
    }

    setResetLoading(true)
    setResetError('')

    try {
      await passwordResetService.resetPassword(resetEmail, resetToken, newPassword)
      setResetSuccess(true)
      setShowResetForm(false)
      setShowResetModal(false)
      // Reset all states
      setResetEmail('')
      setResetToken('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordValidation(null)
    } catch (error) {
      setResetError(error.message)
    } finally {
      setResetLoading(false)
    }
  }

  const handleNewPasswordChange = (password) => {
    setNewPassword(password)
    setPasswordValidation(passwordResetService.validatePassword(password))
  }

  const closeResetModal = () => {
    setShowResetModal(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
    setResetToken('')
    setShowResetForm(false)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordValidation(null)
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-dvh max-w-md mx-auto flex flex-col bg-gradient-to-b from-amber-50 to-teal-100">
      {/* Status Bar Dots */}
      <div className="flex justify-between px-6 pt-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
          <div className="w-2 h-2 bg-green-800 rounded-full"></div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="text-center pt-8 pb-4 bg-amber-50">
        <div className="relative mx-auto w-24 h-24 mb-4">
          {/* Logo Circle */}
          <div className="w-24 h-24 bg-blue-800 rounded-full flex items-center justify-center relative">
            {/* Shield with Wings */}
            <div className="relative">
              {/* Left Wing */}
              <div className="absolute -left-6 -top-2 w-8 h-6 bg-blue-400 rounded-l-full transform -rotate-12"></div>
              {/* Right Wing */}
              <div className="absolute -right-6 -top-2 w-8 h-6 bg-blue-400 rounded-r-full transform rotate-12"></div>
              {/* Shield */}
              <div className="w-8 h-10 bg-blue-300 rounded-t-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
          {/* DueTomorrow Text */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-bold text-white bg-blue-800 px-2 py-1 rounded-full">DueTomorrow</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-800">
          Campus Safety App
        </h1>
      </div>

      {/* Torn Paper Edge */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-8">
          <svg className="w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tornGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,0 Q25,8 50,0 T100,0 L100,32 L0,32 Z" fill="url(#tornGradient)" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Sign In</h2>
          {/*<p className="text-green-800">Sign in to continue</p>*/}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              disabled={loading}
              required
            />
          </div>

          <div className="relative">
            <input
              className="w-full px-4 py-3 pr-12 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Login'
            )}
          </button>

        </form>

        <div className="text-center mt-6">
          <button
            className="text-green-800 underline hover:text-green-600 text-sm font-semibold"
            onClick={() => setShowResetModal(true)}
          >
            Forgot Password ?
          </button>
        </div>

        {/* Enhanced Forgot Password Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                <button
                  onClick={closeResetModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {!showResetForm ? (
                // Email Input Step
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Enter your email</p>
                      <p className="text-xs text-blue-600">We'll send you reset instructions</p>
                    </div>
                  </div>

                  {resetError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-red-600 text-sm">{resetError}</span>
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value)
                        if (resetError) setResetError('')
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={resetLoading}
                    />
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    disabled={resetLoading || !resetEmail}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        Send Reset Instructions
                      </>
                    )}
                  </button>
                </div>
              ) : (
                // Password Reset Step
                <div className="space-y-4">
                  {resetSuccess && !showResetForm ? (
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <CheckCircle size={48} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-green-800">Email Sent!</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Check your email for reset instructions. For demo purposes, your reset token is:
                        </p>
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          <code className="text-xs break-all">{resetToken}</code>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowResetForm(true)}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                      >
                        Continue to Reset Password
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle size={20} className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Reset Token Received</p>
                          <p className="text-xs text-green-600">Enter your new password</p>
                        </div>
                      </div>

                      {resetError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="text-red-600 text-sm">{resetError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => handleNewPasswordChange(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={resetLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        
                        {passwordValidation && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className={passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}>
                                At least 8 characters
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className={passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                                Uppercase letter
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className={passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                                Lowercase letter
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${passwordValidation.hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span className={passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}>
                                Number
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={resetLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowResetForm(false)}
                          className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                          disabled={resetLoading}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleResetPassword}
                          disabled={resetLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || !passwordValidation?.isValid}
                          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {resetLoading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-green-800">
            Don't have an account?{' '}
            <button
              className="text-blue-800  hover:text-blue-600 font-bold"
              onClick={handleSignup}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}


