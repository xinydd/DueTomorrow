import { useState, useEffect, useRef, useCallback } from 'react'
import { Shield, Users, AlertTriangle, Route, Navigation, Wifi, WifiOff, Building, Phone } from 'lucide-react'
import zones from '../state/zones.json'
import guardians from '../state/guardians.json'
import { API_CONFIG } from '../config/api.js'
import BuildingInfo from './BuildingInfo.jsx'

// UTM Main Campus coordinates (Johor Bahru, Malaysia)
const UTM_CENTER = { lat: 1.5595, lng: 103.6381 }
const UTM_BOUNDS = {
  north: 1.5620,
  south: 1.5570,
  east: 103.6410,
  west: 103.6350
}

export default function WorkingMapView() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(UTM_CENTER)
  const [patrols, setPatrols] = useState([])
  const [nearbyGuardians, setNearbyGuardians] = useState([])
  const [safeRoutes, setSafeRoutes] = useState([])
  const [safetyZones, setSafetyZones] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [weatherData, setWeatherData] = useState(null)
  const [liveAlerts, setLiveAlerts] = useState([])
  const [markers, setMarkers] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [showBuildingInfo, setShowBuildingInfo] = useState(false)
  const [emergencyServices, setEmergencyServices] = useState([])
  const [mapError, setMapError] = useState(null)
  const [showLegend, setShowLegend] = useState(false)
  const [showLiveAlerts, setShowLiveAlerts] = useState(false)
  const [mapKey, setMapKey] = useState(0) // Key to force map re-render

  // Get user location first
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            })
          })
          
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation)
          console.log('Live location obtained:', newLocation)
        } catch (error) {
          console.log('Using fallback location:', UTM_CENTER)
          setUserLocation(UTM_CENTER)
        }
      }
    }

    getCurrentLocation()
  }, [])

  // Initialize map with unique key approach
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return

    try {
      setIsLoading(true)
      setMapError(null)

      // Import Leaflet CSS
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Wait for CSS to load
      await new Promise(resolve => setTimeout(resolve, 200))

      // Import Leaflet
      const L = await import('leaflet')

      // Fix default markers
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Create map with current user location
      const newMap = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 18,
        zoomControl: false,
        attributionControl: false
      })

      // Store map instance
      mapInstanceRef.current = newMap
      setMap(newMap)

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div class="w-6 h-6 bg-blue-600 rounded-full border-3 border-white shadow-lg animate-pulse"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
      
      L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        title: 'Your Live Location'
      }).addTo(newMap)

      // Add tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(newMap)

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(newMap)
      
      setIsLoading(false)
      console.log('Map initialized successfully')
    } catch (error) {
      console.error('Map initialization failed:', error)
      setMapError(`Failed to load map: ${error.message}`)
      setIsLoading(false)
    }
  }, [userLocation])

  // Initialize map when user location is ready
  useEffect(() => {
    if (userLocation.lat !== UTM_CENTER.lat || userLocation.lng !== UTM_CENTER.lng) {
      initializeMap()
    }
  }, [userLocation, initializeMap])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.log('Map cleanup error:', error)
        }
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Get user's real-time location
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            setUserLocation(newLocation)
            
            if (map && map.setView) {
              map.setView([newLocation.lat, newLocation.lng], 17)
            }
          },
          (error) => {
            console.error('Error getting location:', error)
            // Use UTM center as fallback
            setUserLocation(UTM_CENTER)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      }
    }

    getCurrentLocation()
    
    // Update location every 30 seconds
    const locationInterval = setInterval(getCurrentLocation, 30000)
    
    return () => clearInterval(locationInterval)
  }, [map])

  // Monitor online/offline status
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

  // Fetch live weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!isOnline) return
      
      try {
        // Set demo weather data
        setWeatherData({
          main: { temp: 28, humidity: 75 },
          weather: [{ main: 'Clear', description: 'clear sky' }],
          wind: { speed: 2.5 }
        })
      } catch (error) {
        console.error('Failed to fetch weather data:', error)
      }
    }

    fetchWeatherData()
    const weatherInterval = setInterval(fetchWeatherData, 300000) // 5 minutes
    
    return () => clearInterval(weatherInterval)
  }, [isOnline])


  // Fetch live safety alerts
  useEffect(() => {
    const fetchLiveAlerts = async () => {
      if (!isOnline) return
      
      try {
        // Simulate live safety alerts
        const alerts = [
          { id: 1, lat: 1.5605, lng: 103.6390, type: 'suspicious', message: 'Suspicious activity reported', time: new Date(), severity: 'medium' },
          { id: 2, lat: 1.5585, lng: 103.6370, type: 'lighting', message: 'Poor lighting detected', time: new Date(), severity: 'low' },
          { id: 3, lat: 1.5610, lng: 103.6400, type: 'emergency', message: 'Emergency services dispatched', time: new Date(), severity: 'high' }
        ]
        setLiveAlerts(alerts)
      } catch (error) {
        console.error('Failed to fetch live alerts:', error)
      }
    }

    fetchLiveAlerts()
    const alertsInterval = setInterval(fetchLiveAlerts, 45000) // 45 seconds
    
    return () => clearInterval(alertsInterval)
  }, [isOnline])

  // Initialize security features when map is ready
  useEffect(() => {
    if (map) {
      initializeSecurityFeatures()
    }
  }, [map])

  const initializeSecurityFeatures = () => {
    // Initialize patrols around UTM campus
    const initialPatrols = [
      { id: 1, lat: 1.5605, lng: 103.6390, name: 'Officer Ahmad', status: 'active' },
      { id: 2, lat: 1.5585, lng: 103.6370, name: 'Officer Sarah', status: 'active' },
      { id: 3, lat: 1.5610, lng: 103.6400, name: 'Officer Mike', status: 'busy' }
    ]
    setPatrols(initialPatrols)

    // Initialize safety zones
    const zones = [
      { lat: 1.5600, lng: 103.6385, radius: 100, type: 'safe', name: 'Main Library' },
      { lat: 1.5590, lng: 103.6375, radius: 80, type: 'caution', name: 'Engineering Block' },
      { lat: 1.5580, lng: 103.6390, radius: 120, type: 'danger', name: 'Parking Lot' }
    ]
    setSafetyZones(zones)

    // Initialize safe routes
    const routes = [
      { from: UTM_CENTER, to: { lat: 1.5600, lng: 103.6385 }, type: 'safe' },
      { from: UTM_CENTER, to: { lat: 1.5590, lng: 103.6375 }, type: 'caution' }
    ]
    setSafeRoutes(routes)

    // Initialize emergency services
    const services = [
      { id: 1, lat: 1.5600, lng: 103.6385, name: 'Security Office', type: 'security', phone: API_CONFIG.CAMPUS.emergencyContacts.security },
      { id: 2, lat: 1.5590, lng: 103.6375, name: 'Medical Center', type: 'medical', phone: API_CONFIG.CAMPUS.emergencyContacts.medical },
      { id: 3, lat: 1.5585, lng: 103.6390, name: 'Emergency Call Box', type: 'emergency', phone: '999' }
    ]
    setEmergencyServices(services)
  }

  // Render map elements with Leaflet
  useEffect(() => {
    if (!map) return

    const renderMapElements = async () => {
      try {
        const L = await import('leaflet')
        
        // Clear existing markers
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
            map.removeLayer(layer)
          }
        })

        // Add user location marker
        const userIcon = L.divIcon({
          className: 'user-marker',
          html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
        
        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          title: 'Your Location'
        }).addTo(map)

        // Add patrol markers
        patrols.forEach(patrol => {
          const patrolIcon = L.divIcon({
            className: 'patrol-marker',
            html: `<div class="w-6 h-6 ${patrol.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          
          L.marker([patrol.lat, patrol.lng], {
            icon: patrolIcon,
            title: patrol.name
          }).addTo(map)
        })

        // Add guardian markers
        nearbyGuardians.forEach(guardian => {
          const guardianIcon = L.divIcon({
            className: 'guardian-marker',
            html: '<div class="w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">👥</div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
          
          L.marker([guardian.lat, guardian.lng], {
            icon: guardianIcon,
            title: `${guardian.name} - ${guardian.distance}`
          }).addTo(map)
        })

        // Add live alert markers
        liveAlerts.forEach(alert => {
          const alertIcon = L.divIcon({
            className: 'alert-marker',
            html: `<div class="w-6 h-6 ${
              alert.severity === 'high' ? 'bg-red-500' : 
              alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            } rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          
          L.marker([alert.lat, alert.lng], {
            icon: alertIcon,
            title: alert.message
          }).addTo(map)
        })

        // Add building markers
        API_CONFIG.CAMPUS.buildings.forEach(building => {
          const buildingIcon = L.divIcon({
            className: 'building-marker',
            html: `<div class="w-5 h-5 ${
              building.safetyLevel === 'high' ? 'bg-green-500' : 
              building.safetyLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            } rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
          
          const buildingMarker = L.marker([building.lat, building.lng], {
            icon: buildingIcon,
            title: building.name
          }).addTo(map)

          // Add click listener for building info
          buildingMarker.on('click', () => {
            setSelectedBuilding(building)
            setShowBuildingInfo(true)
          })
        })

        // Add emergency service markers
        emergencyServices.forEach(service => {
          const serviceIcon = L.divIcon({
            className: 'service-marker',
            html: `<div class="w-6 h-6 ${
              service.type === 'security' ? 'bg-blue-600' : 
              service.type === 'medical' ? 'bg-red-600' : 'bg-orange-600'
            } rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
          
          const serviceMarker = L.marker([service.lat, service.lng], {
            icon: serviceIcon,
            title: service.name
          }).addTo(map)

          // Add click listener for emergency service
          serviceMarker.on('click', () => {
            if (service.phone) {
              window.open(`tel:${service.phone}`, '_self')
            }
          })
        })

        // Add safety zone circles
        safetyZones.forEach(zone => {
          const color = zone.type === 'safe' ? '#10B981' : zone.type === 'caution' ? '#F59E0B' : '#EF4444'
          
          L.circle([zone.lat, zone.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.1,
            radius: zone.radius
          }).addTo(map)
        })

        // Add safe routes
        safeRoutes.forEach(route => {
          const color = route.type === 'safe' ? '#10B981' : '#F59E0B'
          
          L.polyline([
            [route.from.lat, route.from.lng],
            [route.to.lat, route.to.lng]
          ], {
            color: color,
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 5'
          }).addTo(map)
        })
      } catch (error) {
        console.error('Failed to render map elements:', error)
      }
    }

    renderMapElements()
  }, [map, userLocation, patrols, nearbyGuardians, safetyZones, safeRoutes, liveAlerts, emergencyServices])

  // Simulate real-time updates
  useEffect(() => {
    if (!map) return

    const interval = setInterval(() => {
      // Update patrol positions
      setPatrols(prev => prev.map(patrol => {
        const newLat = patrol.lat + (Math.random() - 0.5) * 0.001
        const newLng = patrol.lng + (Math.random() - 0.5) * 0.001
        
        return {
          ...patrol,
          lat: Math.max(UTM_BOUNDS.south, Math.min(UTM_BOUNDS.north, newLat)),
          lng: Math.max(UTM_BOUNDS.west, Math.min(UTM_BOUNDS.east, newLng))
        }
      }))

      // Update nearby guardians based on user location
      const nearby = guardians.filter(guardian => {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          guardian.lat, guardian.lng
        )
        return distance <= 300 // 300 meters
      })
      setNearbyGuardians(nearby)

      // Emit data update to parent component
      const event = new CustomEvent('mapDataUpdate', {
        detail: {
          type: 'mapDataUpdate',
          data: {
            nearbyGuardians: nearby,
            patrols: patrols,
            safetyZones: safetyZones,
            userLocation: userLocation,
            weatherData: weatherData,
            liveAlerts: liveAlerts
          }
        }
      })
      window.dispatchEvent(event)
    }, 3000)

    return () => clearInterval(interval)
  }, [map, userLocation, patrols, safetyZones, weatherData, liveAlerts])

  // Calculate distance between two points in meters
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  // Function to return to user's location
  const returnToUserLocation = () => {
    if (map && map.setView) {
      map.setView([userLocation.lat, userLocation.lng], 17, {
        animate: true,
        duration: 1
      })
    }
  }

  // Listen for map navigation events from Home page
  useEffect(() => {
    const handleNavigateToMap = async (event) => {
      console.log('Map navigation event received:', event.detail)
      const { zoomToItems, title } = event.detail
      if (map && zoomToItems) {
        try {
          const L = await import('leaflet')
          // Zoom to show all items
          const bounds = L.latLngBounds()
          
          // Add user location
          bounds.extend([userLocation.lat, userLocation.lng])
          console.log('Added user location to bounds:', userLocation)
          
          // Add relevant markers based on title
          if (title.includes('Security') || title.includes('Alert')) {
            console.log('Zooming to security alerts:', liveAlerts)
            liveAlerts.forEach(alert => {
              bounds.extend([alert.lat, alert.lng])
            })
          } else if (title.includes('Guardian') || title.includes('Angel')) {
            console.log('Zooming to guardian angels:', nearbyGuardians)
            nearbyGuardians.forEach(guardian => {
              bounds.extend([guardian.lat, guardian.lng])
            })
          } else if (title.includes('Route') || title.includes('Safe')) {
            console.log('Zooming to buildings and routes')
            // Zoom to show all buildings and routes
            API_CONFIG.CAMPUS.buildings.forEach(building => {
              bounds.extend([building.lat, building.lng])
            })
          }
          
          if (!bounds.isEmpty()) {
            console.log('Fitting map bounds:', bounds)
            map.fitBounds(bounds, { padding: [20, 20] })
          } else {
            console.log('Bounds is empty, zooming to user location')
            map.setView([userLocation.lat, userLocation.lng], 17)
          }
        } catch (error) {
          console.error('Failed to navigate to map:', error)
        }
      } else {
        console.log('Map not ready or no zoom items:', { map: !!map, zoomToItems })
      }
    }

    window.addEventListener('navigateToMap', handleNavigateToMap)
    return () => window.removeEventListener('navigateToMap', handleNavigateToMap)
  }, [map, userLocation, liveAlerts, nearbyGuardians])

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      <div key={mapKey} ref={mapRef} className="w-full h-full bg-blue-50" />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Getting Your Live Location...</p>
            <p className="text-xs text-gray-500 mt-1">Please allow location access</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {mapError && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
            <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            <button
              onClick={() => {
                // Reset all map state
                setMapError(null)
                setIsLoading(true)
                
                // Clean up existing map
                if (mapInstanceRef.current) {
                  try {
                    mapInstanceRef.current.remove()
                  } catch (error) {
                    console.log('Map cleanup error:', error)
                  }
                  mapInstanceRef.current = null
                }
                setMap(null)
                
                // Force re-render by changing key
                setMapKey(prev => prev + 1)
                
                // Clear any existing Leaflet CSS
                const existingCSS = document.querySelector('#leaflet-css')
                if (existingCSS) {
                  existingCSS.remove()
                }
                
                // Retry initialization after a short delay
                setTimeout(() => {
                  initializeMap()
                }, 100)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Live Data Status - Higher Position */}
      <div className="absolute top-2 left-4 z-[1000]">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? 'Live Data' : 'Offline Mode'}
        </div>
      </div>

      {/* Weather - Moved 5cm to the left */}
      {weatherData && (
        <div className="absolute top-4 right-20 z-[1000]">
          <div className="bg-white/90 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌤️</span>
              <div>
                <div className="font-semibold">{weatherData.main.temp}°C</div>
                <div className="text-gray-600">{weatherData.weather[0].description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Return to Me Button */}
      <button
        onClick={returnToUserLocation}
        className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
        title="Return to My Location"
      >
        <Navigation size={20} className="text-blue-600" />
      </button>
      
      {/* Live Alerts Toggle Button */}
      {liveAlerts.length > 0 && (
        <button
          onClick={() => setShowLiveAlerts(!showLiveAlerts)}
          className="absolute bottom-16 left-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200"
          title={showLiveAlerts ? "Hide Live Alerts" : "Show Live Alerts"}
        >
          <span className="text-lg font-bold text-red-600">!</span>
        </button>
      )}

      {/* Live Alerts Panel */}
      {showLiveAlerts && liveAlerts.length > 0 && (
        <div className="absolute bottom-16 left-16 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-lg border border-gray-200 max-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">Live Alerts</h4>
            <span className="text-xs text-gray-500">{liveAlerts.length} active</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {liveAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center gap-2 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${alert.severity === 'high'
                    ? 'bg-red-500'
                    : alert.severity === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    }`}
                ></div>
                <span className="text-gray-700">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Legend Toggle Button */}
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="absolute bottom-4 left-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200"
        title={showLegend ? "Hide Legend" : "Show Legend"}
      >
        <span className="text-lg font-bold text-gray-700">?</span>
      </button>

      {/* Map Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-16 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-lg border border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-700 font-medium">You</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-700 font-medium">Active Patrol</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              <span className="text-gray-700 font-medium">Busy Patrol</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700 font-medium">Guardian Angel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Live Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Building</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-gray-700 font-medium">Emergency</span>
            </div>
          </div>
        </div>
      )}


      {/* Building Info Modal */}
      {showBuildingInfo && selectedBuilding && (
        <BuildingInfo
          selectedBuilding={selectedBuilding}
          onClose={() => {
            setShowBuildingInfo(false)
            setSelectedBuilding(null)
          }}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}
