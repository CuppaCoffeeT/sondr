import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

export default function Profile() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="has-bottom-nav">
      {/* Header */}
      <div className="bg-sondr-yellow p-4">
        <div className="d-flex flex-column align-items-center gap-2">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="31" stroke="#ccc" strokeWidth="2" />
            <circle cx="32" cy="24" r="10" stroke="#ccc" strokeWidth="2" />
            <path d="M12 54c0-11 9-20 20-20s20 9 20 20" stroke="#ccc" strokeWidth="2" fill="none" />
          </svg>
          <div className="d-flex gap-1">
            <span className="dot dot--small" />
            <span className="dot dot--small" />
            <span className="dot dot--small" />
          </div>
          <span className="prompt-pill rounded-pill fw-semibold py-2 px-4 d-inline-block">
            {profile?.username || 'User'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 d-flex flex-column gap-3" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div className="bg-white rounded-3 p-3">
          <p className="text-secondary small mb-1">Username</p>
          <p className="fw-semibold mb-0">{profile?.username || '—'}</p>
        </div>
        <div className="bg-white rounded-3 p-3">
          <p className="text-secondary small mb-1">Email</p>
          <p className="fw-semibold mb-0">{profile?.email || '—'}</p>
        </div>
        <div className="bg-white rounded-3 p-3">
          <p className="text-secondary small mb-1">Phone</p>
          <p className="fw-semibold mb-0">{profile?.phone || 'Not provided'}</p>
        </div>

        <button
          className="btn bg-sondr-coral text-white rounded-pill fw-bold py-2 mt-3"
          onClick={handleLogout}
        >
          LOG OUT
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
