import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    navigate('/home')
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
      <div className="flex-1 px-4 py-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-green-800 mb-2">Create New Account</h2>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              className="w-full px-4 py-3 bg-amber-50 border-0 rounded-xl text-green-800 placeholder-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            className="w-full bg-blue-800 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            type="submit"
          >
            Sign Up
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
