import { useEffect, useRef, useState } from 'react'
import { Siren, Phone, MapPin, AlertTriangle } from 'lucide-react'
import { useSecurity } from '../state/SecurityContext.jsx'

export default function SOSButton() {
  const [armed, setArmed] = useState(false)
  const [sending, setSending] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const timerRef = useRef(null)
  const { sendSOS, userLocation, emergencyStatus, error } = useSecurity()

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => setArmed(true), 800)
  }

  const handlePointerUp = () => {
    clearTimeout(timerRef.current)
    if (armed) {
      setShowOptions(true)
      setArmed(false)
    }
  }

  const handleDoubleClick = () => {
    setShowOptions(true)
  }

  const handleSOSConfirm = async (emergencyType = 'general') => {
    try {
      setSending(true)
      await sendSOS(emergencyType)
      
      // Show success feedback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Emergency Alert Sent', {
          body: 'Security team and emergency contacts have been notified',
          icon: '/emergency-icon.png'
        })
      }
      
      setShowOptions(false)
    } catch (error) {
      console.error('SOS failed:', error)
      alert('Failed to send SOS. Please call emergency services directly.')
    } finally {
      setSending(false)
    }
  }

  const handleDirectCall = () => {
    const phoneNumber = '+60-7-553-3333' // UTM emergency number
    window.open(`tel:${phoneNumber}`, '_self')
  }

  return (
    <>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        disabled={sending}
        className={`rounded-full h-28 w-28 grid place-items-center text-white shadow-lg transition-all duration-200 ${
          armed 
            ? 'bg-red-700 scale-105 shadow-xl' 
            : sending 
            ? 'bg-orange-600 animate-pulse' 
            : 'bg-red-600 hover:bg-red-700 active:scale-95'
        }`}
        aria-label="Emergency SOS Button"
      >
        <div className="flex flex-col items-center">
          <Siren size={28} className={sending ? 'animate-spin' : ''} />
          <span className="text-xs mt-1 font-medium">
            {sending ? 'Sending...' : 'Hold / Double-tap'}
          </span>
        </div>
      </button>

      {/* Emergency Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Siren size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Emergency Alert</h3>
              </div>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close emergency options"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-gray-600 text-sm">
                Choose the type of emergency or call directly:
              </p>
              
              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSOSConfirm('medical')}
                disabled={sending}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} />
                Medical Emergency
              </button>
              
              <button
                onClick={() => handleSOSConfirm('security')}
                disabled={sending}
                className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Siren size={16} />
                Security Threat
              </button>
              
              <button
                onClick={() => handleSOSConfirm('general')}
                disabled={sending}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Siren size={16} />
                General Emergency
              </button>
              
              <button
                onClick={handleDirectCall}
                className="w-full py-3 px-4 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <Phone size={16} />
                Call Directly
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}


