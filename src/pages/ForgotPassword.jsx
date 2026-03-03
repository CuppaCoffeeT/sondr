import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(usernameOrEmail)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column align-items-center min-vh-100 px-4 py-5 gap-4">
      <div className="d-flex gap-2">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>

      <div className="text-center">
        <p className="text-coral fw-semibold fs-5 mb-1">Forgot your password?</p>
        <p className="fw-medium fs-6">Enter your username or email and we'll send you a reset link.</p>
      </div>

      {success ? (
        <div className="text-center mt-3" style={{ maxWidth: 360 }}>
          <p className="text-success fw-semibold">Check your email for a password reset link.</p>
          <button
            className="btn btn-outline border-2 border-sondr-blue text-sondr-blue fw-bold rounded-pill py-2 w-100 mt-3"
            onClick={() => navigate('/login')}
          >
            BACK TO LOGIN
          </button>
        </div>
      ) : (
        <form className="d-flex flex-column gap-3 w-100 mt-3" style={{ maxWidth: 360 }} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            className="form-control input-coral rounded-pill py-3 px-4"
            required
          />

          {error && <p className="text-danger text-center small mb-0">{error}</p>}

          <button
            type="submit"
            className="btn btn-outline border-2 border-sondr-blue text-sondr-blue fw-bold rounded-pill py-2 mt-3"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'SEND RESET LINK'}
          </button>
        </form>
      )}

      <button className="btn text-secondary mt-auto" onClick={() => navigate('/login')}>
        Back
      </button>
    </div>
  )
}
