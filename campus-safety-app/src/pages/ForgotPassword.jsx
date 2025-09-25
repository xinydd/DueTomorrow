import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      requirements: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep(2)
      // In real app, you would send OTP to email here
      console.log('OTP sent to:', email)
    }, 1500)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false)
      if (otp === '123456') { // Demo OTP
        setStep(3)
      } else {
        setError('Invalid OTP. Please try again.')
      }
    }, 1000)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const passwordValidation = validatePassword(newPassword)
    
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    
    // Simulate password reset
    setTimeout(() => {
      setLoading(false)
      setStep(4)
    }, 1500)
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const resendOtp = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setError('')
      // In real app, resend OTP
      console.log('OTP resent to:', email)
    }, 1000)
  }

  const passwordRequirements = validatePassword(newPassword).requirements

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
          <div className="w-24 h-24 bg-blue-800 rounded-full flex items-center justify-center relative">
            <div className="relative">
              <div className="absolute -left-6 -top-2 w-8 h-6 bg-blue-400 rounded-l-full transform -rotate-12"></div>
              <div className="absolute -right-6 -top-2 w-8 h-6 bg-blue-400 rounded-r-full transform rotate-12"></div>
              <div className="w-8 h-10 bg-blue-300 rounded-t-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-bold text-white bg-blue-800 px-2 py-1 rounded-full">DueTomorrow</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-blue-800">Campus Safety App</h1>
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
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= stepNumber 
                    ? 'bg-blue-800 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-1 mx-1 ${
                    step > stepNumber ? 'bg-blue-800' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-2">Reset Password</h2>
              <p className="text-green-800">Enter your email address to receive reset instructions</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <input
                  className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-2">Verify OTP</h2>
              <p className="text-green-800">We've sent a 6-digit code to {email}</p>
              <p className="text-sm text-gray-600 mt-2">Demo OTP: 123456</p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <input
                  className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 text-center text-2xl tracking-widest"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  maxLength="6"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="text-blue-800 hover:text-blue-600 text-sm font-semibold"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-2">Create New Password</h2>
              <p className="text-green-800">Enter a strong password for your account</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 pr-12"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 pr-12"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{passwordRequirements.minLength ? '✓' : '✗'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{passwordRequirements.hasUpperCase ? '✓' : '✗'}</span>
                      One uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{passwordRequirements.hasLowerCase ? '✓' : '✗'}</span>
                      One lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{passwordRequirements.hasNumbers ? '✓' : '✗'}</span>
                      One number
                    </li>
                    <li className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-2">{passwordRequirements.hasSpecialChar ? '✓' : '✗'}</span>
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !validatePassword(newPassword).isValid || newPassword !== confirmPassword}
                className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-green-800 mb-2">Password Updated!</h2>
              <p className="text-green-800">Your password has been successfully updated. You can now sign in with your new password.</p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Back Button */}
        {step < 4 && (
          <div className="text-center mt-6">
            <button
              onClick={handleBackToLogin}
              className="text-green-800 hover:text-green-600 text-sm font-semibold"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
