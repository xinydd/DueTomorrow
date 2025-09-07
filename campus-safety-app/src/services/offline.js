// Offline support service with caching and sync
class OfflineService {
  constructor() {
    this.cacheName = 'campus-safety-cache-v1'
    this.syncQueue = []
    this.isOnline = navigator.onLine
    this.setupEventListeners()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Cache data for offline use
  async cacheData(key, data) {
    try {
      const cache = await caches.open(this.cacheName)
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      })
      await cache.put(key, response)
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  // Retrieve cached data
  async getCachedData(key) {
    try {
      const cache = await caches.open(this.cacheName)
      const response = await cache.match(key)
      if (response) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get cached data:', error)
    }
    return null
  }

  // Queue data for sync when online
  queueForSync(type, data) {
    const syncItem = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    }
    
    this.syncQueue.push(syncItem)
    this.saveSyncQueue()
  }

  // Save sync queue to localStorage
  saveSyncQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  // Load sync queue from localStorage
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('syncQueue')
      if (saved) {
        this.syncQueue = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
    }
  }

  // Sync pending data when online
  async syncPendingData() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const itemsToSync = [...this.syncQueue]
    this.syncQueue = []

    for (const item of itemsToSync) {
      try {
        await this.syncItem(item)
      } catch (error) {
        console.error('Failed to sync item:', error)
        // Re-queue if retries < max
        if (item.retries < 3) {
          item.retries++
          this.syncQueue.push(item)
        }
      }
    }

    this.saveSyncQueue()
  }

  // Sync individual item
  async syncItem(item) {
    const { type, data } = item
    
    switch (type) {
      case 'incident':
        await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        break
      case 'sos':
        await fetch('/api/emergency/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        break
      case 'escort':
        await fetch('/api/escort', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        break
      default:
        console.warn('Unknown sync type:', type)
    }
  }

  // Get offline status
  isOffline() {
    return !this.isOnline
  }

  // Get pending sync count
  getPendingSyncCount() {
    return this.syncQueue.length
  }

  // Clear all cached data
  async clearCache() {
    try {
      await caches.delete(this.cacheName)
      this.syncQueue = []
      this.saveSyncQueue()
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  // Initialize offline service
  async initialize() {
    this.loadSyncQueue()
    
    // Cache initial data
    const initialData = {
      alerts: [
        { title: 'System offline - using cached data', time: 'now', level: 'caution' }
      ],
      guardians: [
        { name: 'Cached Guardian', distance: 'Unknown', role: 'student' }
      ]
    }
    
    await this.cacheData('initial-data', initialData)
  }
}

export default new OfflineService()
