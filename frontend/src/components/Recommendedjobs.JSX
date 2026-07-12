import { useState, useEffect } from 'react'
import api from '../api/axios'
import './RecommendedJobs.css'

// TEMPORARY: hardcoded as Ramesh (user_id=1) until login/auth is built.
// Once auth exists, this will come from the logged-in user's session instead.
const CURRENT_SEEKER_ID = 1

function RecommendedJobs() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`seeker-profiles/${CURRENT_SEEKER_ID}/recommended-jobs/`)
      .then((response) => {
        setRecommendations(response.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching recommendations:', err)
        setError('Could not load recommendations. Is the Django server running?')
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="status-message">Finding your best matches...</p>
  if (error) return <p className="status-message error">{error}</p>
  if (recommendations.length === 0) {
    return <p className="status-message">No matching jobs found yet. Add more skills to your profile!</p>
  }

  return (
    <div className="recommended-jobs">
      <h2>Recommended For You</h2>
      <p className="subtitle">Ranked by skill match, proficiency, and location</p>

      {recommendations.map((rec) => (
        <div className="rec-card" key={rec.job_id}>
          <div className="rec-card-header">
            <h3>{rec.job_title}</h3>
            <div className="match-badge">
              <span className="match-percent">{rec.match_percentage}%</span>
              <span className="match-label">match</span>
            </div>
          </div>

          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${Math.min(rec.match_percentage, 100)}%` }}
            />
          </div>

          <div className="rec-details">
            {rec.matched_required_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label matched">✓ Required skills you have:</span>
                {rec.matched_required_skills.map((s) => (
                  <span className="skill-tag matched" key={s}>{s}</span>
                ))}
              </div>
            )}

            {rec.missing_required_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label missing">✗ Required skills you're missing:</span>
                {rec.missing_required_skills.map((s) => (
                  <span className="skill-tag missing" key={s}>{s}</span>
                ))}
              </div>
            )}

            {rec.matched_preferred_skills.length > 0 && (
              <div className="skill-group">
                <span className="skill-group-label preferred">+ Preferred skills you have:</span>
                {rec.matched_preferred_skills.map((s) => (
                  <span className="skill-tag preferred" key={s}>{s}</span>
                ))}
              </div>
            )}

            {rec.same_location && (
              <div className="location-bonus">📍 Located near you (+bonus)</div>
            )}
          </div>

          <div className="rec-score-footer">
            Raw match score: <strong>{rec.match_score}</strong> points
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecommendedJobs