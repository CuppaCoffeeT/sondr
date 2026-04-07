import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrentPrompt } from '../hooks/useCurrentPrompt'
import { supabase } from '../lib/supabase'
import './TestVer.css'

export default function TestVer() {
  const { session, profile, signOut } = useAuth()
  const { prompt, loading: promptLoading } = useCurrentPrompt()
  const navigate = useNavigate()

  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const [todayPosts, setTodayPosts] = useState([])
  const [myPosts, setMyPosts] = useState([])
  const [hasPostedToday, setHasPostedToday] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(true)

  const shuffledPosts = useMemo(() => {
    const copy = [...todayPosts]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [todayPosts])

  useEffect(() => {
    if (!session || !prompt) return
    fetchPosts()
  }, [session, prompt])

  async function fetchPosts() {
    setLoadingPosts(true)
    const userId = session.user.id

    // Get all posts for current prompt
    const { data: allPosts } = await supabase
      .from('posts')
      .select('id, caption, story, photo_url, created_at')
      .eq('prompt_id', prompt.id)
      .order('created_at', { ascending: false })

    setTodayPosts(allPosts || [])

    // Check if user posted for this prompt
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id, caption, story, photo_url, created_at')
      .eq('prompt_id', prompt.id)
      .eq('user_id', userId)

    setHasPostedToday(userPosts && userPosts.length > 0)

    // Get user's recent posts
    const { data: recent } = await supabase
      .from('posts')
      .select('id, caption, story, photo_url, created_at, prompts(text)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    setMyPosts(recent || [])
    setLoadingPosts(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || !prompt || !session) return
    setError('')
    setPosting(true)

    try {
      const userId = session.user.id
      let photoUrl = null

      if (imageFile) {
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Image too large. Maximum 5MB.')
        }
        const fileName = `${userId}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          prompt_id: prompt.id,
          photo_url: photoUrl,
          caption: content.trim(),
          story: '',
        })

      if (insertError) throw insertError

      setContent('')
      setImageFile(null)
      fetchPosts()
    } catch (err) {
      setError(err.message || 'Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (promptLoading) {
    return (
      <div className="test-ver">
        <div className="tv-container">
          <div className="tv-loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-ver">
      <div className="tv-container">
        {/* Header */}
        <div className="tv-header">
          <button className="tv-back-btn" onClick={() => navigate('/capsule')}>
            &larr; Back
          </button>
          <h1 className="tv-title">
            Welcome back, {profile?.username || profile?.email || 'User'}!
          </h1>
        </div>

        {/* Prompt Card */}
        {prompt && (
          <div className="tv-card tv-prompt-card">
            <h3 className="tv-prompt-card-title">Today's Writing Prompt</h3>
            <p className="tv-prompt-text">{prompt.text}</p>
            <p className="tv-prompt-index">
              Prompt #{(prompt.sort_order ?? 0) + 1}
            </p>
          </div>
        )}

        {/* Daily Post Status */}
        <div className={`tv-status ${hasPostedToday ? 'tv-status-info' : 'tv-status-success'}`}>
          Daily post status: {hasPostedToday
            ? "You've already posted for this prompt"
            : 'You can post today'}
        </div>

        {/* Post Form */}
        {!hasPostedToday ? (
          <div>
            <h2 className="tv-form-title">Create a Post</h2>
            <p className="tv-prompt-label">Respond to: {prompt?.text}</p>
            <form className="tv-form-container" onSubmit={handleSubmit}>
              <textarea
                className="tv-textarea"
                placeholder="Write your response here..."
                rows={6}
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <input
                type="file"
                className="tv-file-input"
                accept=".jpg,.jpeg,.heic,.heif,.png"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
              />
              <div className="tv-file-hint">
                <p>Image tips:</p>
                <ul>
                  <li>JPEG, PNG, and HEIC (iPhone) formats supported</li>
                  <li>Maximum file size: 5MB</li>
                  <li>Optional — text-only posts are welcome</li>
                </ul>
              </div>
              {error && <div className="tv-error">{error}</div>}
              <button type="submit" className="tv-btn-primary" disabled={posting}>
                {posting ? 'Submitting...' : 'Submit Post'}
              </button>
            </form>
          </div>
        ) : (
          <div className="tv-empty-state">
            You've already posted for this prompt! Come back for the next one.
          </div>
        )}

        {/* Today's Gallery */}
        {hasPostedToday && todayPosts.length > 0 && (
          <div className="tv-gallery">
            <h2 className="tv-gallery-title">Today's Gallery</h2>
            <p className="tv-gallery-count">
              {todayPosts.length} response{todayPosts.length !== 1 ? 's' : ''} so far
            </p>
            {shuffledPosts.map(post => (
              <div key={post.id} className="tv-post">
                <p className="tv-post-content">{post.caption || post.story || ''}</p>
                {post.photo_url && (
                  <img src={post.photo_url} alt="" className="tv-post-image" />
                )}
                <p className="tv-post-timestamp">
                  Posted today at {formatTime(post.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Posts */}
        {myPosts.length > 0 && (
          <div>
            <h2 className="tv-section-title">Your Recent Posts</h2>
            {myPosts.map(post => (
              <div key={post.id} className="tv-post">
                {post.prompts?.text && (
                  <p className="tv-post-prompt">{post.prompts.text}</p>
                )}
                <p className="tv-post-content">{post.caption || post.story || ''}</p>
                {post.photo_url && (
                  <img src={post.photo_url} alt="" className="tv-post-image" />
                )}
                <p className="tv-post-timestamp">
                  Posted: {formatDate(post.created_at)} at {formatTime(post.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        {loadingPosts && (
          <div className="tv-loading">Loading posts...</div>
        )}

        {/* Logout */}
        <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <button
            className="tv-btn-secondary"
            onClick={() => { signOut(); navigate('/', { replace: true }) }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
