// Environment configuration for Campus Safety App
const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  
  // Map Configuration
  map: {
    center: {
      lat: parseFloat(process.env.REACT_APP_MAP_CENTER_LAT) || 1.5595,
      lng: parseFloat(process.env.REACT_APP_MAP_CENTER_LNG) || 103.6381
    },
    zoom: parseInt(process.env.REACT_APP_MAP_ZOOM) || 17,
    bounds: {
      north: 1.5650,
      south: 1.5540,
      east: 103.6450,
      west: 103.6310
    }
  },
  
  // Emergency Services
  emergency: {
    campus: process.env.REACT_APP_EMERGENCY_PHONE || '+60-7-553-3333',
    police: process.env.REACT_APP_POLICE_PHONE || '999',
    medical: process.env.REACT_APP_MEDICAL_PHONE || '999',
    fire: '994'
  },
  
  // Feature Flags
  features: {
    realLocation: process.env.REACT_APP_ENABLE_REAL_LOCATION !== 'false',
    pushNotifications: process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS !== 'false',
    offlineMode: process.env.REACT_APP_ENABLE_OFFLINE_MODE !== 'false'
  },
  
  // Development
  debug: process.env.REACT_APP_DEBUG_MODE === 'true',
  mockData: process.env.REACT_APP_MOCK_DATA !== 'false',
  
  // App Settings
  app: {
    name: 'Campus Safety App - UTM',
    version: '1.0.0',
    updateInterval: 30000, // 30 seconds
    locationUpdateInterval: 10000, // 10 seconds
    maxRetries: 3
  }
}

export default config
