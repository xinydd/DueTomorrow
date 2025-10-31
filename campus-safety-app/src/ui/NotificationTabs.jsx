import { useState, useEffect } from 'react'
import { useSecurity } from '../state/SecurityContext.jsx'
import incidents from '../state/incidents.json'
import Toast from '../components/Toast.jsx'
import authService from '../services/authService.js'

const tabs = [
  { key: 'guardians', label: 'Guardian Angels' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'system', label: 'System Alerts' },
]

export default function NotificationTabs({ alerts = [], lastUpdated = 'just now' }) {
  const [active, setActive] = useState('guardians')
  const { guardians, nearbyGuardians } = useSecurity()
  const [incidentItems, setIncidentItems] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [loading, setLoading] = useState(true)

  // Use nearby guardians if available, otherwise fall back to all guardians
  const displayGuardians = nearbyGuardians.length > 0 ? nearbyGuardians : guardians

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Fetch real incident reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const response = await authService.authenticatedRequest('/reports', {
          method: 'GET'
        })
        
        // Transform backend reports to incident format
        const transformedReports = response.data.reports.map(report => ({
          id: report._id || report.id,
          title: `${report.type || 'Incident'} - ${report.description?.substring(0, 50) || 'No description'}`,
          time: formatTimeAgo(report.timestamp || report.createdAt),
          status: report.status || 'open',
          type: report.type,
          description: report.description,
          priority: report.priority,
          location: report.location,
          reportedBy: report.userId
        }))
        
        setIncidentItems(transformedReports)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
        // Fall back to demo data if API fails
        setIncidentItems(incidents.map((it, idx) => ({ id: idx + 1, ...it })))
      } finally {
        setLoading(false)
      }
    }
    
    if (active === 'incidents') {
      fetchReports()
    }
  }, [active])

  const handleStartReview = (incident) => {
    setIncidentItems(prev => prev.map(it => it.id === incident.id ? { ...it, status: 'review' } : it))
    setSelectedIncident(null)
    setToast({ visible: true, message: 'Incident moved to review.', type: 'success' })
  }

  const handleMarkReviewed = async (incident) => {
    try {
      // Call backend API to close the report
      await authService.authenticatedRequest(`/reports/${incident.id}/close`, {
        method: 'PATCH',
        body: JSON.stringify({ responseNotes: 'Incident reviewed and marked complete' })
      })
      
      setIncidentItems(prev => prev.map(it => it.id === incident.id ? { ...it, status: 'closed' } : it))
      setToast({ visible: true, message: 'Incident marked as reviewed.', type: 'success' })
    } catch (error) {
      console.error('Failed to close incident:', error)
      setToast({ visible: true, message: 'Failed to mark incident as reviewed.', type: 'error' })
    }
  }

  const closeToast = () => setToast({ visible: false, message: '', type: 'success' })

  return (
    <div className="card p-0 overflow-hidden">
      <div className="grid grid-cols-3 text-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`py-2 ${active === t.key ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {loading && active === 'incidents' && (
          <div className="text-center py-4 text-gray-500">Loading incidents...</div>
        )}
        {active === 'guardians' && displayGuardians.map((g, i) => (
          <SwipeCard key={i} title={g.name} subtitle={`${g.role} • ${g.distance}`} />
        ))}
        {active === 'incidents' && !loading && incidentItems.map((it) => (
          <SwipeCard 
            key={it.id} 
            title={it.title} 
            subtitle={it.time} 
            badge={it.status}
            onOpen={() => setSelectedIncident(it)}
            onReview={() => handleMarkReviewed(it)}
          />
        ))}
        {active === 'system' && alerts.map((a, i) => {
          let badgeColor = 'bg-gray-100 text-gray-700'
          if (a.level === 'safe') {
            badgeColor = 'bg-green-100 text-green-700'
          } else if (a.level === 'danger') {
            badgeColor = 'bg-red-100 text-red-700'
          } else if (a.level === 'caution') {
            badgeColor = 'bg-yellow-100 text-yellow-700'
          }
          return <SwipeCard key={i} title={a.title} subtitle={a.time} badge={a.level} badgeColor={badgeColor} />
        })}
      </div>
      {/* Detail modal for incidents */}
      {selectedIncident && (
        <IncidentDetailModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)}
          onStartReview={() => handleStartReview(selectedIncident)}
        />
      )}

      {/* Toast */}
      <Toast 
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        duration={3000}
      />
    </div>
  )
}

function SwipeCard({ title, subtitle, badge, badgeColor, onOpen, onReview }) {
  const isOpen = badge === 'open'
  const isReview = badge === 'review'

  return (
    <div className="p-3 rounded-xl border flex items-center justify-between bg-white">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      {isOpen && (
        <button onClick={onOpen} className="text-xs px-3 py-1 rounded-full border bg-blue-50 text-blue-700 hover:bg-blue-100">open</button>
      )}
      {isReview && (
        <button onClick={onReview} className="text-xs px-3 py-1 rounded-full border bg-yellow-50 text-yellow-700 hover:bg-yellow-100">review</button>
      )}
      {!isOpen && !isReview && (
        <span className={`text-xs px-2 py-1 rounded-full border ${badgeColor || 'bg-gray-100 text-gray-700'}`}>{badge}</span>
      )}
    </div>
  )
}

function IncidentDetailModal({ incident, onClose, onStartReview }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Incident Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="font-medium">{incident.type || 'Incident'}</div>
          <div className="text-gray-500">{incident.time}</div>
          <div className="text-gray-600">Status: {incident.status}</div>
          {incident.description && (
            <div className="text-gray-600 mt-2">Description: {incident.description}</div>
          )}
          {incident.priority && (
            <div className="text-gray-600">Priority: {incident.priority}</div>
          )}
          {incident.location && (
            <div className="text-gray-600">
              Location: {incident.location.lat?.toFixed(4)}, {incident.location.lng?.toFixed(4)}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border rounded-xl hover:bg-gray-50">Close</button>
          <button onClick={onStartReview} className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Start Review</button>
        </div>
      </div>
    </div>
  )
}


