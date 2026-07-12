import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import JobList from './components/JobList'
import RecommendedJobs from './components/RecommendedJobs'
import RecommendedCandidates from './components/RecommendedCandidates'
import Login from './components/Login'
import Register from './components/Register'

function NavBar({ currentUser, onLogin, onLogout }) {
  const navigate = useNavigate()

  const handleLogoutClick = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="app-nav">
      <Link to="/">All Jobs</Link>

      {currentUser?.role === 'seeker' && (
        <Link to="/recommended">Recommended For You</Link>
      )}
      {currentUser?.role === 'employer' && (
        <Link to="/candidates">Best Candidates</Link>
      )}

      {currentUser ? (
        <>
          <span className="nav-user">👤 {currentUser.username} ({currentUser.role})</span>
          <button className="nav-logout" onClick={handleLogoutClick}>Log Out</button>
        </>
      ) : (
        <>
          <Link to="/login">Log In</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (user) => setCurrentUser(user)
  const handleLogout = () => setCurrentUser(null)

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>SkillLink Nepal</h1>
          <p>Connecting local talent with local opportunity</p>
          <NavBar currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/recommended"
              element={currentUser?.role === 'seeker' ? <RecommendedJobs /> : <Navigate to="/login" />}
            />
            <Route
              path="/candidates"
              element={currentUser?.role === 'employer' ? <RecommendedCandidates /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App