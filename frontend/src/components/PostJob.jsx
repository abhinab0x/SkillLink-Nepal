import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AuthForms.css'
import './PostJob.css'

function PostJob({ currentUser }) {
  const [locations, setLocations] = useState([])
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', location: '', salary_min: '', salary_max: '',contact_email: '', contact_phone: ''
  })
  // skillRows: [{ skill_id, importance }]
  const [skillRows, setSkillRows] = useState([{ skill_id: '', importance: 'required' }])
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    api.get('locations/').then((res) => setLocations(res.data))
    api.get('skills/').then((res) => setSkills(res.data))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSkillRowChange = (index, field, value) => {
    const updated = [...skillRows]
    updated[index][field] = value
    setSkillRows(updated)
  }

  const addSkillRow = () => setSkillRows([...skillRows, { skill_id: '', importance: 'required' }])
  const removeSkillRow = (index) => setSkillRows(skillRows.filter((_, i) => i !== index))

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    api.post('jobs/', {
      employer: currentUser.user_id,
      location: form.location || null,
      title: form.title,
      description: form.description,
      salary_min: form.salary_min || null,
      salary_max: form.salary_max || null,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      is_active: true,
    })
      .then((res) => {
        const newJob = res.data
        const validRows = skillRows.filter((r) => r.skill_id)
        const skillCalls = validRows.map((r) =>
          api.post('job-required-skills/', {
            job: newJob.job_id,
            skill: r.skill_id,
            importance: r.importance,
          })
        )
        return Promise.all(skillCalls)
      })
      .then(() => {
        setMessageType('success')
        setMessage('Job posted successfully!')
        setForm({ title: '', description: '', location: '', salary_min: '', salary_max: '', contact_email: '', contact_phone: '' })
        setSkillRows([{ skill_id: '', importance: 'required' }])
      })
      .catch((err) => {
        console.error(err)
        setMessageType('error')
        setMessage('Could not post job. Please check the fields and try again.')
      })
  }

  return (
    <div className="auth-form-wrapper post-job-wrapper">
      <h2>Post a New Job</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Job Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />

        <label>Location</label>
        <select name="location" value={form.location} onChange={handleChange}>
          <option value="">Select a district</option>
          {locations.map((loc) => (
            <option key={loc.location_id} value={loc.location_id}>
              {loc.district}, {loc.province}
            </option>
          ))}
        </select>

        <label>Salary Range (NPR)</label>
        <div className="salary-row">
          <input type="number" name="salary_min" placeholder="Min" value={form.salary_min} onChange={handleChange} />
          <input type="number" name="salary_max" placeholder="Max" value={form.salary_max} onChange={handleChange} />
        </div>

        <label>Contact Email</label>
        <input
          type="email"
          name="contact_email"
          value={form.contact_email}
          onChange={handleChange}
          placeholder="example@gmail.com"
        />

        <label>Contact Phone</label>
        <input
          type="tel"
          name="contact_phone"
          value={form.contact_phone}
          onChange={handleChange}
          placeholder="98XXXXXXXX"
        />

        <label>Required / Preferred Skills</label>
        {skillRows.map((row, index) => (
          <div className="skill-row" key={index}>
            <select
              value={row.skill_id}
              onChange={(e) => handleSkillRowChange(index, 'skill_id', e.target.value)}
            >
              <option value="">Select a skill</option>
              {skills.map((s) => (
                <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
              ))}
            </select>
            <select
              value={row.importance}
              onChange={(e) => handleSkillRowChange(index, 'importance', e.target.value)}
            >
              <option value="required">Required</option>
              <option value="preferred">Preferred</option>
            </select>
            {skillRows.length > 1 && (
              <button type="button" className="remove-row-btn" onClick={() => removeSkillRow(index)}>✕</button>
            )}
          </div>
        ))}
        <button type="button" className="add-row-btn" onClick={addSkillRow}>+ Add another skill</button>

        <button type="submit">Post Job</button>
      </form>

      {message && <p className={`auth-message ${messageType}`}>{message}</p>}
    </div>
  )
}

export default PostJob