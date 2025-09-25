import { useEffect, useState } from 'react'
import { MapPin, Users, Route, AlertTriangle, Shield, FileText, Share2 } from 'lucide-react'
import { useSecurity } from '../state/SecurityContext.jsx'
import SafetyBanner from '../ui/SafetyBanner.jsx'
import SOSButton from '../ui/SOSButton.jsx'
import QuickActions from '../ui/QuickActions.jsx'
import InfoCard from '../ui/InfoCard.jsx'
import LocationSharingService from '../services/locationSharingService'

export default function Home() {
  const { 
    securityStatus, 
    alerts, 
    guardians, 
    nearbyGuardians, 
    patrols, 
    lastUpdated,
    refreshData,
    user,
    hasRole,
    hasAnyRole
  } = useSecurity()

  const [refreshingSection, setRefreshingSection] = useState(null)

  const handleRefresh = async (section) => {
    setRefreshingSection(section)
    try {
      // Simulate fetching new data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Generate new random data
      if (section === 'alerts') {
        // Add new random alert
        const newAlert = {
          id: Date.now(),
          title: `New incident reported near ${['Library', 'Engineering Block', 'Parking Lot', 'Cafeteria'][Math.floor(Math.random() * 4)]}`,
          time: 'just now',
          level: ['safe', 'caution', 'danger'][Math.floor(Math.random() * 3)]
        }
        console.log('New alert added:', newAlert)
      } else if (section === 'guardians') {
        // Update guardian positions
        console.log('Guardian positions updated')
      } else if (section === 'routes') {
        // Update route suggestions
        console.log('Route suggestions updated')
      }
      
      if (refreshData) {
        await refreshData()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshingSection(null)
    }
  }

  const handleViewAll = (section) => {
    console.log(`View all ${section} clicked`)
    // This will trigger the expanded view modal in InfoCard
  }

  const getRoleBasedContent = () => {
    if (hasRole('student')) {
      return (
        <>
          <SafetyBanner status={securityStatus} />
          
          <div className="grid place-items-center">
            <SOSButton />
            
            {/* Quick Location Sharing Button */}
            <button
              onClick={async () => {
                // Service handles all error display
                await LocationSharingService.showSharingOptions();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Share2 size={16} />
              <span>Share Location</span>
            </button>
          </div>
          
          <QuickActions />
        </>
      )
    }

    if (hasRole('staff')) {
      return (
        <>
          <SafetyBanner status={securityStatus} />
          
          <div className="grid place-items-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800">Staff Dashboard</h3>
              <p className="text-green-600 text-sm">Monitor reports and assist students</p>
            </div>
          </div>
        </>
      )
    }

    if (hasRole('security')) {
      return (
        <>
          <SafetyBanner status={securityStatus} />
          
          <div className="grid place-items-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-red-800">Security Dashboard</h3>
              <p className="text-red-600 text-sm">Manage alerts and respond to emergencies</p>
            </div>
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="space-y-4">
      {getRoleBasedContent()}

      <div className="grid gap-3">
        <InfoCard 
          title="Security Alerts" 
          items={alerts.map(a => ({
            title: a.title,
            subtitle: a.time,
            badge: a.level,
            icon: AlertTriangle,
            location: a.location || 'Campus Area',
            time: a.time,
            description: a.description || `Security incident reported at ${a.location || 'campus area'}. Please exercise caution and report any suspicious activity to campus security.`,
            severity: a.level
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={() => handleRefresh('alerts')}
          onViewAll={() => handleViewAll('alerts')}
        />

        <InfoCard 
          title="Guardian Angels Nearby" 
          items={nearbyGuardians.length > 0 ? nearbyGuardians.map(g => ({
            title: g.name,
            subtitle: g.distance,
            badge: g.role,
            icon: Users,
            distance: g.distance,
            description: `${g.name} is a ${g.role} available to help with campus safety. They are currently ${g.distance} away and can provide assistance with walking companions, emergency situations, or general safety concerns.`,
            status: 'Available now',
            contact: g.phone || 'Contact via app'
          })) : guardians.map(g => ({
            title: g.name,
            subtitle: g.distance,
            badge: g.role,
            icon: Users,
            distance: g.distance,
            description: `${g.name} is a ${g.role} available to help with campus safety. They are currently ${g.distance} away and can provide assistance with walking companions, emergency situations, or general safety concerns.`,
            status: 'Available now',
            contact: g.phone || 'Contact via app'
          }))} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={() => handleRefresh('guardians')}
          onViewAll={() => handleViewAll('guardians')}
        />

        <InfoCard 
          title="Safe Route Suggestions" 
          items={[
            { 
              title: 'Library → Dorm A', 
              subtitle: '10 min • well-lit • security cameras', 
              badge: 'safe',
              icon: Route,
              distance: '0.8 km',
              duration: '10 minutes',
              description: 'This route is well-lit with security cameras throughout. It passes through the main campus plaza and includes emergency call boxes at regular intervals. Recommended for evening travel.',
              features: ['Well-lit path', 'Security cameras', 'Emergency call boxes', 'Main campus area']
            },
            { 
              title: 'Gym → Parking P2', 
              subtitle: '8 min • caution • low lighting', 
              badge: 'caution',
              icon: Route,
              distance: '0.6 km',
              duration: '8 minutes',
              description: 'This route has some areas with lower lighting. While generally safe, it\'s recommended to travel with a companion during evening hours. Emergency call boxes are available.',
              features: ['Some low lighting', 'Emergency call boxes', 'Companion recommended', 'Evening caution']
            },
            { 
              title: 'Cafeteria → Study Hall', 
              subtitle: '5 min • safe • busy area', 
              badge: 'safe',
              icon: Route,
              distance: '0.4 km',
              duration: '5 minutes',
              description: 'Short and safe route through a busy campus area. This path is well-traveled and has good lighting. Perfect for quick trips between buildings.',
              features: ['Busy area', 'Good lighting', 'Short distance', 'Well-traveled path']
            }
          ]} 
          isLive={true}
          lastUpdated={lastUpdated}
          onRefresh={() => handleRefresh('routes')}
          onViewAll={() => handleViewAll('routes')}
        />
      </div>
    </div>
  )
}


