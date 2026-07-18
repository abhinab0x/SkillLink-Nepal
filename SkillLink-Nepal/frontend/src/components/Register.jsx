import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AuthForms.css'

function Register() {
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'seeker',
    location: '',
    contact: '', // ✅ Changed 'Contact' to 'contact' here
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' | 'error'

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  const uniqueProvinces = [...new Set(locations.map(loc => loc.province))]
  const uniqueDistricts = [...new Set(locations
    .filter(loc => loc.province === selectedProvince)
    .map(loc => loc.district))]
  const filteredLocalLevels = locations.filter(
    loc => loc.province === selectedProvince && loc.district === selectedDistrict
  )

  useEffect(() => {
    api.get('locations/').then((res) => setLocations(res.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    api.post('users/', {
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      location: form.location || null,
      contact: form.contact,
    })
      .then((res) => {
        const newUser = res.data
        // Create the matching profile depending on role
        const profileCall = form.role === 'seeker'
          ? api.post('seeker-profiles/', { user: newUser.user_id, bio: '', years_experience: 0 })
          : api.post('employer-profiles/', { user: newUser.user_id, company_name: form.username, company_description: '' })

        return profileCall.then(() => newUser) // ✅ Returns newUser so the next line can read it
      })
      .then((newUser) => { // ✅ Added 'newUser' inside the parentheses here
        setMessageType('success')
        setMessage(`Account created! Your User ID is ${newUser.user_id}. Use it to log in.`)
      })
      .catch((err) => {
        console.error(err)
        setMessageType('error')
        setMessage('Registration failed. Username or email may already be taken.')
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

        <label>Location</label>
        <select name="location" value={form.location} onChange={handleChange}>
          <option value="">Select a district</option>
          {locations.map((loc) => (
            <option key={loc.location_id} value={loc.location_id}>
              {loc.district}, {loc.province}
            </option>
          ))}
        </select>

         <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
          />

        <button type="submit">Register</button>
      </form>

      {message && (
        <p className={`auth-message ${messageType}`}>{message}</p>
      )}
    </div>
  )
}

export default Register