import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to update password')
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
        <p className="text-coral fw-semibold fs-5 mb-1">Reset your password</p>
        <p className="fw-medium fs-6">Enter your new password below.</p>
      </div>

      <form className="d-flex flex-column gap-3 w-100 mt-3" style={{ maxWidth: 360 }} onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-control input-coral rounded-pill py-3 px-4"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="form-control input-coral rounded-pill py-3 px-4"
          required
        />

        {error && <p className="text-danger text-center small mb-0">{error}</p>}

        <button
          type="submit"
          className="btn btn-outline border-2 border-sondr-blue text-sondr-blue fw-bold rounded-pill py-2 mt-3"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'UPDATE PASSWORD'}
        </button>
      </form>
    </div>
  )
}
