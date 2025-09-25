import { useEffect, useRef, useState } from 'react'
import { Siren } from 'lucide-react'
import LocationSharingService from '../services/locationSharingService'

export default function SOSButton() {
  const [armed, setArmed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => setArmed(true), 800)
  }

  const handlePointerUp = async () => {
    clearTimeout(timerRef.current)
    if (armed) {
      // Show emergency sharing options - service handles all error display
      const emergencyMessage = '🚨 EMERGENCY SOS ALERT! 🚨\n\nI need immediate help! Please contact emergency services.\n\n';
      await LocationSharingService.showSharingOptions(emergencyMessage);
      setArmed(false)
    }
  }

  const handleDoubleClick = async () => {
    const emergencyMessage = '🚨 EMERGENCY SOS ALERT! 🚨\n\nI need immediate help! Please contact emergency services.\n\n';
    await LocationSharingService.showSharingOptions(emergencyMessage);
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      className={`rounded-full h-28 w-28 grid place-items-center text-white shadow-lg transition-transform ${
        armed ? 'bg-danger scale-105' : 'bg-red-600'
      }`}
    >
      <div className="flex flex-col items-center">
        <Siren size={28} />
        <span className="text-xs mt-1">Hold / Double-tap</span>
      </div>
    </button>
  )
}


