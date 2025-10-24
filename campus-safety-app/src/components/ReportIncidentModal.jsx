import { useState, useEffect } from 'react'
import { X, MapPin, AlertTriangle, Flag, Loader2 } from 'lucide-react'
import authService from '../services/authService'

const ReportIncidentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    lat: '',
    lng: '',
    priority: 'medium'
  })
  const [locationStatus, setLocationStatus] = useState('idle') // idle, loading, success, error
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const incidentTypes = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'theft', label: 'Theft' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'accident', label: 'Accident' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ]

  // Get current location automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      getCurrentLocation()
    }
  }, [isOpen])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        }))
        setLocationStatus('success')
      },
      (error) => {
        console.error('Geolocation error:', error)
        setLocationStatus('error')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.type) {
      newErrors.type = 'Please select an incident type'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    if (!formData.lat || !formData.lng) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateForm()) return
  
    setIsSubmitting(true)
  
    try {
      const response = await authService.authenticatedRequest('/api/report', {
        method: 'POST',
        body: JSON.stringify({
          type: formData.type,
          description: formData.description.trim(),
          location: {
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng)
          },
          priority: formData.priority
        })
      })
  
      // ✅ Demo success message
      onSuccess('✅ Your report has been submitted successfully. (Demo mode)')
  
      // Reset form and close
      setFormData({
        type: '',
        description: '',
        lat: '',
        lng: '',
        priority: 'medium'
      })
      setLocationStatus('idle')
      onClose()
  
    } catch (error) {
      console.error('Report submission error:', error)
  
      let message = '⚠️ Failed to submit report. Please try again later.'
  
      try {
        // Check backend error message
        if (error.data?.message) {
          message = `⚠️ ${error.data.message}`
        } else if (error.message) {
          message = `⚠️ ${error.message}`
        }
  
        if (error.response?.status) {
          const statusMessages = {
            401: 'Unauthorized: Please log in again',
            403: 'Forbidden: Only students can submit reports',
            400: 'Invalid data: Please check your input',
            500: 'Server error: Could not save report',
            503: 'Service unavailable: Please try again later'
          }
          if (statusMessages[error.response.status] && !error.data?.message) {
            message = `⚠️ ${statusMessages[error.response.status]}`
          }
        }
      } catch (parseError) {
        console.warn('Error parsing backend response:', parseError)
      }
  
      // ✅ Call it (don’t use braces)
      onSuccess(message)
  
    } finally {
      setIsSubmitting(false)
    }
  }
  
  

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: '',
        description: '',
        lat: '',
        lng: '',
        priority: 'medium'
      })
      setLocationStatus('idle')
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Report Incident</h3>
          </div>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select incident type</option>
              {incidentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide details about the incident..."
              rows={4}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
              <p className="text-gray-400 text-sm ml-auto">
                {formData.description.length}/1000
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="space-y-2">
              {/* Auto location status */}
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                {locationStatus === 'loading' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                    Getting your location...
                  </div>
                )}
                {locationStatus === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Location detected automatically
                  </div>
                )}
                {locationStatus === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle size={14} />
                    Location not available - please enter manually
                  </div>
                )}
              </div>

              {/* Manual location input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.lat}
                    onChange={(e) => handleInputChange('lat', e.target.value)}
                    className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.lng}
                    onChange={(e) => handleInputChange('lng', e.target.value)}
                    className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityLevels.map(priority => (
                <label
                  key={priority.value}
                  className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                    formData.priority === priority.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    formData.priority === priority.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`} />
                  <span className={`text-sm font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportIncidentModal
