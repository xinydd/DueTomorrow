import { useState, useEffect } from 'react'
import { MapPin, Clock, Wifi, Shield, Phone, Users, AlertTriangle, X } from 'lucide-react'
import { API_CONFIG } from '../config/api.js'

export default function BuildingInfo({ selectedBuilding, onClose, userLocation }) {
  const [buildingDetails, setBuildingDetails] = useState(null)
  const [liveOccupancy, setLiveOccupancy] = useState(null)
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (selectedBuilding) {
      // Find building details from config
      const building = API_CONFIG.CAMPUS.buildings.find(b => b.id === selectedBuilding.id)
      setBuildingDetails(building)

      // Calculate distance to building
      if (userLocation && building) {
        const dist = calculateDistance(
          userLocation.lat, userLocation.lng,
          building.lat, building.lng
        )
        setDistance(dist)
      }

      // Simulate live occupancy data
      setLiveOccupancy({
        current: Math.floor(Math.random() * 100),
        capacity: 200,
        lastUpdated: new Date()
      })
    }
  }, [selectedBuilding, userLocation])

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

    return Math.round(R * c)
  }

  const getSafetyLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSafetyLevelIcon = (level) => {
    switch (level) {
      case 'high': return <Shield className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      case 'low': return <AlertTriangle className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  const getOccupancyColor = (percentage) => {
    if (percentage < 30) return 'text-green-600'
    if (percentage < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!buildingDetails) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9000] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{buildingDetails.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{buildingDetails.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distance */}
        {distance && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {distance}m away from your location
              </span>
            </div>
          </div>
        )}

        {/* Status and Safety */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Status</span>
            </div>
            <span className={`text-sm font-semibold capitalize ${
              buildingDetails.status === 'open' ? 'text-green-600' : 'text-red-600'
            }`}>
              {buildingDetails.status}
            </span>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {getSafetyLevelIcon(buildingDetails.safetyLevel)}
              <span className="text-sm font-medium text-gray-800">Safety</span>
            </div>
            <span className={`text-sm font-semibold capitalize ${getSafetyLevelColor(buildingDetails.safetyLevel)} px-2 py-1 rounded-full`}>
              {buildingDetails.safetyLevel}
            </span>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Operating Hours</span>
          </div>
          <p className="text-sm text-gray-700">{buildingDetails.hours}</p>
        </div>

        {/* Live Occupancy */}
        {liveOccupancy && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Live Occupancy</span>
              </div>
              <span className="text-xs text-gray-500">
                Updated {liveOccupancy.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      liveOccupancy.current / liveOccupancy.capacity < 0.3 ? 'bg-green-500' :
                      liveOccupancy.current / liveOccupancy.capacity < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(liveOccupancy.current / liveOccupancy.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className={`text-sm font-semibold ${getOccupancyColor((liveOccupancy.current / liveOccupancy.capacity) * 100)}`}>
                {liveOccupancy.current}/{liveOccupancy.capacity}
              </span>
            </div>
          </div>
        )}

        {/* Facilities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Available Facilities</h4>
          <div className="flex flex-wrap gap-2">
            {buildingDetails.facilities.map((facility, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Emergency Contacts</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Security</span>
              <a 
                href={`tel:${API_CONFIG.CAMPUS.emergencyContacts.security}`}
                className="text-sm font-medium text-red-800 hover:underline"
              >
                {API_CONFIG.CAMPUS.emergencyContacts.security}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">Medical</span>
              <a 
                href={`tel:${API_CONFIG.CAMPUS.emergencyContacts.medical}`}
                className="text-sm font-medium text-red-800 hover:underline"
              >
                {API_CONFIG.CAMPUS.emergencyContacts.medical}
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              // Get directions to building
              if (window.google && window.google.maps) {
                const directionsService = new window.google.maps.DirectionsService()
                const directionsRenderer = new window.google.maps.DirectionsRenderer()
                
                directionsService.route({
                  origin: userLocation,
                  destination: { lat: buildingDetails.lat, lng: buildingDetails.lng },
                  travelMode: window.google.maps.TravelMode.WALKING
                }, (result, status) => {
                  if (status === 'OK') {
                    // Handle directions display
                    console.log('Directions calculated:', result)
                  }
                })
              }
            }}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium"
          >
            Get Directions
          </button>
          <button
            onClick={() => {
              // Report incident at this building
              console.log('Report incident at:', buildingDetails.name)
            }}
            className="flex-1 py-2 px-4 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 text-sm font-medium"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  )
}
