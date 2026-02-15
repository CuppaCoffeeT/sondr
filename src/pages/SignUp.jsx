import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(username, email, phone, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column align-items-center min-vh-100 px-4 py-5 gap-3">
      <h1 className="text-sondr-blue fw-bolder" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
        SONDR
      </h1>

      <div className="my-1">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="31" stroke="#ccc" strokeWidth="2" />
          <circle cx="32" cy="24" r="10" stroke="#ccc" strokeWidth="2" />
          <path d="M12 54c0-11 9-20 20-20s20 9 20 20" stroke="#ccc" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <form className="d-flex flex-column gap-3 w-100" style={{ maxWidth: 360 }} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="form-control rounded-pill py-3 px-4 text-center"
          required
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="form-control rounded-pill py-3 px-4 text-center"
          required
        />
        <input
          type="tel"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="form-control rounded-pill py-3 px-4 text-center"
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-control rounded-pill py-3 px-4 text-center"
          required
          minLength={6}
        />

        {error && <p className="text-danger text-center small mb-0">{error}</p>}

        <button
          type="submit"
          className="btn btn-outline border-2 border-sondr-blue text-sondr-blue fw-bold rounded-pill py-2 mt-2"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'SIGN UP'}
        </button>
      </form>

      <button className="btn text-secondary mt-auto" onClick={() => navigate('/')}>
        Back
      </button>
    </div>
  )
}
