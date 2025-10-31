import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSecurity } from '../state/SecurityContext.jsx'
import HeySafeLogo from '../components/HeySafeLogo.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useSecurity()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signup(formData)
      navigate('/home')
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    navigate('/login')
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
      <div className="flex-1 px-4 py-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Create New Account</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              minLength="6"
              required
            />
          </div>

          {/* Role Selection (students only) */}
          <div>
            <label className="block text-green-800 text-sm font-medium mb-2">
              Account Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={true}
                  readOnly
                  className="mt-1 text-blue-800"
                />
                <div className="flex-1">
                  <div className="text-green-800 font-medium">Student</div>
                  <div className="text-green-600 text-sm">Report incidents and request help</div>
                </div>
              </label>
              <div className="text-[13px] text-green-700">
                Staff and Security accounts are created by administrators. Please use
                the Login page with your assigned credentials.
              </div>
            </div>
          </div>

          <button 
            className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-green-800">
            Already have an account?{' '}
            <button 
              className="text-blue-800 hover:text-blue-600 font-bold"
              onClick={handleLogin}
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
