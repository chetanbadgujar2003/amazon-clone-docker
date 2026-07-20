import React, { useState } from 'react'
import axios from '../api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function AdminLogin(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res = await axios.post('/api/auth/login/', { username, password })
      const access = res.data.access
      localStorage.setItem('access', access)
      toast.success('Logged in')
      navigate('/admin')
    }catch(err){
      toast.error(err.response?.data?.detail || 'Login failed')
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h2>Admin Login</h2>
      <form onSubmit={submit} className="admin-form">
        <label>Username</label>
        <input value={username} onChange={(e)=>setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="form-actions">
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
