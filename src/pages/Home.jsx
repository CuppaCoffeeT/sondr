import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrentPrompt } from '../hooks/useCurrentPrompt'
import PromptHeader from '../components/PromptHeader'
import PostCard from '../components/PostCard'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { prompt, loading: promptLoading } = useCurrentPrompt()
  const [posts, setPosts] = useState([])
  const [hasPosted, setHasPosted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!prompt || !session) return
    async function fetchData() {
      const [{ count }, { data }] = await Promise.all([
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('prompt_id', prompt.id)
          .eq('user_id', session.user.id),
        supabase
          .from('posts')
          .select('*, profiles(username, avatar_url)')
          .eq('prompt_id', prompt.id)
          .order('created_at', { ascending: false }),
      ])
      setHasPosted(count > 0)
      setPosts(data || [])
      setLoading(false)
    }
    fetchData()
  }, [prompt, session])

  return (
    <div className="has-bottom-nav">
      <PromptHeader text={prompt?.text} variant="blue" />

      <div className="container-fluid p-3">
        {(loading || promptLoading) ? (
          <p className="text-center text-secondary py-5">Loading...</p>
        ) : !hasPosted ? (
          <div className="text-center py-5 px-3">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.5" className="mb-3">
              <rect x="12" y="8" width="40" height="48" rx="6" stroke="var(--color-coral)" strokeWidth="2" />
              <circle cx="32" cy="30" r="8" stroke="var(--color-coral)" strokeWidth="2" />
              <path d="M24 44h16" stroke="var(--color-coral)" strokeWidth="2" strokeLinecap="round" />
              <rect x="26" y="2" width="12" height="10" rx="3" stroke="var(--color-coral)" strokeWidth="2" />
            </svg>
            <p className="text-coral fw-bold mb-2">Capture first, then explore!</p>
            <p className="text-coral small mb-3">Share your response to this week's prompt to see what others posted.</p>
            <button
              className="btn bg-sondr-blue text-white rounded-pill fw-bold px-4 py-2"
              onClick={() => navigate('/camera')}
            >
              CAPTURE NOW
            </button>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-secondary py-5">No posts yet. Be the first to share!</p>
        ) : (
          <div className="row g-3">
            {posts.map(post => (
              <div key={post.id} className="col-6">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
