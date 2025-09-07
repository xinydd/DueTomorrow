// Location services with GPS and geofencing
class LocationService {
  constructor() {
    this.watchId = null
    this.currentLocation = null
    this.locationCallbacks = []
    this.utmCampus = {
      center: { lat: 1.5595, lng: 103.6381 },
      bounds: {
        north: 1.5650,
        south: 1.5540,
        east: 103.6450,
        west: 103.6310
      }
    }
  }

  // Get current location with high accuracy
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          }
          this.currentLocation = location
          resolve(location)
        },
        (error) => {
          console.error('Location error:', error)
          reject(new Error(this.getLocationErrorMessage(error.code)))
        },
        options
      )
    })
  }

  // Start watching location changes
  startLocationWatch(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported')
    }

    this.locationCallbacks.push(callback)

    if (this.watchId) return // Already watching

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        }
        this.currentLocation = location
        
        // Notify all callbacks
        this.locationCallbacks.forEach(cb => cb(location))
      },
      (error) => {
        console.error('Location watch error:', error)
        this.locationCallbacks.forEach(cb => cb(null, error))
      },
      options
    )
  }

  // Stop watching location
  stopLocationWatch() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.locationCallbacks = []
  }

  // Check if location is within UTM campus
  isWithinCampus(location) {
    if (!location) return false
    
    const { lat, lng } = location
    const { bounds } = this.utmCampus
    
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    )
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(point1, point2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180
    const φ2 = point2.lat * Math.PI / 180
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Find nearby guardians within radius
  findNearbyGuardians(guardians, userLocation, radius = 300) {
    if (!userLocation) return []
    
    return guardians.filter(guardian => {
      const distance = this.calculateDistance(userLocation, guardian.location)
      return distance <= radius
    }).map(guardian => ({
      ...guardian,
      distance: Math.round(this.calculateDistance(userLocation, guardian.location)),
      distanceText: this.formatDistance(this.calculateDistance(userLocation, guardian.location))
    }))
  }

  // Format distance for display
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  // Get location error message
  getLocationErrorMessage(errorCode) {
    switch (errorCode) {
      case 1:
        return 'Location access denied. Please enable location services.'
      case 2:
        return 'Location unavailable. Please check your connection.'
      case 3:
        return 'Location request timed out. Please try again.'
      default:
        return 'Unable to get your location. Please try again.'
    }
  }

  // Request location permission
  async requestLocationPermission() {
    if (!navigator.permissions) {
      return true // Assume granted if permissions API not available
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state === 'granted'
    } catch {
      return true // Assume granted if query fails
    }
  }

  // Get campus zones with safety levels
  getCampusZones() {
    return [
      {
        id: 'library',
        name: 'Main Library',
        center: { lat: 1.5600, lng: 103.6390 },
        radius: 100,
        level: 'safe',
        description: 'Well-lit, security cameras, 24/7 access'
      },
      {
        id: 'student-center',
        name: 'Student Center',
        center: { lat: 1.5590, lng: 103.6375 },
        radius: 80,
        level: 'safe',
        description: 'High foot traffic, security presence'
      },
      {
        id: 'engineering-block',
        name: 'Engineering Block',
        center: { lat: 1.5610, lng: 103.6405 },
        radius: 120,
        level: 'caution',
        description: 'Some areas have low lighting'
      },
      {
        id: 'parking-lot',
        name: 'Parking Lot P2',
        center: { lat: 1.5580, lng: 103.6350 },
        radius: 150,
        level: 'danger',
        description: 'Isolated area, limited lighting'
      }
    ]
  }

  // Check which zone user is in
  getCurrentZone(userLocation) {
    if (!userLocation) return null
    
    const zones = this.getCampusZones()
    for (const zone of zones) {
      const distance = this.calculateDistance(userLocation, zone.center)
      if (distance <= zone.radius) {
        return { ...zone, distance }
      }
    }
    return null
  }
}

export default new LocationService()
