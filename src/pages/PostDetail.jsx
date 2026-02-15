import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PromptHeader from '../components/PromptHeader'
import BottomNav from '../components/BottomNav'
import Avatar from '../components/Avatar'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [prompt, setPrompt] = useState(null)
  const [prevId, setPrevId] = useState(null)
  const [nextId, setNextId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('id', id)
      .single()

    if (!data) {
      navigate('/home', { replace: true })
      return
    }

    setPost(data)

    const { data: promptData } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', data.prompt_id)
      .single()
    setPrompt(promptData)

    const { data: allPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('prompt_id', data.prompt_id)
      .order('created_at', { ascending: false })

    if (allPosts) {
      const idx = allPosts.findIndex(p => p.id === id)
      setPrevId(idx > 0 ? allPosts[idx - 1].id : null)
      setNextId(idx < allPosts.length - 1 ? allPosts[idx + 1].id : null)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    )
  }
  if (!post) return null

  return (
    <div className="has-bottom-nav">
      <PromptHeader text={prompt?.text} variant="blue" />

      <div className="d-flex flex-column align-items-center gap-3 p-3">
        <div className="post-detail-card bg-white w-100" style={{ maxWidth: 500 }}>
          {/* User info */}
          <div className="d-flex align-items-center gap-2 p-3">
            <Avatar url={post.profiles?.avatar_url} size={36} />
            <span className="fw-semibold text-sondr-blue">{post.profiles?.username || 'Unknown'}</span>
          </div>

          {/* Photo */}
          <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
            <img src={post.photo_url} alt={post.caption || ''} className="w-100 h-100 aspect-square" />
          </div>

          {/* Story */}
          {post.story && (
            <div className="p-3">
              <p className="text-coral mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{post.story}</p>
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        <div className="d-flex justify-content-between w-100" style={{ maxWidth: 500 }}>
          <button
            className="btn fs-1 fw-light"
            onClick={() => prevId && navigate(`/post/${prevId}`)}
            disabled={!prevId}
            style={{ opacity: prevId ? 1 : 0.2 }}
          >
            &#8249;
          </button>
          <button
            className="btn fs-1 fw-light"
            onClick={() => nextId && navigate(`/post/${nextId}`)}
            disabled={!nextId}
            style={{ opacity: nextId ? 1 : 0.2 }}
          >
            &#8250;
          </button>
        </div>

        <button className="btn bg-sondr-blue text-white rounded-pill fw-bold px-5 py-2" onClick={() => navigate('/home')}>
          BACK
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
