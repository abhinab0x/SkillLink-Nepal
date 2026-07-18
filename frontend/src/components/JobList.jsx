import { useState, useEffect } from 'react'
import api from '../api/axios'
import './JobList.css'

function JobList({ currentUser }) {
  const [jobs, setJobs] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [applyMessage, setApplyMessage] = useState('')
  const [applyMessageType, setApplyMessageType] = useState('success')

  const [searchText, setSearchText] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

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

    api.get('locations/').then((res) => setLocations(res.data))
  }, [])

  const handleApply = (jobId) => {
    setApplyMessage('')

    if (!currentUser) {
      setApplyMessageType('error')
      setApplyMessage('Please log in as a job seeker to apply.')
      return
    }

    if (currentUser.role !== 'seeker') {
      setApplyMessageType('error')
      setApplyMessage('Only job seekers can apply to jobs.')
      return
    }

    api.post('applications/', {
      user: currentUser.user_id,
      job: jobId,
      status: 'applied',
    })
      .then(() => {
        setAppliedJobIds((prev) => [...prev, jobId])
        setApplyMessageType('success')
        setApplyMessage('Application submitted successfully!')
      })
      .catch((err) => {
        console.error('Error applying:', err)

        // DRF sends a raw technical message when the UNIQUE(user, job)
        // constraint blocks a duplicate application - translate it into
        // something a real user should see instead of the DB-level wording.
        const rawErrors = err.response?.data?.non_field_errors
        const isDuplicate = rawErrors?.some((msg) =>
          msg.toLowerCase().includes('unique')
        )

        setApplyMessageType('error')
        setApplyMessage(
          isDuplicate
            ? "You've already applied to this job."
            : 'Could not submit application. Please try again.'
        )

        // Still reflect it as applied in the UI, since a duplicate error
        // means an application already exists for this job.
        if (isDuplicate) {
          setAppliedJobIds((prev) => [...prev, jobId])
        }
      })
  }

  // Client-side filtering - fine for a mini-project's data volume.
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchText.trim() === '' ||
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.required_skills.some((rs) =>
        rs.skill_detail.skill_name.toLowerCase().includes(searchText.toLowerCase())
      )
    const matchesLocation = locationFilter === '' ||
      String(job.location) === String(locationFilter)
    return matchesSearch && matchesLocation
  })

  if (loading) return <p className="status-message">Loading jobs...</p>
  if (error) return <p className="status-message error">{error}</p>

  return (
    <div className="job-list">
      <h2>Available Jobs</h2>

      <div className="filter-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by job title or skill..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="location-filter"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc.location_id} value={loc.location_id}>
              {loc.district}, {loc.province}
            </option>
          ))}
        </select>
      </div>

      {applyMessage && (
        <p className={`apply-message ${applyMessageType === 'error' ? 'error' : ''}`}>
          {applyMessage}
        </p>
      )}

      {filteredJobs.length === 0 ? (
        <p className="status-message">No jobs match your search.</p>
      ) : (
        filteredJobs.map((job) => (
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
            {currentUser?.role !== 'employer' && (
              <button
                className="apply-button"
                disabled={appliedJobIds.includes(job.job_id)}
                onClick={() => handleApply(job.job_id)}
              >
                {appliedJobIds.includes(job.job_id) ? 'Applied ✓' : 'Apply Now'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default JobList