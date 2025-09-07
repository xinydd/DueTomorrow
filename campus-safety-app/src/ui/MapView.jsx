import { useState, useEffect, useRef } from 'react'
import { Shield, Users, AlertTriangle, Route } from 'lucide-react'
import zones from '../state/zones.json'
import guardians from '../state/guardians.json'

// UTM Main Campus coordinates (Johor Bahru, Malaysia)
const UTM_CENTER = { lat: 1.5595, lng: 103.6381 }
const UTM_BOUNDS = {
  north: 1.5620,
  south: 1.5570,
  east: 103.6410,
  west: 103.6350
}

export default function MapView() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(UTM_CENTER)
  const [patrols, setPatrols] = useState([])
  const [nearbyGuardians, setNearbyGuardians] = useState([])
  const [safeRoutes, setSafeRoutes] = useState([])
  const [safetyZones, setSafetyZones] = useState([])

  // Initialize Leaflet Map
  useEffect(() => {
    const initMap = async () => {
      if (!map) {
        try {
          // Import Leaflet CSS first
          if (!document.querySelector('#leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
          }

          // Wait for CSS to load
          await new Promise(resolve => setTimeout(resolve, 200))

          // Dynamically import Leaflet
          const L = await import('leaflet')

          // Create map
          const newMap = L.map(mapRef.current, {
            center: [UTM_CENTER.lat, UTM_CENTER.lng],
            zoom: 17,
            zoomControl: false,
            attributionControl: false
          })

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(newMap)

          // Set map bounds to UTM area
          const bounds = L.latLngBounds([
            [UTM_BOUNDS.south, UTM_BOUNDS.west],
            [UTM_BOUNDS.north, UTM_BOUNDS.east]
          ])
          newMap.fitBounds(bounds, { padding: [20, 20] })

          // Add zoom control to top right
          L.control.zoom({ position: 'topright' }).addTo(newMap)
          
          setMap(newMap)
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to initialize map:', error)
          setIsLoading(false)
        }
      }
    }

    initMap()

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [map])

  // Initialize security features when map is ready
  useEffect(() => {
    if (map) {
      initializeSecurityFeatures()
    }
  }, [map])

  const initializeSecurityFeatures = () => {
    // Initialize patrols around UTM campus
    const initialPatrols = [
      { id: 1, lat: 1.5605, lng: 103.6390, name: 'Officer Ahmad' },
      { id: 2, lat: 1.5585, lng: 103.6370, name: 'Officer Sarah' },
      { id: 3, lat: 1.5610, lng: 103.6400, name: 'Officer Mike' }
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
  }

  // Simulate real-time updates
  useEffect(() => {
    if (!map) return

    const interval = setInterval(() => {
      // Update patrol positions
      setPatrols(prev => prev.map(patrol => {
        const newLat = patrol.lat + (Math.random() - 0.5) * 0.001
        const newLng = patrol.lng + (Math.random() - 0.5) * 0.001
        
        // Keep patrols within UTM bounds
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
            userLocation: userLocation
          }
        }
      })
      window.dispatchEvent(event)
    }, 3000)

    return () => clearInterval(interval)
  }, [map, userLocation, patrols, safetyZones])

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
    if (map) {
      map.setView([userLocation.lat, userLocation.lng], 17, {
        animate: true,
        duration: 1
      })
    }
  }

  // Render map elements
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
            html: '<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>',
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
  }, [map, userLocation, patrols, nearbyGuardians, safetyZones, safeRoutes])

  return (
    <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading UTM Campus Map...</p>
          </div>
        </div>
      )}
      
      {/* Return to Me Button */}
      <button
        onClick={returnToUserLocation}
        className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-all duration-200 active:scale-95"
        title="Return to My Location"
      >
        <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white"></div>
      </button>
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-lg border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">Security Patrol</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700 font-medium">Guardian Angel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full opacity-20"></div>
            <span className="text-gray-700 font-medium">Safe Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-20"></div>
            <span className="text-gray-700 font-medium">Caution Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full opacity-20"></div>
            <span className="text-gray-700 font-medium">Danger Zone</span>
          </div>
        </div>
      </div>
    </div>
  )
}


