import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import alertsData from './alerts.json'
import guardiansData from './guardians.json'
import locationService from '../services/location.js'
import emergencyService from '../services/emergency.js'
import authService from '../services/auth.js'

const SecurityContext = createContext()

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}

export const SecurityProvider = ({ children }) => {
  // Core state
  const [securityStatus, setSecurityStatus] = useState('safe')
  const [alerts, setAlerts] = useState([])
  const [guardians, setGuardians] = useState([])
  const [nearbyGuardians, setNearbyGuardians] = useState([])
  const [patrols, setPatrols] = useState([])
  const [lastUpdated, setLastUpdated] = useState('just now')
  
  // Enhanced state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [currentZone, setCurrentZone] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [emergencyStatus, setEmergencyStatus] = useState(null)

  // Initialize data with error handling
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load initial data
        setAlerts(alertsData)
        setGuardians(guardiansData)
        
        // Initialize patrols around UTM campus
        const initialPatrols = [
          { id: 1, lat: 1.5605, lng: 103.6390, name: 'Officer Ahmad', status: 'active' },
          { id: 2, lat: 1.5585, lng: 103.6370, name: 'Officer Sarah', status: 'active' },
          { id: 3, lat: 1.5610, lng: 103.6400, name: 'Officer Mike', status: 'active' }
        ]
        setPatrols(initialPatrols)
        
        // Request location permission and get initial location
        const hasPermission = await locationService.requestLocationPermission()
        if (hasPermission) {
          try {
            const location = await locationService.getCurrentLocation()
            setUserLocation(location)
            const zone = locationService.getCurrentZone(location)
            setCurrentZone(zone)
          } catch (locationError) {
            console.warn('Location not available:', locationError.message)
            // Use fallback location (UTM center)
            const fallbackLocation = { lat: 1.5595, lng: 103.6381, accuracy: 1000 }
            setUserLocation(fallbackLocation)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Initialization error:', error)
        setError('Failed to initialize security data')
        setLoading(false)
      }
    }
    
    initializeData()
  }, [])

  // Location tracking
  useEffect(() => {
    const handleLocationUpdate = (location, error) => {
      if (error) {
        console.warn('Location update error:', error)
        return
      }
      
      setUserLocation(location)
      const zone = locationService.getCurrentZone(location)
      setCurrentZone(zone)
      
      // Update nearby guardians based on real location
      const nearby = locationService.findNearbyGuardians(guardians, location)
      setNearbyGuardians(nearby)
    }

    locationService.startLocationWatch(handleLocationUpdate)
    
    return () => {
      locationService.stopLocationWatch()
    }
  }, [guardians])

  // Online/offline status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Real-time data updates with better logic
  useEffect(() => {
    if (loading) return

    const updateSecurityStatus = () => {
      // Calculate status based on real data instead of random
      const recentDangerAlerts = alerts.filter(alert => 
        alert.level === 'danger' && 
        new Date() - new Date(alert.timestamp || Date.now()) < 300000 // 5 minutes
      )
      
      const status = recentDangerAlerts.length > 0 ? 'danger' : 
                    currentZone?.level === 'caution' ? 'caution' : 'safe'
      
      setSecurityStatus(status)
      
      // Update timestamp
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      setLastUpdated(timeString)
    }

    const statusInterval = setInterval(updateSecurityStatus, 30000)
    
    return () => clearInterval(statusInterval)
  }, [alerts, currentZone, loading])

  // Update nearby guardians when location or guardians change
  useEffect(() => {
    if (userLocation && guardians.length > 0) {
      const nearby = locationService.findNearbyGuardians(guardians, userLocation)
      setNearbyGuardians(nearby)
    }
  }, [userLocation, guardians])

  // Update nearby guardians when map data changes
  useEffect(() => {
    const handleMapDataUpdate = (event) => {
      if (event.detail && event.detail.type === 'mapDataUpdate') {
        const { nearbyGuardians: mapGuardians, patrols: mapPatrols } = event.detail.data
        if (mapGuardians) {
          setNearbyGuardians(mapGuardians)
        }
        if (mapPatrols) {
          setPatrols(mapPatrols)
        }
      }
    }

    window.addEventListener('mapDataUpdate', handleMapDataUpdate)
    return () => window.removeEventListener('mapDataUpdate', handleMapDataUpdate)
  }, [])

  // Emergency functions
  const sendSOS = useCallback(async (emergencyType = 'general') => {
    try {
      const user = authService.getCurrentUser()
      const result = await emergencyService.sendSOS(userLocation, user, emergencyType)
      setEmergencyStatus(result)
      return result
    } catch (error) {
      setError('Failed to send SOS alert')
      throw error
    }
  }, [userLocation])

  const reportIncident = useCallback(async (incidentData) => {
    try {
      const result = await emergencyService.reportIncident({
        ...incidentData,
        location: userLocation,
        timestamp: new Date().toISOString()
      })
      
      // Add to local alerts
      setAlerts(prev => [result, ...prev])
      return result
    } catch (error) {
      setError('Failed to report incident')
      throw error
    }
  }, [userLocation])

  const requestEscort = useCallback(async (destination) => {
    try {
      const user = authService.getCurrentUser()
      const result = await emergencyService.requestEscort(userLocation, user, destination)
      return result
    } catch (error) {
      setError('Failed to request escort')
      throw error
    }
  }, [userLocation])

  // Memoized value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Core data
    securityStatus,
    alerts,
    guardians,
    nearbyGuardians,
    patrols,
    lastUpdated,
    
    // Enhanced data
    loading,
    error,
    userLocation,
    currentZone,
    isOnline,
    emergencyStatus,
    
    // Actions
    setSecurityStatus,
    setAlerts,
    setGuardians,
    setNearbyGuardians,
    setPatrols,
    sendSOS,
    reportIncident,
    requestEscort,
    
    // Utility functions
    clearError: () => setError(null),
    refreshData: async () => {
      setLoading(true)
      try {
        // Simulate data refresh with new/updated data
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
        
        // Update alerts with new data
        setAlerts(prevAlerts => {
          const newAlerts = [...prevAlerts]
          // Add a new random alert occasionally
          if (Math.random() < 0.4) {
            const locations = ['Block A', 'Block B', 'Block C', 'Library', 'Gym', 'Cafeteria', 'Engineering Block', 'Student Center']
            const newAlert = {
              title: `Updated incident at ${locations[Math.floor(Math.random() * locations.length)]}`,
              time: 'Just now',
              level: ['safe', 'caution', 'danger'][Math.floor(Math.random() * 3)],
              description: 'Latest security update from campus monitoring system',
              location: locations[Math.floor(Math.random() * locations.length)],
              timestamp: now.toISOString()
            }
            newAlerts.unshift(newAlert)
            if (newAlerts.length > 8) newAlerts.pop()
          }
          return newAlerts
        })
        
        // Update guardians with new distances
        setGuardians(prevGuardians => {
          return prevGuardians.map(guardian => ({
            ...guardian,
            distance: `${Math.floor(Math.random() * 500) + 50}m`,
            available: Math.random() > 0.3 // 70% chance of being available
          }))
        })
        
        // Update patrols with new positions
        setPatrols(prevPatrols => {
          return prevPatrols.map(patrol => ({
            ...patrol,
            lat: 1.5595 + (Math.random() - 0.5) * 0.01, // Small random movement
            lng: 103.6381 + (Math.random() - 0.5) * 0.01,
            status: Math.random() > 0.2 ? 'active' : 'busy'
          }))
        })
        
        setLastUpdated(timeString)
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
      } catch (error) {
        setError('Failed to refresh data')
      } finally {
        setLoading(false)
      }
    }
  }), [
    securityStatus, alerts, guardians, nearbyGuardians, patrols, lastUpdated,
    loading, error, userLocation, currentZone, isOnline, emergencyStatus,
    sendSOS, reportIncident, requestEscort
  ])

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}
