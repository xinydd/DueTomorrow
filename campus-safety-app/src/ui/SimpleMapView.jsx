import { useState, useEffect, useRef } from 'react'
import { Navigation, Wifi, WifiOff, AlertTriangle } from 'lucide-react'

// UTM Main Campus coordinates (Johor Bahru, Malaysia)
const UTM_CENTER = { lat: 1.5595, lng: 103.6381 }

// Function to generate safety zones around user location
const generateSafetyZonesAroundUser = (userLat, userLng) => {
  const zones = []
  
  // Safe zones (green) - close to user
  zones.push({
    id: 1,
    lat: userLat + 0.0005, // ~50m north
    lng: userLng + 0.0003, // ~30m east
    radius: 80,
    type: 'safe',
    name: 'Nearby Safe Area',
    description: 'Well-lit area with security cameras'
  })
  
  zones.push({
    id: 2,
    lat: userLat - 0.0002, // ~20m south
    lng: userLng + 0.0006, // ~60m east
    radius: 60,
    type: 'safe',
    name: 'Student Gathering Spot',
    description: 'High foot traffic, emergency call boxes'
  })
  
  // Caution zones (yellow) - medium distance
  zones.push({
    id: 3,
    lat: userLat - 0.0008, // ~80m south
    lng: userLng - 0.0004, // ~40m west
    radius: 100,
    type: 'caution',
    name: 'Dimly Lit Area',
    description: 'Limited lighting after hours'
  })
  
  zones.push({
    id: 4,
    lat: userLat + 0.0003, // ~30m north
    lng: userLng - 0.0009, // ~90m west
    radius: 120,
    type: 'caution',
    name: 'Quiet Zone',
    description: 'Isolated area, use with caution'
  })
  
  // Danger zones (red) - further away
  zones.push({
    id: 5,
    lat: userLat - 0.0012, // ~120m south
    lng: userLng + 0.0008, // ~80m east
    radius: 90,
    type: 'danger',
    name: 'Restricted Area',
    description: 'Active construction, restricted access'
  })
  
  zones.push({
    id: 6,
    lat: userLat + 0.0010, // ~100m north
    lng: userLng + 0.0002, // ~20m east
    radius: 70,
    type: 'danger',
    name: 'Equipment Storage',
    description: 'Authorized personnel only'
  })
  
  return zones
}

