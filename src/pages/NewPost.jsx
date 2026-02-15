import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCapture } from '../context/CaptureContext'
import { useCurrentPrompt } from '../hooks/useCurrentPrompt'
import { supabase } from '../lib/supabase'
import PromptHeader from '../components/PromptHeader'
import BottomNav from '../components/BottomNav'

export default function NewPost() {
  const { photoBlob, photoPreview, clearPhoto } = useCapture()
  const { prompt } = useCurrentPrompt()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [caption, setCaption] = useState('')
  const [story, setStory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!photoBlob || !photoPreview) {
    navigate('/capture', { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt || !session) return
    setError('')
    setLoading(true)

    try {
      const userId = session.user.id
      const fileName = `${userId}/${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photoBlob, { contentType: 'image/jpeg', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          prompt_id: prompt.id,
          photo_url: urlData.publicUrl,
          caption,
          story,
        })

      if (insertError) throw insertError

      clearPhoto()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="has-bottom-nav">
      <PromptHeader text={prompt?.text} variant="blue" />

      <div className="px-3 pt-3">
        <button
          type="button"
          className="btn btn-sm text-secondary p-0"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
      </div>

      <form className="d-flex flex-column gap-3 p-3" onSubmit={handleSubmit}>
        {/* Photo + Caption */}
        <div className="bg-white rounded-3 border overflow-hidden">
          <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
            <img src={photoPreview} alt="Your photo" className="w-100 h-100 aspect-square" />
          </div>
          <input
            type="text"
            placeholder="Insert Caption here..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="form-control caption-input py-2"
          />
        </div>

        {/* Story Section */}
        <div className="story-section">
          <div className="text-center p-3">
            <p className="text-coral fw-bold mb-1">What's your story?</p>
            <p className="text-coral small fw-medium mb-0">
              What did the prompt mean to you? Share it through your photo.
            </p>
          </div>
          <textarea
            placeholder="Insert text here..."
            value={story}
            onChange={e => setStory(e.target.value)}
            className="form-control"
            rows={6}
          />
        </div>

        {error && <p className="text-danger text-center small mb-0">{error}</p>}

        <button
          type="submit"
          className="btn bg-sondr-blue text-white rounded-pill fw-bold px-5 py-2 align-self-center"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'POST'}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
