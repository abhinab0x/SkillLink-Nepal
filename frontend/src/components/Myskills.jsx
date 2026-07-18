import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AuthForms.css'
import './Dashboard.css'

const NEW_SKILL_OPTION = '__new__'

function MySkills({ currentUser }) {
  const [allSkills, setAllSkills] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [newSkillId, setNewSkillId] = useState('')
  const [customSkillName, setCustomSkillName] = useState('')
  const [newProficiency, setNewProficiency] = useState('beginner')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadAllSkills = () => {
    return api.get('skills/').then((res) => setAllSkills(res.data))
  }

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
    loadAllSkills()
    loadMySkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    setMessage(null)

    if (!newSkillId) return

    const isCustom = newSkillId === NEW_SKILL_OPTION
    const trimmedName = customSkillName.trim()

    if (isCustom && !trimmedName) {
      setMessage({ type: 'error', text: 'Please enter a name for the new skill.' })
      return
    }

    setSubmitting(true)

    // If it's a custom skill, check if it already exists (case-insensitive)
    // before creating a duplicate row in the Skill table.
    const getSkillId = isCustom
      ? (() => {
          const existing = allSkills.find(
            (s) => s.skill_name.toLowerCase() === trimmedName.toLowerCase()
          )
          if (existing) return Promise.resolve(existing.skill_id)

          return api.post('skills/', { skill_name: trimmedName })
            .then((res) => {
              setAllSkills((prev) => [...prev, res.data])
              return res.data.skill_id
            })
        })()
      : Promise.resolve(newSkillId)

    getSkillId
      .then((skillId) =>
        api.post('candidate-skills/', {
          user: currentUser.user_id,
          skill: skillId,
          proficiency_level: newProficiency,
        })
      )
      .then(() => {
        setMessage({ type: 'success', text: 'Skill added!' })
        setNewSkillId('')
        setCustomSkillName('')
        loadMySkills()
      })
      .catch((err) => {
        console.error(err)
        setMessage({ type: 'error', text: 'Could not add skill. You may already have it listed.' })
      })
      .finally(() => setSubmitting(false))
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
          <select
            value={newSkillId}
            onChange={(e) => {
              setNewSkillId(e.target.value)
              if (e.target.value !== NEW_SKILL_OPTION) setCustomSkillName('')
            }}
          >
            <option value="">Select a skill</option>
            {allSkills.map((s) => (
              <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>
            ))}
            <option value={NEW_SKILL_OPTION}>+ Add a new skill…</option>
          </select>
          <select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {newSkillId === NEW_SKILL_OPTION && (
          <input
            type="text"
            className="custom-skill-input"
            placeholder="Enter skill name (e.g. Photography)"
            value={customSkillName}
            onChange={(e) => setCustomSkillName(e.target.value)}
            autoFocus
          />
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Skill'}
        </button>
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