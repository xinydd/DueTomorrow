import { Clock, Wifi, RefreshCw, ZoomIn, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function InfoCard({ 
  title, 
  items = [], 
  isLive = true, 
  lastUpdated = 'just now',
  onRefresh,
  onViewAll,
  showZoom = true
}) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const modalRef = useRef(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      }
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll()
    } else {
      setIsZoomed(true)
    }
  }

  // Mobile swipe gesture handling
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance
    const isDownSwipe = distance < -minSwipeDistance

    if (isDownSwipe) {
      setIsZoomed(false)
    }
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false)
      }
    }

    if (isZoomed) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isZoomed])

  return (
    <>
      <div className="card p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
            {isLive && (
              <div className="flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{lastUpdated}</span>
              <span className="sm:hidden text-xs">{lastUpdated.split(' ')[0]}</span>
            </div>
            {showZoom && (
              <button 
                onClick={handleViewAll}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 p-1 -m-1 touch-manipulation"
              >
                <ZoomIn size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">View all</span>
                <span className="sm:hidden">All</span>
              </button>
            )}
          </div>
        </div>
      
      <ul className="space-y-2 sm:space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-start sm:items-center justify-between p-2 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-xs sm:text-sm font-medium break-words">{it.title}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                {it.icon && <it.icon size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />}
                <span className="break-words">{it.subtitle}</span>
              </div>
            </div>
            {it.badge && (
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border flex-shrink-0 ${
                it.badge === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
                it.badge === 'caution' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                it.badge === 'danger' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {it.badge}
              </span>
            )}
          </li>
        ))}
      </ul>
      
        {isLive && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
              <span className="hidden sm:inline">Auto-updating every 30s</span>
              <span className="sm:hidden">Auto-updating</span>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center justify-center sm:justify-start gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-50 p-1 -m-1 touch-manipulation"
              >
                <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh now'}</span>
                <span className="sm:hidden">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Zoomed Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsZoomed(false)}
        >
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Mobile Swipe Indicator */}
            <div className="flex justify-center mb-2 sm:hidden">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Mobile-Optimized Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 pr-2">{title} - Full View</h2>
              <button
                onClick={() => setIsZoomed(false)}
                className="text-gray-400 hover:text-gray-600 p-2 -m-2 touch-manipulation"
                aria-label="Close full view"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Mobile-Optimized Content */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors touch-manipulation">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base break-words">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                        {item.icon && <item.icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />}
                        <span className="break-words">{item.subtitle}</span>
                      </div>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-gray-500 break-words leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    {item.badge && (
                      <span className={`text-xs px-2 sm:px-3 py-1 rounded-full border flex-shrink-0 self-start sm:self-auto ${
                        item.badge === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
                        item.badge === 'caution' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        item.badge === 'danger' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile-Optimized Footer */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-gray-500">
                <span>Total items: {items.length}</span>
                <span className="break-words">Last updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


