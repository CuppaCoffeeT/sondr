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
        <p className="text-coral fw-bold fs-5 mb-4">Welcome to Sondr</p>
        <p className="fw-medium lh-lg" style={{ color: '#444' }}>
          Sondr is an app designed to be the antithesis of your average social
          media. This is about reflections, contemplation and intention. The app
          will provide you a prompt every 3 days and view posts from that period
          until they're gone. Think about the prompts that are given, add a photo
          and a short caption. Share a part of yourself and think about the
          anonymous stories that other people have to tell.
        </p>
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
