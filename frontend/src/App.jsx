import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import JobList from './components/JobList'
import RecommendedJobs from './components/RecommendedJobs'
import RecommendedCandidates from './components/RecommendedCandidates'
import MyApplications from './components/MyApplications'
import MySkills from './components/MySkills'
import JobApplicants from './components/JobApplicants'
import PostJob from './components/PostJob'
import Login from './components/Login'
import Register from './components/Register'

function NavBar({ currentUser, onLogout }) {
  const navigate = useNavigate()

  const handleLogoutClick = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="app-nav">
      <Link to="/">All Jobs</Link>

      {currentUser?.role === 'seeker' && (
        <>
          <Link to="/recommended">Recommended For You</Link>
          <Link to="/my-applications">My Applications</Link>
          <Link to="/my-skills">My Skills</Link>
        </>
      )}
      {currentUser?.role === 'employer' && (
        <>
          <Link to="/candidates">Best Candidates</Link>
          <Link to="/post-job">Post a Job</Link>
          <Link to="/applicants">Applicants</Link>
        </>
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

  const seekerOnly = (element) =>
    currentUser?.role === 'seeker' ? element : <Navigate to="/login" />
  const employerOnly = (element) =>
    currentUser?.role === 'employer' ? element : <Navigate to="/login" />

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>SkillLink Nepal</h1>
          <p>Connecting local talent with local opportunity</p>
          <NavBar currentUser={currentUser} onLogout={handleLogout} />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            <Route path="/recommended" element={seekerOnly(<RecommendedJobs />)} />
            <Route path="/my-applications" element={seekerOnly(<MyApplications currentUser={currentUser} />)} />
            <Route path="/my-skills" element={seekerOnly(<MySkills currentUser={currentUser} />)} />

            <Route path="/candidates" element={employerOnly(<RecommendedCandidates />)} />
            <Route path="/post-job" element={employerOnly(<PostJob currentUser={currentUser} />)} />
            <Route path="/applicants" element={employerOnly(<JobApplicants currentUser={currentUser} />)} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App