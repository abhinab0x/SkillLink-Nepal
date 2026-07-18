import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AuthForms.css'

import nepalDataContainer from '@nepalutils/nepal-geodata/nepal_data/provinces_with_districts_and_municipalities.json'

// Helper: whatever a "leaf" value is (array of municipalities OR an object keyed by municipality name),
// return it as a plain array of names.
function toNameList(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.keys(value)
  return []
}

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'seeker',
    location: '',
    contact: '',
  })
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('')

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  // Top-level keys ARE the province names
  const uniqueProvinces = Object.keys(nepalDataContainer)

  // Districts for the selected province = keys of that province's object
  const uniqueDistricts = selectedProvince
    ? Object.keys(nepalDataContainer[selectedProvince] || {})
    : []

  // Municipalities for the selected district
  const filteredLocalLevels =
    selectedProvince && selectedDistrict
      ? toNameList(nepalDataContainer[selectedProvince]?.[selectedDistrict])
      : []

  useEffect(() => {
    console.log('Provinces:', uniqueProvinces)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    const fullLocationString = `${form.location}, ${selectedDistrict}, ${selectedProvince}`

    api
      .post('users/', {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        location: fullLocationString,
        contact: form.contact,
      })
      .then((res) => {
        const newUser = res.data
        const profileCall =
          form.role === 'seeker'
            ? api.post('seeker-profiles/', { user: newUser.user_id, bio: '', years_experience: 0 })
            : api.post('employer-profiles/', {
                user: newUser.user_id,
                company_name: form.username,
                company_description: '',
              })

        return profileCall.then(() => newUser)
      })
      .then((newUser) => {
        setMessageType('success')
        setMessage(`Account created! User ID: ${newUser.user_id}.`)
      })
      .catch((err) => {
        console.error(err)
        setMessageType('error')
        setMessage('Registration failed.')
      })
  }

  return (
    <div className="auth-form-wrapper">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />
        <label>I am a...</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="seeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>

        <label>Province</label>
        <select
          value={selectedProvince}
          onChange={(e) => {
            setSelectedProvince(e.target.value)
            setSelectedDistrict('')
            setForm((prev) => ({ ...prev, location: '' }))
          }}
          required
        >
          <option value="">Select Province</option>
          {uniqueProvinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>

        <label>District</label>
        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value)
            setForm((prev) => ({ ...prev, location: '' }))
          }}
          disabled={!selectedProvince}
          required
        >
          <option value="">Select District</option>
          {uniqueDistricts.map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>

        <label>Local Level / Municipality</label>
        <select
          name="location"
          value={form.location}
          onChange={handleChange}
          disabled={!selectedDistrict}
          required
        >
          <option value="">Select Local Level</option>
          {filteredLocalLevels.map((mun) => (
            <option key={mun} value={mun}>
              {mun}
            </option>
          ))}
        </select>

        <label>Contact</label>
        <input type="text" name="contact" value={form.contact} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {message && <p className={`auth-message ${messageType}`}>{message}</p>}
    </div>
  )
}

export default Register