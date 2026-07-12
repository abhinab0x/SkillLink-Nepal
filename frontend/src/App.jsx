import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

import JobList from './components/JobList'
import RecommendedJobs from './components/RecommendedJobs'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1>SkillLink Nepal</h1>
          <p>Connecting local talent with local opportunity</p>
          <nav className="app-nav">
            <Link to="/">All Jobs</Link>
            <Link to="/recommended">Recommended For You</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/recommended" element={<RecommendedJobs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App