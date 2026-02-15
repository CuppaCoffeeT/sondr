import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(username, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
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
        <p className="text-coral fw-semibold fs-5 mb-1">One shared prompt.</p>
        <p className="fw-medium fs-5">A thousand different stories</p>
      </div>

      <form className="d-flex flex-column gap-3 w-100 mt-3" style={{ maxWidth: 360 }} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="form-control input-coral rounded-pill py-3 px-4"
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-control input-coral rounded-pill py-3 px-4"
          required
        />

        {error && <p className="text-danger text-center small mb-0">{error}</p>}

        <button
          type="submit"
          className="btn btn-outline border-2 border-sondr-blue text-sondr-blue fw-bold rounded-pill py-2 mt-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>

      <button className="btn text-secondary mt-auto" onClick={() => navigate('/')}>
        Back
      </button>
    </div>
  )
}
