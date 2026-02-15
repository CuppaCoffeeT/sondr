import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function MyCapsule() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const [monthData, setMonthData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!session) return
    async function fetchPosts() {
      setLoading(true)
      const startOfYear = `${selectedYear}-01-01T00:00:00`
      const endOfYear = `${selectedYear}-12-31T23:59:59`
      const { data } = await supabase
        .from('posts')
        .select('id, photo_url, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', startOfYear)
        .lte('created_at', endOfYear)
        .order('created_at', { ascending: true })

      const grouped = {}
      ;(data || []).forEach(post => {
        const month = new Date(post.created_at).getMonth()
        if (!grouped[month]) grouped[month] = post
      })
      setMonthData(grouped)
      setLoading(false)
    }
    fetchPosts()
  }, [session, selectedYear])

  return (
    <div className="has-bottom-nav">
      {/* Header */}
      <div className="bg-sondr-yellow p-3">
        <div className="d-flex align-items-center justify-content-between mx-auto" style={{ maxWidth: 360 }}>
          <button
            className="btn p-0 border-0 bg-transparent"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="#ccc" strokeWidth="2" />
              <circle cx="24" cy="18" r="8" stroke="#ccc" strokeWidth="2" />
              <path d="M8 42c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#ccc" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <span className="prompt-pill rounded-pill fw-semibold py-2 px-4">
            {profile?.username || 'Your'}'s Capsule
          </span>
          <div className="d-flex gap-1">
            <span className="dot dot--small" />
            <span className="dot dot--small" />
            <span className="dot dot--small" />
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="d-flex align-items-center justify-content-center gap-3 py-2">
        <button
          className="btn btn-sm text-coral fw-bold p-0"
          onClick={() => setSelectedYear(y => y - 1)}
        >
          &larr;
        </button>
        <span className="fw-bold text-coral">{selectedYear}</span>
        <button
          className="btn btn-sm text-coral fw-bold p-0"
          onClick={() => setSelectedYear(y => y + 1)}
          disabled={selectedYear >= new Date().getFullYear()}
        >
          &rarr;
        </button>
      </div>

      {/* Month Grid */}
      <div className="container-fluid p-3"><div className="row g-3">
        {MONTHS.map((name, idx) => (
          <div key={name} className="col-6">
            <div
              className="d-flex align-items-center gap-2"
              style={{ cursor: monthData[idx] ? 'pointer' : 'default' }}
              onClick={() => monthData[idx] && navigate(`/capsule/${selectedYear}/${idx + 1}`)}
            >
              <span className="capsule-month-label fw-bold small">{name}</span>
              {monthData[idx] ? (
                <div className="capsule-thumb flex-grow-1">
                  <img src={monthData[idx].photo_url} alt="" loading="lazy" />
                </div>
              ) : (
                <div className="capsule-empty flex-grow-1 d-flex align-items-center justify-content-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.35">
                    <rect x="4" y="8" width="24" height="18" rx="3" stroke="var(--color-coral)" strokeWidth="1.5" />
                    <circle cx="12" cy="16" r="3" stroke="var(--color-coral)" strokeWidth="1.5" />
                    <path d="M4 22l6-5 4 3 6-5 8 7" stroke="var(--color-coral)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div></div>

      {loading && <p className="text-center text-secondary py-3">Loading...</p>}

      <BottomNav />
    </div>
  )
}
