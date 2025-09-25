import { createContext, useContext, useState, useEffect } from 'react'
import alertsData from './alerts.json'
import guardiansData from './guardians.json'
import authService from '../services/authService.js'

const SecurityContext = createContext()

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}

export const SecurityProvider = ({ children }) => {
  const [securityStatus, setSecurityStatus] = useState('safe')
  const [alerts, setAlerts] = useState([])
  const [guardians, setGuardians] = useState([])
  const [nearbyGuardians, setNearbyGuardians] = useState([])
  const [patrols, setPatrols] = useState([])
  const [lastUpdated, setLastUpdated] = useState('just now')
  
  // Authentication state
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize authentication and data
  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      setUser(authService.getCurrentUser())
      setIsAuthenticated(true)
    }
    setIsLoading(false)

    setAlerts(alertsData)
    setGuardians(guardiansData)
    
    // Initialize patrols around UTM campus
    const initialPatrols = [
      { id: 1, lat: 1.5605, lng: 103.6390, name: 'Officer Ahmad' },
      { id: 2, lat: 1.5585, lng: 103.6370, name: 'Officer Sarah' },
      { id: 3, lat: 1.5610, lng: 103.6400, name: 'Officer Mike' }
    ]
    setPatrols(initialPatrols)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const statusInterval = setInterval(() => {
      // Update security status
      const statuses = ['safe', 'caution', 'danger']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      setSecurityStatus(randomStatus)
      
      // Update timestamp
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
      setLastUpdated(timeString)
    }, 30000) // Update every 30 seconds

    const alertsInterval = setInterval(() => {
      setAlerts(prevAlerts => {
        const newAlerts = [...prevAlerts]
        // Add new random alert occasionally
        if (Math.random() < 0.3) {
          const newAlert = {
            title: `New incident reported at ${['Block A', 'Block B', 'Block C', 'Library', 'Gym'][Math.floor(Math.random() * 5)]}`,
            time: '2 mins ago',
            level: ['safe', 'caution', 'danger'][Math.floor(Math.random() * 3)]
          }
          newAlerts.unshift(newAlert)
          if (newAlerts.length > 5) newAlerts.pop()
        }
        return newAlerts
      })
    }, 45000) // Update every 45 seconds

    const guardiansInterval = setInterval(() => {
      setGuardians(prevGuardians => {
        return prevGuardians.map(guardian => ({
          ...guardian,
          distance: `${Math.floor(Math.random() * 500) + 50}m`
        }))
      })
    }, 20000) // Update every 20 seconds

    return () => {
      clearInterval(statusInterval)
      clearInterval(alertsInterval)
      clearInterval(guardiansInterval)
    }
  }, [])

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

  // Authentication methods
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role)
  }

  const value = {
    // Security data
    securityStatus,
    alerts,
    guardians,
    nearbyGuardians,
    patrols,
    lastUpdated,
    setSecurityStatus,
    setAlerts,
    setGuardians,
    setNearbyGuardians,
    setPatrols,
    
    // Authentication
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    hasRole,
    hasAnyRole
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  )
}
