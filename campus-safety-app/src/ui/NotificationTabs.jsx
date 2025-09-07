import { useState } from 'react'
import { useSecurity } from '../state/SecurityContext.jsx'
import incidents from '../state/incidents.json'

const tabs = [
  { key: 'guardians', label: 'Guardian Angels' },
  { key: 'incidents', label: 'Incidents' },
  { key: 'system', label: 'System Alerts' },
]

export default function NotificationTabs({ alerts = [], lastUpdated = 'just now' }) {
  const [active, setActive] = useState('guardians')
  const { guardians, nearbyGuardians } = useSecurity()

  // Use nearby guardians if available, otherwise fall back to all guardians
  const displayGuardians = nearbyGuardians.length > 0 ? nearbyGuardians : guardians

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
        {active === 'guardians' && displayGuardians.map((g, i) => (
          <SwipeCard key={i} title={g.name} subtitle={`${g.role} • ${g.distance}`} />
        ))}
        {active === 'incidents' && incidents.map((it, i) => (
          <SwipeCard key={i} title={it.title} subtitle={it.time} badge={it.status} />
        ))}
        {active === 'system' && alerts.map((a, i) => (
          <SwipeCard key={i} title={a.title} subtitle={a.time} badge={a.level} />
        ))}
      </div>
    </div>
  )
}

function SwipeCard({ title, subtitle, badge }) {
  return (
    <div className="p-3 rounded-xl border flex items-center justify-between bg-white">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      {badge && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border">{badge}</span>}
    </div>
  )
}


