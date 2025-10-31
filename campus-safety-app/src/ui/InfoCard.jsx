import { useState } from 'react'
import { Clock, Wifi, RefreshCw, X, MapPin, Users, AlertTriangle, Route, Phone } from 'lucide-react'

export default function InfoCard({ title, items = [], isLive = true, lastUpdated = 'just now', onRefresh, onViewAll }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showExpandedView, setShowExpandedView] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      } else {
        // Simulate refresh delay
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewAll = () => {
    setShowExpandedView(!showExpandedView)
    if (onViewAll) {
      onViewAll()
    }
  }

  const getIconForTitle = (title) => {
    if (title.includes('Security') || title.includes('Alert')) return AlertTriangle
    if (title.includes('Guardian') || title.includes('Angel')) return Users
    if (title.includes('Route') || title.includes('Safe')) return Route
    return MapPin
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-semibold truncate">{title}</h3>
          {isLive && (
            <div className="flex items-center gap-1 text-xs text-green-600 whitespace-nowrap">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
            <Clock size={12} />
            <span>{lastUpdated}</span>
          </div>
          <button 
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
          >
            {showExpandedView ? 'Show less' : 'View all'}
          </button>
        </div>
      </div>
      
      {/* Collapsed View - Show only first 3 items */}
      {!showExpandedView && (
        <ul className="space-y-2">
          {items.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.icon && <item.icon size={14} className="text-gray-400" />}
                <span className="text-sm">{item.title}</span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  item.badge === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
                  item.badge === 'caution' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  item.badge === 'danger' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Expanded View - Show all items with details */}
      {showExpandedView && (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              {/* Item Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-800 mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {item.icon && <item.icon size={12} />}
                    {item.subtitle}
                  </div>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                    item.badge === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
                    item.badge === 'caution' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    item.badge === 'danger' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Enhanced Details for Security Alerts */}
              {title.includes('Security') || title.includes('Alert') ? (
                <div className="space-y-2">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {item.location || 'Campus Area'}
                    </span>
                  </div>
                  
                  {/* Time and Status */}
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {item.time || item.subtitle}
                    </span>
                  </div>
                  
                  {/* Description */}
                  {item.description && (
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                      {item.description}
                    </div>
                  )}
                  
                  {/* Severity Level */}
                  <div className="flex items-center gap-2 text-xs">
                    <AlertTriangle className={`w-3 h-3 ${
                      item.badge === 'danger' ? 'text-red-500' :
                      item.badge === 'caution' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <span className="text-gray-600">
                      Severity: {item.badge === 'danger' ? 'High' : 
                               item.badge === 'caution' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  
                  {/* Action Required */}
                  {item.badge === 'danger' && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                      <div className="text-xs text-red-700 font-medium">
                        ⚠️ Immediate action required
                      </div>
                    </div>
                  )}
                </div>
              ) : title.includes('Guardian') || title.includes('Angel') ? (
                /* Enhanced details for Guardian Angels */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {item.distance || 'Nearby'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      Available now
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                      {item.description}
                    </div>
                  )}
                </div>
              ) : title.includes('Route') || title.includes('Safe') ? (
                /* Enhanced details for Safe Routes */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Route className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {item.distance || 'Recommended route'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">
                      {item.duration || '5-10 minutes'}
                    </span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                      {item.description}
                    </div>
                  )}
                </div>
              ) : (
                /* Standard details for other sections */
                <div className="text-xs text-gray-600">
                  {item.description || 'No additional details available'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {showExpandedView && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Show on Map clicked for:', title, 'with items:', items)
                  
                  // Navigate to map with zoom to show all items
                  window.dispatchEvent(new CustomEvent('navigateToMap', { 
                    detail: { zoomToItems: items, title: title }
                  }))
                  
                  // Navigate to map tab
                  window.dispatchEvent(new CustomEvent('navigateToTab', { 
                    detail: { tab: 'map' }
                  }))
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
              >
                <MapPin size={12} />
                Show on Map
              </button>
              
              {title.includes('Security') || title.includes('Alert') && (
                <button
                  onClick={() => {
                    // Call security
                    window.open('tel:999', '_self')
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                >
                  <Phone size={12} />
                  Call Security
                </button>
              )}
            </div>
          )}
          
          {isLive && (
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh now'}
            </button>
          )}
        </div>
        
        {isLive && !showExpandedView && (
          <div className="text-xs text-gray-500 mt-1">
            Auto-updating every 30s
          </div>
        )}
      </div>
    </div>
  )
}