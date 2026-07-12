import { useState, useEffect } from 'react'
import api from '../api/axios'
import './JobList.css'

// TEMPORARY: hardcoded as Ramesh (user_id=1) until login/auth is built.
const CURRENT_SEEKER_ID = 1

function JobList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Tracks which job_ids the user has just applied to, for instant UI feedback
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [applyMessage, setApplyMessage] = useState('')

  useEffect(() => {
    api.get('jobs/')
      .then((response) => {
        setJobs(response.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err)
        setError('Could not load jobs. Is the Django server running?')
        setLoading(false)
      })
  }, [])

  const handleApply = (jobId) => {
    setApplyMessage('')
    api.post('applications/', {
      user: CURRENT_SEEKER_ID,
      job: jobId,
      status: 'applied',
    })
      .then(() => {
        setAppliedJobIds((prev) => [...prev, jobId])
        setApplyMessage('Application submitted successfully!')
      })
      .catch((err) => {
        console.error('Error applying:', err)
        const detail = err.response?.data?.non_field_errors?.[0]
          || 'Could not submit application. You may have already applied.'
        setApplyMessage(detail)
      })
  }

  if (loading) return <p className="status-message">Loading jobs...</p>
  if (error) return <p className="status-message error">{error}</p>
  if (jobs.length === 0) return <p className="status-message">No jobs posted yet.</p>

  return (
    <div className="job-list">
      <h2>Available Jobs</h2>
      {applyMessage && <p className="apply-message">{applyMessage}</p>}
      {jobs.map((job) => (
        <div className="job-card" key={job.job_id}>
          <div className="job-card-header">
            <h3>{job.title}</h3>
            <span className="salary">
              NPR {job.salary_min} - {job.salary_max}
            </span>
          </div>
          <p className="company">
            {job.employer_detail?.company_name} &middot;{' '}
            {job.location_detail?.district}, {job.location_detail?.province}
          </p>
          <p className="description">{job.description}</p>
          <div className="skills-required">
            {job.required_skills.map((rs) => (
              <span
                key={rs.id}
                className={`skill-tag ${rs.importance === 'required' ? 'required' : 'preferred'}`}
              >
                {rs.skill_detail.skill_name}
                {rs.importance === 'required' ? ' *' : ''}
              </span>
            ))}
          </div>
          <button
            className="apply-button"
            disabled={appliedJobIds.includes(job.job_id)}
            onClick={() => handleApply(job.job_id)}
          >
            {appliedJobIds.includes(job.job_id) ? 'Applied ✓' : 'Apply Now'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default JobList