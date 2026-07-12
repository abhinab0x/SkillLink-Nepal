import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AuthForms.css'
import './Dashboard.css'

function MySkills({ currentUser }) {
  const [allSkills, setAllSkills] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [newSkillId, setNewSkillId] = useState('')
  const [newProficiency, setNewProficiency] = useState('beginner')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMySkills = () => {
    api.get('candidate-skills/')
      .then((res) => {
        const mine = res.data.filter((cs) => cs.user === currentUser.user_id)
        setMySkills(mine)
        setLoading(false)
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    api.get('skills/').then((res) => setAllSkills(res.data))
    loadMySkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    setMessage(null)
    if (!newSkillId) return

    api.post('candidate-skills/', {
      user: currentUser.user_id,
      skill: newSkillId,
      proficiency_level: newProficiency,
    })
      .then(() => {
        setMessage({ type: 'success', text: 'Skill added!' })
        setNewSkillId('')
        loadMySkills()
      })
      .catch((err) => {
        console.error(err)
        setMessage({ type: 'error', text: 'Could not add skill. You may already have it listed.' })
      })
  }

  const handleRemove = (candidateSkillId) => {
    api.delete(`candidate-skills/${candidateSkillId}/`)
      .then(() => loadMySkills())
      .catch((err) => console.error(err))
  }

  if (loading) return <p className="status-message">Loading your skills...</p>

  return (
    <div className="dashboard">
      <h2>My Skills</h2>
      <p className="subtitle">Keep this updated — it directly drives your job match scores</p>

      <form onSubmit={handleAdd} className="auth-form skill-add-form">
        <label>Add a skill</label>
        <div className="skill-row">
          <select value={newSkillId} onChange={(e) => setNewSkillId(e.target.value)}>
            <option value="">Select a skill</option>
            {allSkills.map((s) => (
              <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
            ))}
          </select>
          <select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <button type="submit">Add Skill</button>
      </form>

      {message && <p className={`auth-message ${message.type}`}>{message.text}</p>}

      <div className="my-skills-list">
        {mySkills.length === 0 ? (
          <p className="status-message">You haven't added any skills yet.</p>
        ) : (
          mySkills.map((cs) => (
            <div className="dashboard-card skill-card" key={cs.id}>
              <div>
                <strong>{cs.skill_detail.skill_name}</strong>
                <span className={`proficiency-tag proficiency-${cs.proficiency_level}`}>
                  {cs.proficiency_level}
                </span>
              </div>
              <button className="remove-row-btn" onClick={() => handleRemove(cs.id)}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MySkills