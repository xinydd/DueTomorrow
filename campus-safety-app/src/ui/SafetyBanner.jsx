const statusToUI = {
  safe: { 
    label: 'Safe Zone', 
    message: "You're in a safe area. Security patrol nearby.",
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  },
  caution: { 
    label: 'Caution', 
    message: 'Low lighting ahead. Stay alert.',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡'
  },
  danger: { 
    label: 'High Risk', 
    message: 'Reported suspicious activity nearby.',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴'
  },
}

export default function SafetyBanner({ status = 'safe' }) {
  const ui = statusToUI[status] ?? statusToUI.safe
  return (
    <div className={`card p-4 border ${ui.className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{ui.icon}</span>
            <div>
              <div className="text-sm font-medium">Campus Safety Status</div>
              <div className="text-lg font-bold">{ui.label}</div>
            </div>
          </div>
          <div className="text-sm opacity-90">{ui.message}</div>
        </div>
        <div className="text-xs opacity-70 ml-2">Live</div>
      </div>
    </div>
  )
}


