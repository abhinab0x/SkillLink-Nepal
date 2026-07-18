import { useState, useEffect } from 'react'
import api from '../api/axios'
import './Dashboard.css'

const STATUS_OPTIONS = ['applied', 'shortlisted', 'rejected', 'hired']

function JobApplicants({ currentUser }) {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load this employer's jobs first
  useEffect(() => {
    api.get('jobs/')
      .then((res) => {
        const myJobs = res.data.filter((j) => j.employer === currentUser.user_id)
        setJobs(myJobs)
        if (myJobs.length > 0) setSelectedJobId(myJobs[0].job_id)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Could not load your jobs.')
        setLoading(false)
      })
  }, [currentUser])

  // Load applicants whenever the selected job changes
  useEffect(() => {
    if (!selectedJobId) return
    api.get(`applications/?job=${selectedJobId}`)
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err))
  }, [selectedJobId])

  const handleStatusChange = (applicationId, newStatus) => {
    api.patch(`applications/${applicationId}/`, { status: newStatus })
      .then((res) => {
        setApplications((prev) =>
          prev.map((a) => (a.application_id === applicationId ? res.data : a))
        )
      })
      .catch((err) => console.error(err))
  }

  if (loading) return <p className="status-message">Loading...</p>
  if (error) return <p className="status-message error">{error}</p>
  if (jobs.length === 0) return <p className="status-message">You haven't posted any jobs yet.</p>

  return (
    <div className="dashboard">
      <h2>Applicants</h2>
      <p className="subtitle">Review and manage candidates who applied to your jobs</p>

      <select
        className="job-select"
        value={selectedJobId}
        onChange={(e) => setSelectedJobId(e.target.value)}
      >
        {jobs.map((j) => (
          <option key={j.job_id} value={j.job_id}>{j.title}</option>
        ))}
      </select>

      {applications.length === 0 ? (
        <p className="status-message">No applicants yet for this job.</p>
      ) : (
        applications.map((app) => (
          <div className="dashboard-card" key={app.application_id}>
            <div className="dashboard-card-header">
              <h3>{app.candidate_detail?.user_detail?.username}</h3>
              <select
                className={`status-select status-${app.status}`}
                value={app.status}
                onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <p className="company">
              {app.candidate_detail?.years_experience} yrs experience &middot;{' '}
              {app.candidate_detail?.user_detail?.location_detail?.district}
            </p>
            <p className="applied-date">
              Applied on {new Date(app.applied_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default JobApplicants