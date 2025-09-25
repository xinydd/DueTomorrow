import { useState, useEffect, useRef } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
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

export default function LiveMapView() {
  const mapRef = useRef(null)
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
  const [directionsService, setDirectionsService] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [showBuildingInfo, setShowBuildingInfo] = useState(false)
  const [emergencyServices, setEmergencyServices] = useState([])

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = async () => {
      if (!map) {
        try {
          setIsLoading(true)

          // Initialize Google Maps Loader
          const loader = new Loader({
            apiKey: "AIzaSyBvOkBw3cJxJxJxJxJxJxJxJxJxJxJxJxJ", // Demo key - replace with your actual API key
            version: "weekly",
            libraries: ["places", "geometry", "visualization"]
          })

          const google = await loader.load()

          // Create map
          const newMap = new google.maps.Map(mapRef.current, {
            center: UTM_CENTER,
            zoom: 17,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
            }
          })

          // Set map bounds to UTM area
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(UTM_BOUNDS.south, UTM_BOUNDS.west),
            new google.maps.LatLng(UTM_BOUNDS.north, UTM_BOUNDS.east)
          )
          newMap.fitBounds(bounds)

          // Initialize services
          const directionsService = new google.maps.DirectionsService()
          const directionsRenderer = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#10B981',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          })
          directionsRenderer.setMap(newMap)

          setMap(newMap)
          setDirectionsService(directionsService)
          setDirectionsRenderer(directionsRenderer)
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to initialize Google Maps:', error)
          // Fallback to Leaflet if Google Maps fails
          initLeafletFallback()
        }
      }
    }

    initGoogleMaps()

    return () => {
      if (map) {
        // Clean up markers
        markers.forEach(marker => marker.setMap(null))
      }
    }
  }, [map])

  // Fallback to Leaflet if Google Maps fails
  const initLeafletFallback = async () => {
    try {
      // Import Leaflet CSS first
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      await new Promise(resolve => setTimeout(resolve, 200))
      const L = await import('leaflet')

      const newMap = L.map(mapRef.current, {
        center: [UTM_CENTER.lat, UTM_CENTER.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap)

      const bounds = L.latLngBounds([
        [UTM_BOUNDS.south, UTM_BOUNDS.west],
        [UTM_BOUNDS.north, UTM_BOUNDS.east]
      ])
      newMap.fitBounds(bounds, { padding: [20, 20] })

      L.control.zoom({ position: 'topright' }).addTo(newMap)

      setMap(newMap)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to initialize fallback map:', error)
      setIsLoading(false)
    }
  }

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

            if (map && map.setCenter) {
              map.setCenter(newLocation)
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
        // Using OpenWeatherMap API (demo key)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lng}&appid=demo_key&units=metric`
        )

        if (response.ok) {
          const data = await response.json()
          setWeatherData(data)
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error)
        // Set demo weather data
        setWeatherData({
          main: { temp: 28, humidity: 75 },
          weather: [{ main: 'Clear', description: 'clear sky' }],
          wind: { speed: 2.5 }
        })
      }
    }

    fetchWeatherData()
    const weatherInterval = setInterval(fetchWeatherData, 300000) // 5 minutes

    return () => clearInterval(weatherInterval)
  }, [userLocation, isOnline])


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

  // Render map elements with Google Maps
  useEffect(() => {
    if (!map || !window.google) return

    const renderGoogleMapElements = () => {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      const newMarkers = []

      // Add user location marker
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        },
        animation: window.google.maps.Animation.BOUNCE
      })
      newMarkers.push(userMarker)

      // Add patrol markers
      patrols.forEach(patrol => {
        const patrolMarker = new window.google.maps.Marker({
          position: { lat: patrol.lat, lng: patrol.lng },
          map: map,
          title: patrol.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: patrol.status === 'active' ? '#10B981' : '#F59E0B',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        })
        newMarkers.push(patrolMarker)
      })

      // Add guardian markers
      nearbyGuardians.forEach(guardian => {
        const guardianMarker = new window.google.maps.Marker({
          position: { lat: guardian.lat, lng: guardian.lng },
          map: map,
          title: `${guardian.name} - ${guardian.distance}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#8B5CF6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        })
        newMarkers.push(guardianMarker)
      })

      // Add live alert markers
      liveAlerts.forEach(alert => {
        const alertMarker = new window.google.maps.Marker({
          position: { lat: alert.lat, lng: alert.lng },
          map: map,
          title: alert.message,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: alert.severity === 'high' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#10B981',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          animation: window.google.maps.Animation.DROP
        })
        newMarkers.push(alertMarker)
      })

      // Add building markers
      API_CONFIG.CAMPUS.buildings.forEach(building => {
        const buildingMarker = new window.google.maps.Marker({
          position: { lat: building.lat, lng: building.lng },
          map: map,
          title: building.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: building.safetyLevel === 'high' ? '#10B981' : building.safetyLevel === 'medium' ? '#F59E0B' : '#EF4444',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        })

        // Add click listener for building info
        buildingMarker.addListener('click', () => {
          setSelectedBuilding(building)
          setShowBuildingInfo(true)
        })

        newMarkers.push(buildingMarker)
      })

      // Add emergency service markers
      emergencyServices.forEach(service => {
        const serviceMarker = new window.google.maps.Marker({
          position: { lat: service.lat, lng: service.lng },
          map: map,
          title: service.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: service.type === 'security' ? '#3B82F6' : service.type === 'medical' ? '#EF4444' : '#F59E0B',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          }
        })

        // Add click listener for emergency service
        serviceMarker.addListener('click', () => {
          if (service.phone) {
            window.open(`tel:${service.phone}`, '_self')
          }
        })

        newMarkers.push(serviceMarker)
      })

      // Add safety zone circles
      safetyZones.forEach(zone => {
        const color = zone.type === 'safe' ? '#10B981' : zone.type === 'caution' ? '#F59E0B' : '#EF4444'

        const circle = new window.google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.1,
          map: map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radius
        })
      })

      setMarkers(newMarkers)
    }

    renderGoogleMapElements()
  }, [map, userLocation, patrols, nearbyGuardians, safetyZones, liveAlerts])

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

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Function to return to user's location
  const returnToUserLocation = () => {
    if (map && map.setCenter) {
      map.setCenter(userLocation)
      map.setZoom(17)
    }
  }

  // Get directions to a location
  const getDirections = (destination) => {
    if (!directionsService || !directionsRenderer) return

    directionsService.route({
      origin: userLocation,
      destination: destination,
      travelMode: window.google.maps.TravelMode.WALKING
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)
      }
    })
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Live Campus Map...</p>
          </div>
        </div>
      )}

      {/* Top Grid (Left: Status + Alerts, Right: Weather + Traffic) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] grid grid-cols-2 gap-4">

        {/* Left Column */}
        <div className="flex flex-col space-y-3 max-w-[280px]">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
            ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Live Data' : 'Offline Mode'}
          </div>

          {/* Live Alerts */}
          {liveAlerts.length > 0 && (
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800">Live Alerts 123</h4>
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
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-3 items-end max-w-[220px] ml-auto">
          {weatherData && (
            <div className="bg-white/90 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-gray-200 w-full">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌤️</span>
                <div>
                  <div className="font-semibold">{weatherData.main.temp}°C</div>
                  <div className="text-gray-600">{weatherData.weather[0].description}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Return to Me Button */}
      <button
        onClick={returnToUserLocation}
        className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
        title="Return to My Location"
      >
        <Navigation size={20} className="text-blue-600" />
      </button>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-lg border border-gray-200">
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


          position: { lat: patrol.lat, lng: patrol.lng },

          map: map,

          title: patrol.name,

          icon: {

            path: window.google.maps.SymbolPath.CIRCLE,

            scale: 10,

            fillColor: patrol.status === 'active' ? '#10B981' : '#F59E0B',

            fillOpacity: 1,

            strokeColor: '#FFFFFF',

            strokeWeight: 2

          }

        })

        newMarkers.push(patrolMarker)

      })



      // Add guardian markers

      nearbyGuardians.forEach(guardian => {

        const guardianMarker = new window.google.maps.Marker({

          position: { lat: guardian.lat, lng: guardian.lng },

          map: map,

          title: `${guardian.name} - ${guardian.distance}`,

          icon: {

            path: window.google.maps.SymbolPath.CIRCLE,

            scale: 8,

            fillColor: '#8B5CF6',

            fillOpacity: 1,

            strokeColor: '#FFFFFF',

            strokeWeight: 2

          }

        })

        newMarkers.push(guardianMarker)

      })



      // Add live alert markers

      liveAlerts.forEach(alert => {

        const alertMarker = new window.google.maps.Marker({

          position: { lat: alert.lat, lng: alert.lng },

          map: map,

          title: alert.message,

          icon: {

            path: window.google.maps.SymbolPath.CIRCLE,

            scale: 12,

            fillColor: alert.severity === 'high' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#10B981',

            fillOpacity: 0.8,

            strokeColor: '#FFFFFF',

            strokeWeight: 2

          },

          animation: window.google.maps.Animation.DROP

        })

        newMarkers.push(alertMarker)

      })



      // Add building markers

      API_CONFIG.CAMPUS.buildings.forEach(building => {

        const buildingMarker = new window.google.maps.Marker({

          position: { lat: building.lat, lng: building.lng },

          map: map,

          title: building.name,

          icon: {

            path: window.google.maps.SymbolPath.CIRCLE,

            scale: 8,

            fillColor: building.safetyLevel === 'high' ? '#10B981' : building.safetyLevel === 'medium' ? '#F59E0B' : '#EF4444',

            fillOpacity: 0.8,

            strokeColor: '#FFFFFF',

            strokeWeight: 2

          }

        })



        // Add click listener for building info

        buildingMarker.addListener('click', () => {

          setSelectedBuilding(building)

          setShowBuildingInfo(true)

        })



        newMarkers.push(buildingMarker)

      })



      // Add emergency service markers

      emergencyServices.forEach(service => {

        const serviceMarker = new window.google.maps.Marker({

          position: { lat: service.lat, lng: service.lng },

          map: map,

          title: service.name,

          icon: {

            path: window.google.maps.SymbolPath.CIRCLE,

            scale: 10,

            fillColor: service.type === 'security' ? '#3B82F6' : service.type === 'medical' ? '#EF4444' : '#F59E0B',

            fillOpacity: 1,

            strokeColor: '#FFFFFF',

            strokeWeight: 3

          }

        })



        // Add click listener for emergency service

        serviceMarker.addListener('click', () => {

          if (service.phone) {

            window.open(`tel:${service.phone}`, '_self')

          }

        })



        newMarkers.push(serviceMarker)

      })



      // Add safety zone circles

      safetyZones.forEach(zone => {

        const color = zone.type === 'safe' ? '#10B981' : zone.type === 'caution' ? '#F59E0B' : '#EF4444'



        const circle = new window.google.maps.Circle({

          strokeColor: color,

          strokeOpacity: 0.8,

          strokeWeight: 2,

          fillColor: color,

          fillOpacity: 0.1,

          map: map,

          center: { lat: zone.lat, lng: zone.lng },

          radius: zone.radius

        })

      })



      setMarkers(newMarkers)

    }



    renderGoogleMapElements()

  }, [map, userLocation, patrols, nearbyGuardians, safetyZones, liveAlerts])



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

            trafficData: trafficData,

            liveAlerts: liveAlerts

          }

        }

      })

      window.dispatchEvent(event)

    }, 3000)



    return () => clearInterval(interval)

  }, [map, userLocation, patrols, safetyZones, weatherData, trafficData, liveAlerts])



  // Calculate distance between two points in meters

  const calculateDistance = (lat1, lng1, lat2, lng2) => {

    const R = 6371e3 // Earth's radius in meters

    const φ1 = lat1 * Math.PI / 180

    const φ2 = lat2 * Math.PI / 180

    const Δφ = (lat2 - lat1) * Math.PI / 180

    const Δλ = (lng2 - lng1) * Math.PI / 180



    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +

      Math.cos(φ1) * Math.cos(φ2) *

      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))



    return R * c

  }



  // Function to return to user's location

  const returnToUserLocation = () => {

    if (map && map.setCenter) {

      map.setCenter(userLocation)

      map.setZoom(17)

    }

  }



  // Get directions to a location

  const getDirections = (destination) => {

    if (!directionsService || !directionsRenderer) return



    directionsService.route({

      origin: userLocation,

      destination: destination,

      travelMode: window.google.maps.TravelMode.WALKING

    }, (result, status) => {

      if (status === 'OK') {

        directionsRenderer.setDirections(result)

      }

    })

  }



  return (

    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">

      <div ref={mapRef} className="w-full h-full" />



      {/* Loading Indicator */}

      {isLoading && (

        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">

          <div className="text-center">

            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>

            <p className="text-sm text-gray-600">Loading Live Campus Map...</p>

          </div>

        </div>

      )}



      {/* Top Grid (Left: Status + Alerts, Right: Weather + Traffic) */}

      <div className="absolute top-4 left-4 right-4 z-[1000] grid grid-cols-2 gap-4">



        {/* Left Column */}

        <div className="flex flex-col space-y-3 max-w-[280px]">

          {/* Connection Status */}

          <div

            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium

            ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>

            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}

            {isOnline ? 'Live Data' : 'Offline Mode'}

          </div>



          {/* Live Alerts */}

          {liveAlerts.length > 0 && (

            <div className="bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-200">

              <div className="flex items-center justify-between mb-2">

                <h4 className="text-sm font-semibold text-gray-800">Live Alerts 123</h4>

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

        </div>



        {/* Right Column */}

        <div className="flex flex-col space-y-3 items-end max-w-[220px] ml-auto">

          {weatherData && (

            <div className="bg-white/90 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-gray-200 w-full">

              <div className="flex items-center gap-2">

                <span className="text-2xl">🌤️</span>

                <div>

                  <div className="font-semibold">{weatherData.main.temp}°C</div>

                  <div className="text-gray-600">{weatherData.weather[0].description}</div>

                </div>

              </div>

            </div>

          )}



          {trafficData && (

            <div className="bg-white/90 backdrop-blur rounded-lg p-3 text-xs shadow-lg border border-gray-200 w-full">

              <div className="flex items-center gap-2">

                <div

                  className={`w-3 h-3 rounded-full ${trafficData.congestion === 'high'

                    ? 'bg-red-500'

                    : trafficData.congestion === 'medium'

                      ? 'bg-yellow-500'

                      : 'bg-green-500'

                    }`}

                ></div>

                <div>

                  <div className="font-semibold">Traffic: {trafficData.congestion}</div>

                  <div className="text-gray-600">{trafficData.incidents.length} incidents</div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>



      {/* Return to Me Button */}

      <button

        onClick={returnToUserLocation}

        className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"

        title="Return to My Location"

      >

        <Navigation size={20} className="text-blue-600" />

      </button>



      {/* Map Legend */}

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-lg border border-gray-200">

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