export default function SimpleMapView() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null) // No default location
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [weatherData, setWeatherData] = useState({
    main: { temp: 28 },
    weather: [{ description: 'clear sky' }]
  })
  const [mapError, setMapError] = useState(null)
  const [locationStatus, setLocationStatus] = useState('requesting') // requesting, success, failed
  const [showLegend, setShowLegend] = useState(false)

  // Get user's live location first
  useEffect(() => {
    const getCurrentLocation = async () => {
      if (navigator.geolocation) {
        try {
          setLocationStatus('requesting')
          console.log('Requesting location permission...')
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000, // Increased timeout
              maximumAge: 0
            })
          })
          
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation)
          setLocationStatus('success')
          console.log('✅ Live location obtained:', newLocation)
          console.log('📍 Location accuracy:', position.coords.accuracy, 'meters')
        } catch (error) {
          console.error('❌ Location error:', error.message)
          setLocationStatus('failed')
          if (error.code === 1) {
            console.log('🚫 Location permission denied by user')
          } else if (error.code === 2) {
            console.log('📍 Location unavailable')
          } else if (error.code === 3) {
            console.log('⏱️ Location request timeout')
          }
          // Don't set any fallback location - keep loading state
        }
      } else {
        console.log('Geolocation not supported')
        setLocationStatus('failed')
      }
    }

    getCurrentLocation()
  }, [])

  // Initialize map only when we have user location
  useEffect(() => {
    let mounted = true
    let mapInstance = null

    // Only initialize map when we have user location
    if (!userLocation) return

    const initMap = async () => {
      if (!mapRef.current || mapInstance) return

      try {
        setIsLoading(true)
        setMapError(null)

        // Import Leaflet CSS
        const existingCSS = document.querySelector('#leaflet-css')
        if (existingCSS) {
          existingCSS.remove()
        }

        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        // Wait for CSS
        await new Promise(resolve => setTimeout(resolve, 300))

        // Import Leaflet
        const L = await import('leaflet')

        // Fix default markers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Create map centered on user's live location
        mapInstance = L.map(mapRef.current, {
          center: [userLocation.lat, userLocation.lng],
          zoom: 18,
          zoomControl: false,
          attributionControl: false
        })

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
        }).addTo(mapInstance)

        // Add tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance)

        // Generate safety zones around user location
        const safetyZones = generateSafetyZonesAroundUser(userLocation.lat, userLocation.lng)
        
        // Add safety zone circles
        safetyZones.forEach(zone => {
          const color = zone.type === 'safe' ? '#10B981' : 
                       zone.type === 'caution' ? '#F59E0B' : '#EF4444'
          
          const circle = L.circle([zone.lat, zone.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.15,
            weight: 2,
            radius: zone.radius
          }).addTo(mapInstance)

          // Add popup with zone information
          circle.bindPopup(`
            <div class="text-center">
              <h3 class="font-semibold text-gray-800 mb-1">${zone.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${zone.description}</p>
              <div class="flex items-center justify-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                <span class="text-xs font-medium capitalize">${zone.type} Zone</span>
              </div>
            </div>
          `)
        })

        // Add zoom control
        L.control.zoom({ position: 'topright' }).addTo(mapInstance)

        if (mounted) {
          setMap(mapInstance)
          setIsLoading(false)
          console.log('Map initialized with live location')
        }
      } catch (error) {
        console.error('Map initialization failed:', error)
        if (mounted) {
          setMapError(`Failed to load map: ${error.message}`)
          setIsLoading(false)
        }
      }
    }

    // Initialize map after a short delay
    const timer = setTimeout(initMap, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (mapInstance) {
        try {
          mapInstance.remove()
        } catch (error) {
          console.log('Map cleanup error:', error)
        }
        mapInstance = null
      }
    }
  }, [userLocation])

  // Function to return to user's location
  const returnToUserLocation = () => {
    if (map) {
      map.setView([userLocation.lat, userLocation.lng], 18, {
        animate: true,
        duration: 1
      })
    }
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full bg-blue-50" />
      
      {/* Loading Indicator */}
      {(!userLocation || isLoading) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            {locationStatus === 'requesting' && (
              <>
                <p className="text-sm text-gray-600">Getting Your Live Location...</p>
                <p className="text-xs text-gray-500 mt-1">Please allow location access</p>
              </>
            )}
            {locationStatus === 'failed' && (
              <>
                <p className="text-sm text-red-600">Location Access Required</p>
                <p className="text-xs text-gray-500 mt-1">Please enable location access in your browser</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Retry
                </button>
              </>
            )}
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
                setMapError(null)
                setIsLoading(true)
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Live Data Status */}
      <div className="absolute top-2 left-4 z-[1000]">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {isOnline ? 'Live Data' : 'Offline Mode'}
        </div>
      </div>

      {/* Weather */}
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
      
      {/* Live Location Status - Only show when map is loaded */}
      {userLocation && !isLoading && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg p-2 text-xs shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-700">Live Location Active</span>
          </div>
        </div>
      )}

      {/* Legend Toggle Button */}
      {userLocation && !isLoading && (
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="absolute bottom-16 left-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200"
          title={showLegend ? "Hide Legend" : "Show Legend"}
        >
          <span className="text-lg font-bold text-gray-700">?</span>
        </button>
      )}

      {/* Legend Panel */}
      {showLegend && userLocation && !isLoading && (
        <div className="absolute bottom-16 left-16 bg-white/95 backdrop-blur rounded-lg p-4 text-xs z-[1000] shadow-lg border border-gray-200 max-w-[250px]">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Safety Zone Legend</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 opacity-60"></div>
              <div>
                <div className="font-medium text-gray-800">Safe Zone</div>
                <div className="text-gray-600">Well-lit, monitored areas</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-60"></div>
              <div>
                <div className="font-medium text-gray-800">Caution Zone</div>
                <div className="text-gray-600">Limited lighting, isolated</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 opacity-60"></div>
              <div>
                <div className="font-medium text-gray-800">Danger Zone</div>
                <div className="text-gray-600">Restricted, high risk</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
              <div>
                <div className="font-medium text-gray-800">Your Location</div>
                <div className="text-gray-600">Current GPS position</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return to Me Button - Only show when map is loaded */}
      {userLocation && !isLoading && (
        <button
          onClick={returnToUserLocation}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
          title="Return to My Location"
        >
          <Navigation size={20} className="text-blue-600" />
        </button>
      )}
    </div>
  )
}
