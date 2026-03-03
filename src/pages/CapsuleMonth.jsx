import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import BottomNav from '../components/BottomNav'

const MONTH_NAMES = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function CapsuleMonth() {
  const { year, month } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMonths, setActiveMonths] = useState([])

  const monthNum = parseInt(month)
  const yearNum = parseInt(year)

  useEffect(() => {
    if (!session) return
    async function fetchData() {
      const startDate = new Date(yearNum, monthNum - 1, 1).toISOString()
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59).toISOString()

      const [{ data: monthPosts }, { data: allPosts }] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profiles(username, avatar_url)')
          .eq('user_id', session.user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true })
      ])

      setPosts(monthPosts || [])

      const seen = new Set()
      const months = []
      ;(allPosts || []).forEach(p => {
        const d = new Date(p.created_at)
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`
        if (!seen.has(key)) {
          seen.add(key)
          months.push({ y: d.getFullYear(), m: d.getMonth() + 1 })
        }
      })
      setActiveMonths(months)
      setLoading(false)
    }
    fetchData()
  }, [session, year, month])

  const currentIdx = activeMonths.findIndex(a => a.y === yearNum && a.m === monthNum)
  const prev = currentIdx > 0 ? activeMonths[currentIdx - 1] : null
  const next = currentIdx >= 0 && currentIdx < activeMonths.length - 1 ? activeMonths[currentIdx + 1] : null

  return (
    <div className="has-bottom-nav">
      {/* Header */}
      <div className="bg-sondr-yellow p-3">
        <div className="d-flex align-items-center justify-content-between mx-auto" style={{ maxWidth: 360 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="#ccc" strokeWidth="2" />
            <circle cx="24" cy="18" r="8" stroke="#ccc" strokeWidth="2" />
            <path d="M8 42c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#ccc" strokeWidth="2" fill="none" />
          </svg>
          <div className="d-flex gap-1">
            <span className="dot dot--small" />
            <span className="dot dot--small" />
            <span className="dot dot--small" />
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="prompt-pill rounded-pill fw-semibold py-2 px-4 d-inline-block">
            {MONTH_NAMES[monthNum] || 'MONTH'} {yearNum}
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="p-3">
        {loading ? (
          <p className="text-center text-secondary py-5">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-secondary py-5">No posts this month</p>
        ) : (
          <div className="row g-3">
            {posts.map(post => (
              <div key={post.id} className="col-6">
                <PostCard post={post} from={`/capsule/${year}/${month}`} postIds={posts.map(p => p.id)} />
              </div>
            ))}
          </div>
        )}

        {/* Month navigation */}
        <div className="d-flex justify-content-between mt-3">
          {prev ? (
            <button className="btn fs-1 fw-light" onClick={() => navigate(`/capsule/${prev.y}/${prev.m}`)}>&#8249;</button>
          ) : <span />}
          {next ? (
            <button className="btn fs-1 fw-light" onClick={() => navigate(`/capsule/${next.y}/${next.m}`)}>&#8250;</button>
          ) : <span />}
        </div>
      </div>

      <div className="text-center pb-3">
        <button className="btn bg-sondr-blue text-white rounded-pill fw-bold px-5 py-2" onClick={() => navigate('/capsule')}>
          BACK
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
