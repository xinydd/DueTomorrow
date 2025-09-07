import { useEffect, useState } from 'react'
import { MapPin, Users, Route, AlertTriangle, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react'
import { useSecurity } from '../state/SecurityContext.jsx'
import SafetyBanner from '../ui/SafetyBanner.jsx'
import SOSButton from '../ui/SOSButton.jsx'
import QuickActions from '../ui/QuickActions.jsx'
import InfoCard from '../ui/InfoCard.jsx'

export default function Home() {
  const { 
    securityStatus, 
    alerts, 
    guardians, 
    nearbyGuardians, 
    patrols, 
    lastUpdated,
    loading,
    error,
    userLocation,
    currentZone,
    isOnline,
    clearError,
    refreshData
  } = useSecurity()

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw size={32} className="animate-spin text-blue-600" />
        <p className="text-gray-600">Loading security data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile-Optimized Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi size={14} className="sm:w-4 sm:h-4 text-green-600" />
          ) : (
            <WifiOff size={14} className="sm:w-4 sm:h-4 text-red-600" />
          )}
          <span className={`text-xs sm:text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {userLocation && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Location: {userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'Unknown'}</span>
            <span className="sm:hidden">{userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'Unknown'}</span>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Error Display */}
      {error && (
        <div className="flex items-start sm:items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
            <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="text-red-600 text-xs sm:text-sm break-words">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 p-1 -m-1 touch-manipulation flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      {/* Mobile-Optimized Current Zone Info */}
      {currentZone && (
        <div className={`p-3 rounded-xl border ${
          currentZone.level === 'safe' ? 'bg-green-50 border-green-200' :
          currentZone.level === 'caution' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <MapPin size={14} className={`sm:w-4 sm:h-4 ${
              currentZone.level === 'safe' ? 'text-green-600' :
              currentZone.level === 'caution' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            <span className={`font-medium text-sm sm:text-base ${
              currentZone.level === 'safe' ? 'text-green-800' :
              currentZone.level === 'caution' ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              {currentZone.name}
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-1 break-words ${
            currentZone.level === 'safe' ? 'text-green-700' :
            currentZone.level === 'caution' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {currentZone.description}
          </p>
        </div>
      )}

      <SafetyBanner status={securityStatus} />
      
      <div className="grid place-items-center">
        <SOSButton />
      </div>
      
      <QuickActions />

      <div className="grid gap-3">
        <InfoCard 
          title="Security Alerts" 
          items={alerts.map(a => ({
            title: a.title,
            subtitle: a.time,
            badge: a.level,
            icon: AlertTriangle,
            description: a.description || `Security alert reported at ${a.location || 'campus location'}`
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />

        <InfoCard 
          title="Guardian Angels Nearby" 
          items={nearbyGuardians.length > 0 ? nearbyGuardians.map(g => ({
            title: g.name,
            subtitle: g.distanceText || g.distance,
            badge: g.role,
            icon: Users,
            description: g.available ? 'Available for assistance' : 'Currently busy'
          })) : guardians.map(g => ({
            title: g.name,
            subtitle: g.distance,
            badge: g.role,
            icon: Users,
            description: g.available ? 'Available for assistance' : 'Currently busy'
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />

        <InfoCard 
          title="Safe Route Suggestions" 
          items={[
            { 
              title: 'Library → Dorm A', 
              subtitle: '10 min • well-lit • security cameras', 
              badge: 'safe',
              icon: Route,
              description: 'Recommended route with maximum safety features and lighting'
            },
            { 
              title: 'Gym → Parking P2', 
              subtitle: '8 min • caution • low lighting', 
              badge: 'caution',
              icon: Route,
              description: 'Use caution due to limited lighting in some areas'
            },
            { 
              title: 'Cafeteria → Study Hall', 
              subtitle: '5 min • safe • busy area', 
              badge: 'safe',
              icon: Route,
              description: 'High foot traffic area with good visibility'
            },
            { 
              title: 'Engineering Block → Main Gate', 
              subtitle: '12 min • safe • well-patrolled', 
              badge: 'safe',
              icon: Route,
              description: 'Regular security patrols and emergency call boxes available'
            },
            { 
              title: 'Student Center → Library', 
              subtitle: '7 min • caution • construction zone', 
              badge: 'caution',
              icon: Route,
              description: 'Temporary detour due to ongoing construction work'
            }
          ]} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />
      </div>

      {/* Mobile-Optimized Refresh Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 touch-manipulation"
        >
          <RefreshCw size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Refresh Data</span>
          <span className="sm:hidden">Refresh</span>
        </button>
      </div>
    </div>
  )
}


