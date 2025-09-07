// Emergency services with real-time response system
class EmergencyService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    this.emergencyContacts = {
      campus: '+60-7-553-3333',
      police: '999',
      medical: '999',
      fire: '994'
    }
  }

  // Send SOS emergency alert
  async sendSOS(userLocation, userInfo, emergencyType = 'general') {
    try {
      const emergencyData = {
        type: 'SOS',
        emergencyType,
        location: userLocation,
        user: userInfo,
        timestamp: new Date().toISOString(),
        status: 'active',
        priority: 'high'
      }

      // Send to backend
      const response = await fetch(`${this.baseURL}/emergency/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emergencyData),
      })

      if (!response.ok) {
        throw new Error('Failed to send SOS alert')
      }

      const result = await response.json()
      
      // Also send to local emergency contacts
      this.notifyEmergencyContacts(emergencyData)
      
      return result
    } catch (error) {
      console.error('SOS error:', error)
      // Fallback: direct phone call
      this.initiateEmergencyCall()
      throw error
    }
  }

  // Report incident
  async reportIncident(incidentData) {
    try {
      const report = {
        ...incidentData,
        timestamp: new Date().toISOString(),
        status: 'reported',
        priority: this.calculatePriority(incidentData)
      }

      const response = await fetch(`${this.baseURL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })

      if (!response.ok) {
        throw new Error('Failed to report incident')
      }

      return await response.json()
    } catch (error) {
      console.error('Incident report error:', error)
      throw error
    }
  }

  // Request escort
  async requestEscort(userLocation, userInfo, destination) {
    try {
      const escortRequest = {
        type: 'escort',
        location: userLocation,
        destination,
        user: userInfo,
        timestamp: new Date().toISOString(),
        status: 'pending',
        priority: 'medium'
      }

      const response = await fetch(`${this.baseURL}/escort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escortRequest),
      })

      if (!response.ok) {
        throw new Error('Failed to request escort')
      }

      return await response.json()
    } catch (error) {
      console.error('Escort request error:', error)
      throw error
    }
  }

  // Get emergency status
  async getEmergencyStatus(emergencyId) {
    try {
      const response = await fetch(`${this.baseURL}/emergency/${emergencyId}`)
      if (!response.ok) {
        throw new Error('Failed to get emergency status')
      }
      return await response.json()
    } catch (error) {
      console.error('Emergency status error:', error)
      throw error
    }
  }

  // Notify emergency contacts
  notifyEmergencyContacts(emergencyData) {
    // In a real app, this would send SMS/email notifications
    console.log('Notifying emergency contacts:', emergencyData)
    
    // Show notification to user
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Emergency Alert Sent', {
        body: 'Security team and emergency contacts have been notified',
        icon: '/emergency-icon.png'
      })
    }
  }

  // Initiate emergency phone call
  initiateEmergencyCall() {
    const phoneNumber = this.emergencyContacts.campus
    const callUrl = `tel:${phoneNumber}`
    
    // Create temporary link and click it
    const link = document.createElement('a')
    link.href = callUrl
    link.click()
  }

  // Calculate incident priority
  calculatePriority(incidentData) {
    const { type, severity, location } = incidentData
    
    if (type === 'assault' || type === 'theft' || severity === 'high') {
      return 'high'
    } else if (type === 'harassment' || severity === 'medium') {
      return 'medium'
    } else {
      return 'low'
    }
  }

  // Get emergency contacts
  getEmergencyContacts() {
    return this.emergencyContacts
  }

  // Check if emergency services are available
  async checkServiceStatus() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  // Get nearby emergency services
  async getNearbyEmergencyServices(location) {
    try {
      const response = await fetch(`${this.baseURL}/emergency/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      })

      if (!response.ok) {
        throw new Error('Failed to get nearby services')
      }

      return await response.json()
    } catch (error) {
      console.error('Nearby services error:', error)
      // Return fallback data
      return {
        police: { distance: '2.5km', eta: '8-12 mins' },
        medical: { distance: '3.1km', eta: '10-15 mins' },
        campus: { distance: '0.5km', eta: '2-5 mins' }
      }
    }
  }

  // Send location update during emergency
  async updateEmergencyLocation(emergencyId, location) {
    try {
      const response = await fetch(`${this.baseURL}/emergency/${emergencyId}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, timestamp: new Date().toISOString() }),
      })

      return response.ok
    } catch (error) {
      console.error('Location update error:', error)
      return false
    }
  }

  // Cancel emergency
  async cancelEmergency(emergencyId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/emergency/${emergencyId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason, 
          timestamp: new Date().toISOString(),
          status: 'cancelled'
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Cancel emergency error:', error)
      return false
    }
  }
}

export default new EmergencyService()
