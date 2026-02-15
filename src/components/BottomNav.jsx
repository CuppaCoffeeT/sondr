import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/home', label: 'Home', icon: '\u2302' },
  { path: '/capture', label: 'Capture', icon: '\u2295' },
  { path: '/capsule', label: 'My Capsule', icon: '\u2687' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav bg-white border-top d-flex align-items-center justify-content-around">
      {tabs.map(tab => {
        const active = location.pathname.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            className={`btn d-flex flex-column align-items-center gap-0 ${active ? 'text-sondr-blue' : 'text-secondary'}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
