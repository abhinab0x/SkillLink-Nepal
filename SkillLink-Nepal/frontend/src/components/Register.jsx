import { useState, useEffect } from 'react'
import api from '../api/axios'
import nepalGeoData from '@nepalutils/nepal-geodata' // Professional npm package mapping out all of Nepal
import './AuthForms.css'

function Register() {
  const [locations, setLocations] = useState([])
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

  // --- FULL DYNAMIC CASCADING SELECTION ENGINE ---
  const [nepalData, setNepalData] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  useEffect(() => {
    // Keep your original backend metadata calls operational
    api.get('locations/').then((res) => setLocations(res.data)).catch(err => console.error(err))

    // Pull the absolute layout containing 100% of Nepal's cities and villages out of the npm utility package
    try {
      const fullDataset = nepalGeoData('english') // Reads out the total structural data list in English
      setNepalData(fullDataset)
    } catch (error) {
      console.error("Failed to parse package geometry:", error)
    }
  }, [])

  // Dynamic grouping logic pulling straight from the full NPM dataset
  const uniqueProvinces = nepalData.map((p) => p.province)
  
  const currentProvinceObj = nepalData.find((p) => p.province === selectedProvince)
  const uniqueDistricts = currentProvinceObj ? currentProvinceObj.districts.map((d) => d.district) : []
  
  const currentDistrictObj = currentProvinceObj ? currentProvinceObj.districts.find((d) => d.district === selectedDistrict) : null
  const filteredLocalLevels = currentDistrictObj ? currentDistrictObj.municipalities : []

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage(null)

    // Build the string: "Biratnagar Metropolitan City, Morang, Koshi Province"
    const fullLocationString = form.location 
      ? `${form.location}, ${selectedDistrict}, ${selectedProvince}` 
      : null

    api.post('users/', {
      username: form.username,
      email: form.email,
      password: form.password,
      role: form.role,
      location: fullLocationString, // Saves the structured text to your DB column
      contact: form.contact,
    })
      .then((res) => {
        const newUser = res.data
        const profileCall = form.role === 'seeker'
          ? api.post('seeker-profiles/', { user: newUser.user_id, bio: '', years_experience: 0 })
          : api.post('employer-profiles/', { user: newUser.user_id, company_name: form.username, company_description: '' })

        return profileCall.then(() => newUser) 
      })
      .then((newUser) => {
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

        {/* --- COMPLETELY DYNAMIC ALL-NEPAL DROPDOWNS --- */}
        <label>Province</label>
        <select 
          value={selectedProvince} 
          onChange={(e) => { 
            setSelectedProvince(e.target.value); 
            setSelectedDistrict(''); 
            setForm(prev => ({ ...prev, location: '' })); 
          }}
          required
        >
          <option value="">Select Province</option>
          {uniqueProvinces.map((prov) => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>

        <label>District</label>
        <select 
          value={selectedDistrict} 
          onChange={(e) => { 
            setSelectedDistrict(e.target.value); 
            setForm(prev => ({ ...prev, location: '' })); 
          }} 
          disabled={!selectedProvince}
          required
        >
          <option value="">Select District</option>
          {uniqueDistricts.map((dist) => (
            <option key={dist} value={dist}>{dist}</option>
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
            <option key={mun} value={mun}>{mun}</option>
          ))}
        </select>
        {/* ----------------------------------------------- */}

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