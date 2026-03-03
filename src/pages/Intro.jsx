import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Intro() {
  const { session } = useAuth()
  const navigate = useNavigate()

  async function handleContinue() {
    if (session) {
      await supabase
        .from('profiles')
        .update({ has_seen_intro: true })
        .eq('id', session.user.id)
    }
    navigate('/home', { replace: true })
  }

  return (
    <div className="d-flex flex-column align-items-center min-vh-100 p-5 text-center gap-4">
      <div>
        <h1 className="text-sondr-blue fw-bolder" style={{ fontSize: '3.5rem', letterSpacing: '-1px' }}>
          SONDR
        </h1>
        <div className="d-flex gap-2 mt-2 justify-content-center">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>

      <div style={{ maxWidth: 340 }}>
        <p className="text-coral fw-bold fs-5 mb-3">Not another feed. A mirror.</p>
        <div className="d-flex flex-column gap-3 text-start" style={{ color: '#444' }}>
          <p className="fw-medium mb-0" style={{ lineHeight: 1.7 }}>
            Every 3 days, one shared prompt. Your job: capture a photo, write a few words, and share a piece of your story.
          </p>
          <p className="fw-medium mb-0" style={{ lineHeight: 1.7 }}>
            Then see how others answered the same question — anonymously, honestly, differently.
          </p>
          <p className="fw-medium mb-0" style={{ lineHeight: 1.7, color: 'var(--color-coral)' }}>
            No likes. No followers. Just stories.
          </p>
        </div>
      </div>

      <button
        className="btn bg-sondr-coral text-white fw-bold rounded-pill py-2 px-5 fs-5 mt-auto"
        onClick={handleContinue}
      >
        LET'S GO
      </button>
    </div>
  )
}
