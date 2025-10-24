import { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 5000 }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  if (!isVisible && !isAnimating) return null

  const isSuccess = type === 'success'
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50'
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200'
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800'
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600'

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
      isAnimating ? 'animate-in slide-in-from-right-4 duration-300' : 'animate-out slide-out-to-right-4 duration-300'
    }`}>
      <div className={`${bgColor} ${borderColor} border rounded-xl p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${iconColor}`}>
            {isSuccess ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast
