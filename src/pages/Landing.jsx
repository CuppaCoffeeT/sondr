import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && session) navigate('/home', { replace: true })
  }, [session, loading, navigate])

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    )
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-5 text-center gap-5">
      <div>
        <h1 className="text-sondr-blue fw-bolder" style={{ fontSize: '4rem', letterSpacing: '-1px' }}>
          SONDR
        </h1>
        <div className="d-flex gap-2 mt-2 justify-content-center">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>

      <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: 280 }}>
        <button
          className="btn bg-sondr-coral text-white fw-bold rounded-pill py-2 px-4 fs-5"
          onClick={() => navigate('/login')}
        >
          LOGIN
        </button>
        <button
          className="btn btn-outline border-2 border-coral text-coral fw-bold rounded-pill py-2 px-4 fs-5"
          onClick={() => navigate('/signup')}
        >
          SIGN UP
        </button>
      </div>
    </div>
  )
}
