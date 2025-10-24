import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Eye, BarChart3, Clock, MapPin } from 'lucide-react'

const AIAnalysisDashboard = () => {
  const [analyses, setAnalyses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAnalyses()
    fetchStats()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai-analysis')
      if (response.ok) {
        const data = await response.json()
        setAnalyses(data.data.analyses)
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai-analysis/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnalyses = analyses.filter(analysis => {
    if (filter === 'all') return true
    return analysis.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50'
      case 'moderate_safety': return 'text-yellow-600 bg-yellow-50'
      case 'low_safety': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return <CheckCircle size={16} />
      case 'moderate_safety': return <AlertTriangle size={16} />
      case 'low_safety': return <AlertTriangle size={16} />
      default: return <Eye size={16} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Safety Analysis Dashboard</h2>
          <p className="text-gray-600">Monitor AI camera scan results and safety patterns</p>
        </div>
        <button
          onClick={() => { fetchAnalyses(); fetchStats(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-bold text-gray-800">{stats.last24Hours}</p>
              </div>
              <Clock className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Safety Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowSafetyCount}</p>
              </div>
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Safety Score</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageSafetyScore}/100</p>
              </div>
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['all', 'safe', 'moderate_safety', 'low_safety'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Analysis List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent AI Analysis Results</h3>
        </div>
        
        <div className="divide-y">
          {filteredAnalyses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No analysis results found for the selected filter.
            </div>
          ) : (
            filteredAnalyses.map((analysis) => (
              <div key={analysis.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(analysis.status)}`}>
                        {getStatusIcon(analysis.status)}
                        {analysis.status.replace('_', ' ')}
                      </div>
                      <span className="text-sm text-gray-500">
                        User: {analysis.userId}
                      </span>
                      <span className="text-sm text-gray-500">
                        Score: {analysis.safetyScore}/100
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Environment:</strong> {analysis.analysisResult.colors.environment}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Lighting:</strong> {analysis.analysisResult.brightness.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Structure:</strong> {analysis.analysisResult.patterns.structure}
                      </p>
                    </div>

                    {analysis.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(analysis.timestamp).toLocaleString()}</p>
                    {analysis.location && (
                      <p className="flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {analysis.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Concerns */}
      {stats && stats.topConcerns.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Top Safety Concerns</h3>
          <div className="space-y-2">
            {stats.topConcerns.map((concern, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="capitalize">{concern.concern}</span>
                <span className="text-sm text-gray-600">{concern.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalysisDashboard
