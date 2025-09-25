import { useState, useEffect } from 'react'
import { Camera, Flag, Route, Search, X, ChevronUp, Share2 } from 'lucide-react'
import WorkingMapView from '../ui/WorkingMapView.jsx'
import LocationSharingService from '../services/locationSharingService'

export default function Map() {
  const [showBottomPanel, setShowBottomPanel] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapData, setMapData] = useState({
    nearbyGuardians: [],
    patrols: [],
    safetyZones: [],
    userLocation: null
  })
  const [isFullSafetyInfo, setIsFullSafetyInfo] = useState(false)

  useEffect(() => {
    const handleMapDataUpdate = (event) => {
      if (event.detail && event.detail.type === 'mapDataUpdate') {
        setMapData(event.detail.data)
      }
    }
    window.addEventListener('mapDataUpdate', handleMapDataUpdate)
    return () => window.removeEventListener('mapDataUpdate', handleMapDataUpdate)
  }, [])

  const handleActionClick = (action) => {
    setSelectedAction(action)
    setShowPopup(true)
  }

  const handleConfirm = async () => {
    if (selectedAction) {
      if (selectedAction.action === 'shareLocation') {
        // Show location sharing options - service handles all error display
        await LocationSharingService.showSharingOptions();
        setShowPopup(false)
        setSelectedAction(null)
      } else {
        alert(selectedAction.action)
        setShowPopup(false)
        setSelectedAction(null)
      }
    }
  }

  const actions = [
    {
      label: 'Share Location',
      icon: Share2,
      description: 'Share your current location via WhatsApp, Telegram, or SMS',
      action: 'shareLocation'
    },
    {
      label: 'AI Camera Scan',
      icon: Camera,
      description: 'Open phone camera to detect environment (dark alley, empty corridor, etc.)',
      action: 'AI scan initiated! Analyzing your surroundings...'
    },
    {
      label: 'Report Incident',
      icon: Flag,
      description: 'Quick incident report form with auto-filled location',
      action: 'Incident reported! Security team notified of your location.'
    },
    {
      label: 'Escort Me',
      icon: Route,
      description: 'Request a walking buddy or security escort',
      action: 'Escort request sent! Guardian Angels and security notified.'
    }
  ]

  const nearbyGuardians = mapData.nearbyGuardians.length > 0 ? mapData.nearbyGuardians : [
    { name: 'Ahmad S.', distance: '150m', available: true },
    { name: 'Sarah L.', distance: '200m', available: true }
  ]

  const patrolInfo = mapData.patrols.length > 0 ? mapData.patrols.map(patrol => ({
    location: 'Nearby',
    eta: '2-5 mins',
    officer: patrol.name
  })) : [
    { location: 'Block C', eta: '5 mins', officer: 'Officer Ahmad' },
    { location: 'Library', eta: '8 mins', officer: 'Officer Sarah' }
  ]

  const recentAlerts = [
    { message: 'Suspicious activity reported near Parking Lot', time: '20 mins ago', level: 'caution' },
    { message: 'Low lighting detected at Engineering Block corridor', time: '15 mins ago', level: 'caution' },
    { message: 'Security patrol completed at Main Library', time: '10 mins ago', level: 'safe' }
  ]

  return (
    <div className="relative h-full">
      {/* Top Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search UTM buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/90 backdrop-blur rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="relative z-10">
        <div className={`${showBottomPanel ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <WorkingMapView />
        </div>
      </div>

      {/* Floating Action Buttons - Moved 224.5cm to the left, 2cm down */}
      <div className="fixed right-[575px] top-[calc(50%+8px)] transform -translate-y-1/2 z-30">
        <div className="flex flex-col gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleActionClick(action)}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all duration-200 border border-gray-200"
              title={action.label}
            >
              <action.icon size={20} className="text-blue-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Panel Handle */}
      {!showBottomPanel && !isFullSafetyInfo && !showPopup && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[60]">
          <button
            onClick={() => setShowBottomPanel(true)}
            className="bg-white rounded-t-2xl px-6 py-2 shadow-lg border border-gray-200 flex items-center gap-2"
          >
            <ChevronUp size={16} />
            <span className="text-sm font-medium text-gray-700">Safety Info</span>
          </button>
        </div>
      )}

      {/*Small pop up after click Safety Info*/}
      {showBottomPanel && !isFullSafetyInfo && (
        <div className="fixed bottom-[72px] left-0 right-0 z-30">
          <div className="mx-auto max-w-md bg-white rounded-t-3xl shadow-2xl h-auto overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Live Safety Information</h3>
                <button
                  onClick={() => setShowBottomPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Shortened info */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Nearest guardians and patrol status available.
                </p>
                {/* Expand arrow */}
                <button
                  onClick={() => {
                    setIsFullSafetyInfo(true)
                    setShowBottomPanel(false)
                  }}
                  className="flex items-center gap-2 text-blue-600 font-medium hover:underline"
                >
                  Show More <ChevronUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Full Page Safety Info */}
      {isFullSafetyInfo && (
        <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
          <div className="p-6 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Full Safety Information</h2>
              <button
                onClick={() => {
                  setIsFullSafetyInfo(false)
                  setShowBottomPanel(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-800">Nearest Guardian Angels</h3>
                {nearbyGuardians.map((g, idx) => (
                  <p key={idx} className="text-blue-600">{g.name} - {g.distance} away</p>
                ))}
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800">Patrol ETA</h3>
                {patrolInfo.map((p, idx) => (
                  <p key={idx} className="text-green-600">{p.location} - {p.eta}</p>
                ))}
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <h3 className="font-semibold text-yellow-800">Recent Alerts</h3>
                {recentAlerts.map((a, idx) => (
                  <p key={idx} className="text-yellow-700">{a.message} ({a.time})</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Popup Modal */}
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
    </div>
  )
}
