import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import './admin.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  useEffect(() => {
    // Dev helper: auto-login with test admin credentials if no token present
    // Removes 401s during local development. Will not run in production builds.
    if (process.env.NODE_ENV !== 'production') {
      const token = localStorage.getItem('access')
      if (!token) {
        fetch((import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'adminpass123' })
        }).then(r => r.json()).then(data => { if (data.access) localStorage.setItem('access', data.access) }).catch(()=>{})
      }
    }
  }, [])
  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/')
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Northstar Admin</div>
        <nav>
          <ul>
            <li><NavLink to="/admin">Dashboard</NavLink></li>
            <li><NavLink to="/admin/add">Add Product</NavLink></li>
            <li><NavLink to="/admin/products">Manage Products</NavLink></li>
            <li><NavLink to="#">Orders</NavLink></li>
            <li><NavLink to="#">Users</NavLink></li>
            <li><button className="logout-btn" onClick={logout}>Logout</button></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
        <ToastContainer position="top-right" />
      </main>
    </div>
  )
}
