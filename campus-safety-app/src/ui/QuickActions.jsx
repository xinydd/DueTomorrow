import { useState } from 'react'
import { Share2, Route, Flag, X } from 'lucide-react'

const actions = [
  { 
    label: 'Share Live Location', 
    icon: Share2,
    description: 'Share your current location with friends or security personnel',
    action: 'Location shared successfully!'
  },
  { 
    label: 'Request Escort', 
    icon: Route,
    description: 'Request an escort from nearby Guardian Angels',
    action: 'Escort request sent! Guardian Angels notified.'
  },
  { 
    label: 'Report Incident', 
    icon: Flag,
    description: 'Report a safety incident or suspicious activity',
    action: 'Incident reported! Security team notified.'
  },
]

export default function QuickActions() {
  const [selectedAction, setSelectedAction] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  const handleActionClick = (action) => {
    setSelectedAction(action)
    setShowPopup(true)
  }

  const handleConfirm = () => {
    if (selectedAction) {
      alert(selectedAction.action)
      setShowPopup(false)
      setSelectedAction(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <button 
            key={action.label} 
            onClick={() => handleActionClick(action)}
            className="card py-3 text-center text-sm hover:bg-gray-50 active:scale-95 transition-all duration-200"
          >
            <div className="grid place-items-center text-blue-600 mb-1">
              <action.icon size={18} />
            </div>
            <div className="px-2">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Popup Modal */}
      {showPopup && selectedAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <selectedAction.icon size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">{selectedAction.label}</h3>
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">{selectedAction.description}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPopup(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


