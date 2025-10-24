// API Configuration for Live Map Features
// Note: Replace these with your actual API keys

export const API_CONFIG = {
  // Backend API Base URL - Auto-detect local vs production
  BASE_URL: window.location.hostname === 'localhost' 
    ? "http://localhost:3000/api"
    : "https://duetomorrow.onrender.com/api",
  
  // Google Maps API Key
  // Get your key from: https://console.cloud.google.com/google/maps-apis
  GOOGLE_MAPS_API_KEY: "AIzaSyBvOkBw3cJxJxJxJxJxJxJxJxJxJxJxJxJ", // Replace with your actual key
  
  // OpenWeatherMap API Key
  // Get your key from: https://openweathermap.org/api
  OPENWEATHER_API_KEY: "your_openweather_api_key_here",
  
  // Emergency Services API (if available)
  EMERGENCY_SERVICES_API_KEY: "your_emergency_services_key_here",
  
  // Campus-specific configuration
  CAMPUS: {
    name: "Universiti Teknologi Malaysia (UTM)",
    center: { lat: 1.5595, lng: 103.6381 },
    bounds: {
      north: 1.5620,
      south: 1.5570,
      east: 103.6410,
      west: 103.6350
    },
    buildings: [
      {
        id: 1,
        name: "Main Library",
        lat: 1.5600,
        lng: 103.6385,
        type: "library",
        status: "open",
        hours: "8:00 AM - 10:00 PM",
        facilities: ["WiFi", "Study Rooms", "Emergency Exit"],
        safetyLevel: "high"
      },
      {
        id: 2,
        name: "Engineering Block",
        lat: 1.5590,
        lng: 103.6375,
        type: "academic",
        status: "open",
        hours: "7:00 AM - 11:00 PM",
        facilities: ["Labs", "Computer Rooms", "Emergency Exit"],
        safetyLevel: "medium"
      },
      {
        id: 3,
        name: "Student Center",
        lat: 1.5585,
        lng: 103.6390,
        type: "recreation",
        status: "open",
        hours: "6:00 AM - 12:00 AM",
        facilities: ["Cafeteria", "ATM", "Security Office"],
        safetyLevel: "high"
      },
      {
        id: 4,
        name: "Parking Lot A",
        lat: 1.5580,
        lng: 103.6390,
        type: "parking",
        status: "open",
        hours: "24/7",
        facilities: ["CCTV", "Emergency Call Box"],
        safetyLevel: "low"
      },
      {
        id: 5,
        name: "Sports Complex",
        lat: 1.5610,
        lng: 103.6400,
        type: "sports",
        status: "open",
        hours: "6:00 AM - 10:00 PM",
        facilities: ["Gym", "Swimming Pool", "First Aid"],
        safetyLevel: "medium"
      }
    ],
    emergencyContacts: {
      security: "+60-7-553-3333",
      medical: "+60-7-553-4444",
      fire: "999",
      police: "999"
    }
  }
}

// Live data endpoints
export const LIVE_DATA_ENDPOINTS = {
  weather: (lat, lng) => 
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric`,
  
  traffic: (bounds) => 
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${bounds.south},${bounds.west}&destinations=${bounds.north},${bounds.east}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
  
  places: (lat, lng, radius = 1000) =>
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=establishment&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
  
  directions: (origin, destination) =>
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
}

// Fallback data for offline mode
export const FALLBACK_DATA = {
  weather: {
    main: { temp: 28, humidity: 75 },
    weather: [{ main: 'Clear', description: 'clear sky' }],
    wind: { speed: 2.5 }
  },
  traffic: {
    congestion: 'low',
    incidents: []
  },
  alerts: [
    { id: 1, type: 'info', message: 'Campus operating normally', severity: 'low' }
  ]
}
