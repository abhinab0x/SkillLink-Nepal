import { useState } from 'react'
import api from '../api/axios'
import './AuthForms.css'
import { useNavigate } from 'react-router-dom'

// NOTE: This is a simplified login for demo purposes - it looks the user up
// by username only. Real password verification + JWT tokens are built in the
// "Advanced Features" phase. This lets the UI flow work end-to-end now.
function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    api.get('users/')
      .then((res) => {
        const found = res.data.find((u) => u.username === username)
        if (found) {
          onLogin(found)
          navigate('/')
        } else {
          setMessage('No account found with that username.')
        }
      })
      .catch((err) => {
        console.error(err)
        setMessage('Login failed. Is the Django server running?')
      })
  }

  return (
    <div className="auth-form-wrapper">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        <button type="submit">Log In</button>
      </form>
      {message && <p className="auth-message error">{message}</p>}
      <p className="auth-hint">Try "ramesh_dev" (seeker) or "techhub_np" (employer)</p>
    </div>
  )
}

export default Login