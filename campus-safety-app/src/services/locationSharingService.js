// Location sharing service for WhatsApp and Telegram integration
export class LocationSharingService {
  
  // Get current user location with better error handling
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Check if location permission is denied
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            reject(new Error('Location permission denied. Please enable location access in your browser settings.'));
            return;
          }
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Generate Google Maps URL for location
  static generateGoogleMapsUrl(lat, lng, label = 'My Location') {
    return `https://www.google.com/maps?q=${lat},${lng}&ll=${lat},${lng}&z=16`;
  }

  // Generate WhatsApp sharing URL with better formatting
  static generateWhatsAppUrl(lat, lng, message = '') {
    const mapsUrl = this.generateGoogleMapsUrl(lat, lng);
    const defaultMessage = message || `🚨 Emergency Location Alert!\n\n📍 My current location:\n${mapsUrl}\n\nPlease help me!`;
    
    // Use WhatsApp API for better mobile integration
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(defaultMessage)}`;
  }

  // Generate Telegram sharing URL
  static generateTelegramUrl(lat, lng, message = '') {
    const mapsUrl = this.generateGoogleMapsUrl(lat, lng);
    const defaultMessage = message || `🚨 Emergency Location Alert!\n\n📍 My current location:\n${mapsUrl}\n\nPlease help me!`;
    
    return `https://t.me/share/url?url=${encodeURIComponent(mapsUrl)}&text=${encodeURIComponent(defaultMessage)}`;
  }

  // Generate SMS sharing URL
  static generateSMSUrl(lat, lng, message = '') {
    const mapsUrl = this.generateGoogleMapsUrl(lat, lng);
    const defaultMessage = message || `Emergency Location Alert! My current location: ${mapsUrl}`;
    
    return `sms:?body=${encodeURIComponent(defaultMessage)}`;
  }

  // Share location via WhatsApp with better error handling
  static async shareViaWhatsApp(customMessage = '') {
    try {
      const location = await this.getCurrentLocation();
      const whatsappUrl = this.generateWhatsAppUrl(location.lat, location.lng, customMessage);
      
      // Try to open WhatsApp
      const whatsappWindow = window.open(whatsappUrl, '_blank');
      
      // Check if popup was blocked
      if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed == 'undefined') {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(whatsappUrl);
        alert('WhatsApp popup was blocked. The link has been copied to your clipboard. Please paste it in WhatsApp manually.');
      }
      
      return {
        success: true,
        message: 'WhatsApp opened with location sharing',
        location
      };
    } catch (error) {
      console.error('WhatsApp sharing error:', error);
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  // Share location via Telegram with better error handling
  static async shareViaTelegram(customMessage = '') {
    try {
      const location = await this.getCurrentLocation();
      const telegramUrl = this.generateTelegramUrl(location.lat, location.lng, customMessage);
      
      const telegramWindow = window.open(telegramUrl, '_blank');
      
      if (!telegramWindow || telegramWindow.closed || typeof telegramWindow.closed == 'undefined') {
        await navigator.clipboard.writeText(telegramUrl);
        alert('Telegram popup was blocked. The link has been copied to your clipboard. Please paste it in Telegram manually.');
      }
      
      return {
        success: true,
        message: 'Telegram opened with location sharing',
        location
      };
    } catch (error) {
      console.error('Telegram sharing error:', error);
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  // Share location via SMS with better error handling
  static async shareViaSMS(customMessage = '') {
    try {
      const location = await this.getCurrentLocation();
      const smsUrl = this.generateSMSUrl(location.lat, location.lng, customMessage);
      
      const smsWindow = window.open(smsUrl, '_blank');
      
      if (!smsWindow || smsWindow.closed || typeof smsWindow.closed == 'undefined') {
        await navigator.clipboard.writeText(smsUrl);
        alert('SMS popup was blocked. The link has been copied to your clipboard. Please paste it in your SMS app manually.');
      }
      
      return {
        success: true,
        message: 'SMS app opened with location sharing',
        location
      };
    } catch (error) {
      console.error('SMS sharing error:', error);
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  // Show sharing options modal with better error handling and fallback options
  static async showSharingOptions(customMessage = '') {
    try {
      // First try to get location
      const location = await this.getCurrentLocation();
      
      // Create sharing options modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Share Your Location</h3>
            <p class="text-gray-600 text-sm">Choose how you want to share your current location</p>
            <p class="text-xs text-gray-500 mt-2">📍 Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</p>
          </div>
          
          <div class="space-y-3">
            <button id="whatsapp-share" class="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-8.49A9.87 9.87 0 0111.5 2.5a9.87 9.87 0 010 19.285z"/>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">WhatsApp</div>
                <div class="text-sm text-gray-500">Share via WhatsApp</div>
              </div>
            </button>
            
            <button id="telegram-share" class="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">Telegram</div>
                <div class="text-sm text-gray-500">Share via Telegram</div>
              </div>
            </button>
            
            <button id="sms-share" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">SMS</div>
                <div class="text-sm text-gray-500">Share via SMS</div>
              </div>
            </button>
          </div>
          
          <button id="close-modal" class="w-full mt-4 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      `;

      document.body.appendChild(modal);

      // Add event listeners
      document.getElementById('whatsapp-share').addEventListener('click', async () => {
        const result = await this.shareViaWhatsApp(customMessage);
        document.body.removeChild(modal);
        if (!result.success) {
          alert(`WhatsApp sharing failed: ${result.message}`);
        }
      });

      document.getElementById('telegram-share').addEventListener('click', async () => {
        const result = await this.shareViaTelegram(customMessage);
        document.body.removeChild(modal);
        if (!result.success) {
          alert(`Telegram sharing failed: ${result.message}`);
        }
      });

      document.getElementById('sms-share').addEventListener('click', async () => {
        const result = await this.shareViaSMS(customMessage);
        document.body.removeChild(modal);
        if (!result.success) {
          alert(`SMS sharing failed: ${result.message}`);
        }
      });

      document.getElementById('close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });

      return {
        success: true,
        message: 'Sharing options displayed',
        location
      };

    } catch (error) {
      console.error('Location sharing error:', error);
      
      // Show fallback options modal instead of just error
      const fallbackModal = document.createElement('div');
      fallbackModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto';
      fallbackModal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Location Access Issue</h3>
            <p class="text-gray-600 text-sm mb-4">${error.message}</p>
            <p class="text-gray-500 text-xs mb-4">Don't worry! You can still share your location using these options:</p>
          </div>
          
          <div class="space-y-3">
            <button id="manual-location" class="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">Enter Location Manually</div>
                <div class="text-sm text-gray-500">Type your current location</div>
              </div>
            </button>
            
            <button id="campus-location" class="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">Use Campus Location</div>
                <div class="text-sm text-gray-500">UTM Campus (1.5595, 103.6381)</div>
              </div>
            </button>
            
            <button id="try-again" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900">Try Again</div>
                <div class="text-sm text-gray-500">Retry location detection</div>
              </div>
            </button>
          </div>
          
          <div class="text-left text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
            <p class="font-medium mb-2">To enable location access:</p>
            <ol class="list-decimal list-inside space-y-1">
              <li>Click the location icon (📍) in your browser's address bar</li>
              <li>Select "Allow" for location access</li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
          
          <button id="close-fallback-modal" class="w-full mt-4 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      `;

      document.body.appendChild(fallbackModal);

      // Add event listeners for fallback options
      document.getElementById('manual-location').addEventListener('click', () => {
        document.body.removeChild(fallbackModal);
        this.showManualLocationInput(customMessage);
      });

      document.getElementById('campus-location').addEventListener('click', () => {
        document.body.removeChild(fallbackModal);
        this.shareCampusLocation(customMessage);
      });

      document.getElementById('try-again').addEventListener('click', () => {
        document.body.removeChild(fallbackModal);
        // Try again after a short delay
        setTimeout(() => {
          this.showSharingOptions(customMessage);
        }, 500);
      });

      document.getElementById('close-fallback-modal').addEventListener('click', () => {
        document.body.removeChild(fallbackModal);
      });

      fallbackModal.addEventListener('click', (e) => {
        if (e.target === fallbackModal) {
          document.body.removeChild(fallbackModal);
        }
      });

      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }
  }

  // Show manual location input modal
  static showManualLocationInput(customMessage = '') {
    const inputModal = document.createElement('div');
    inputModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto';
    inputModal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Enter Your Location</h3>
          <p class="text-gray-600 text-sm mb-4">Type your current location or address</p>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location Description</label>
            <input 
              id="location-input" 
              type="text" 
              placeholder="e.g., UTM Main Library, Block A, Near Cafeteria..."
              class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Latitude (optional)</label>
              <input 
                id="lat-input" 
                type="number" 
                step="any"
                placeholder="1.5595"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Longitude (optional)</label>
              <input 
                id="lng-input" 
                type="number" 
                step="any"
                placeholder="103.6381"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button id="cancel-manual" class="flex-1 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button id="share-manual" class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Share Location
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(inputModal);

    document.getElementById('share-manual').addEventListener('click', () => {
      const locationText = document.getElementById('location-input').value.trim();
      const lat = document.getElementById('lat-input').value;
      const lng = document.getElementById('lng-input').value;
      
      if (!locationText && !lat && !lng) {
        alert('Please enter a location description or coordinates');
        return;
      }
      
      document.body.removeChild(inputModal);
      
      // Use provided coordinates or default campus location
      const finalLat = lat || 1.5595;
      const finalLng = lng || 103.6381;
      const finalMessage = customMessage + (locationText ? `\n📍 Location: ${locationText}` : '');
      
      this.shareWithCoordinates(finalLat, finalLng, finalMessage);
    });

    document.getElementById('cancel-manual').addEventListener('click', () => {
      document.body.removeChild(inputModal);
    });

    inputModal.addEventListener('click', (e) => {
      if (e.target === inputModal) {
        document.body.removeChild(inputModal);
      }
    });
  }

  // Share campus location as fallback
  static shareCampusLocation(customMessage = '') {
    const campusLat = 1.5595;
    const campusLng = 103.6381;
    const campusMessage = customMessage + '\n📍 Location: UTM Campus (Universiti Teknologi Malaysia)';
    
    this.shareWithCoordinates(campusLat, campusLng, campusMessage);
  }

  // Share location with specific coordinates
  static shareWithCoordinates(lat, lng, customMessage = '') {
    const sharingModal = document.createElement('div');
    sharingModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[9998] p-4 overflow-y-auto';
    sharingModal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Share Your Location</h3>
          <p class="text-gray-600 text-sm">Choose how you want to share your location</p>
          <p class="text-xs text-gray-500 mt-2">📍 Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
        </div>
        
        <div class="space-y-3">
          <button id="whatsapp-share-coords" class="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
            <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-8.49A9.87 9.87 0 0111.5 2.5a9.87 9.87 0 010 19.285z"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">WhatsApp</div>
              <div class="text-sm text-gray-500">Share via WhatsApp</div>
            </div>
          </button>
          
          <button id="telegram-share-coords" class="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">Telegram</div>
              <div class="text-sm text-gray-500">Share via Telegram</div>
            </div>
          </button>
          
          <button id="sms-share-coords" class="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
            <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <div class="text-left">
              <div class="font-medium text-gray-900">SMS</div>
              <div class="text-sm text-gray-500">Share via SMS</div>
            </div>
          </button>
        </div>
        
        <button id="close-coords-modal" class="w-full mt-4 py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    `;

    document.body.appendChild(sharingModal);

    // Add event listeners
    document.getElementById('whatsapp-share-coords').addEventListener('click', () => {
      const whatsappUrl = this.generateWhatsAppUrl(lat, lng, customMessage);
      const whatsappWindow = window.open(whatsappUrl, '_blank');
      
      if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed == 'undefined') {
        navigator.clipboard.writeText(whatsappUrl);
        alert('WhatsApp popup was blocked. The link has been copied to your clipboard.');
      }
      
      document.body.removeChild(sharingModal);
    });

    document.getElementById('telegram-share-coords').addEventListener('click', () => {
      const telegramUrl = this.generateTelegramUrl(lat, lng, customMessage);
      const telegramWindow = window.open(telegramUrl, '_blank');
      
      if (!telegramWindow || telegramWindow.closed || typeof telegramWindow.closed == 'undefined') {
        navigator.clipboard.writeText(telegramUrl);
        alert('Telegram popup was blocked. The link has been copied to your clipboard.');
      }
      
      document.body.removeChild(sharingModal);
    });

    document.getElementById('sms-share-coords').addEventListener('click', () => {
      const smsUrl = this.generateSMSUrl(lat, lng, customMessage);
      const smsWindow = window.open(smsUrl, '_blank');
      
      if (!smsWindow || smsWindow.closed || typeof smsWindow.closed == 'undefined') {
        navigator.clipboard.writeText(smsUrl);
        alert('SMS popup was blocked. The link has been copied to your clipboard.');
      }
      
      document.body.removeChild(sharingModal);
    });

    document.getElementById('close-coords-modal').addEventListener('click', () => {
      document.body.removeChild(sharingModal);
    });

    sharingModal.addEventListener('click', (e) => {
      if (e.target === sharingModal) {
        document.body.removeChild(sharingModal);
      }
    });
  }
}

export default LocationSharingService;
