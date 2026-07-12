import { useState, useEffect } from 'react'
import api from '../api/axios'
import './RecommendedJobs.css'

// TEMPORARY: hardcoded to TechHub's job (job_id=1) until employer login exists.
const CURRENT_JOB_ID = 1

function RecommendedCandidates() {
  const [candidates, setCandidates] = useState([])
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`jobs/${CURRENT_JOB_ID}/recommended-candidates/`)
      .then((response) => {
        setCandidates(response.data)
        if (response.data.length > 0) setJobTitle(response.data[0].job_title)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching candidates:', err)
        setError('Could not load candidates. Is the Django server running?')
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="status-message">Finding your best candidates...</p>
  if (error) return <p className="status-message error">{error}</p>
  if (candidates.length === 0) {
    return <p className="status-message">No matching candidates found yet.</p>
  }

  return (
    <div className="recommended-jobs">
      <h2>Best Candidates for {jobTitle || 'this job'}</h2>
      <p className="subtitle">Ranked by skill match, proficiency, and location</p>

      {candidates.map((cand) => (
        <div className="rec-card" key={cand.user_id}>
          <div className="rec-card-header">
            <h3>{cand.candidate_username}</h3>
            <div className="match-badge">
              <span className="match-percent">{cand.match_percentage}%</span>
              <span className="match-label">match</span>
            </div>
          </div>

          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${Math.min(cand.match_percentage, 100)}%` }}
            />
          </div>

          <div className="rec-details">
            {cand.matched_required_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label matched">✓ Required skills they have:</span>
                {cand.matched_required_skills.map((s) => (
                  <span className="skill-tag matched" key={s}>{s}</span>
                ))}
              </div>
            )}

            {cand.missing_required_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label missing">✗ Required skills they're missing:</span>
                {cand.missing_required_skills.map((s) => (
                  <span className="skill-tag missing" key={s}>{s}</span>
                ))}
              </div>
            )}

            {cand.matched_preferred_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label preferred">+ Preferred skills they have:</span>
                {cand.matched_preferred_skills.map((s) => (
                  <span className="skill-tag preferred" key={s}>{s}</span>
                ))}
              </div>
            )}

            {cand.same_location && (
              <div className="location-bonus">📍 Located near the job (+bonus)</div>
            )}
          </div>

          <div className="rec-score-footer">
            Raw match score: <strong>{cand.match_score}</strong> points
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecommendedCandidates