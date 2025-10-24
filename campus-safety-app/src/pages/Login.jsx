import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSecurity } from '../state/SecurityContext.jsx'
import HeySafeLogo from '../components/HeySafeLogo.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useSecurity()
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleDemoAccountSelect = (account) => {
    setCredentials({
      email: account.email,
      password: account.password
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(credentials)
      navigate('/home')
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
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

      {/* App Title */}
      <div className="text-center pt-8 pb-4 bg-amber-50">
        <HeySafeLogo size="large" showSubtitle={true} />
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="email"
              name="email"
              placeholder="Email Address"
              value={credentials.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </button>

        </form>

        <div className="text-center mt-6">
          <button
            className="text-green-800 underline hover:text-green-600 text-sm font-semibold"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password ?
          </button>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6">
          <button
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
          >
            {showDemoAccounts ? 'Hide Demo Accounts' : 'Show Demo Accounts'}
          </button>

          {showDemoAccounts && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-600 text-center mb-3">
                Click any account below to auto-fill login form
              </p>
              
              {[
                { role: 'student', name: 'Ahmad Student', email: 'ahmad@student.edu', password: 'student123' },
                { role: 'staff', name: 'Sarah Staff', email: 'sarah@staff.edu', password: 'staff123' },
                { role: 'security', name: 'Mike Security', email: 'mike@security.edu', password: 'security123' }
              ].map((account) => (
                <button
                  key={account.role}
                  onClick={() => handleDemoAccountSelect(account)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 capitalize">{account.role}</div>
                      <div className="text-sm text-gray-600">{account.name}</div>
                      <div className="text-xs text-gray-500">{account.email}</div>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Click to use
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

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


