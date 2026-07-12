import { useState, useEffect } from 'react'
import api from '../api/axios'
import './Dashboard.css'

const STATUS_STYLES = {
  applied: { label: 'Applied', className: 'status-applied' },
  shortlisted: { label: 'Shortlisted', className: 'status-shortlisted' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  hired: { label: 'Hired', className: 'status-hired' },
}

function MyApplications({ currentUser }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`applications/?user=${currentUser.user_id}`)
      .then((res) => {
        setApplications(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Could not load your applications.')
        setLoading(false)
      })
  }, [currentUser])

  if (loading) return <p className="status-message">Loading your applications...</p>
  if (error) return <p className="status-message error">{error}</p>
  if (applications.length === 0) {
    return <p className="status-message">You haven't applied to any jobs yet.</p>
  }

  return (
    <div className="dashboard">
      <h2>My Applications</h2>
      <p className="subtitle">Track the status of every job you've applied to</p>

      {applications.map((app) => {
        const statusInfo = STATUS_STYLES[app.status] || STATUS_STYLES.applied
        return (
          <div className="dashboard-card" key={app.application_id}>
            <div className="dashboard-card-header">
              <h3>{app.job_detail.title}</h3>
              <span className={`status-badge ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="company">
              {app.job_detail.employer_detail?.company_name} &middot;{' '}
              {app.job_detail.location_detail?.district}
            </p>
            <p className="applied-date">
              Applied on {new Date(app.applied_at).toLocaleDateString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default MyApplications