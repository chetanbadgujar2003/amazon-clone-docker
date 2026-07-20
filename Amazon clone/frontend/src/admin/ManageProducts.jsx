import React, { useEffect, useState } from 'react'
import axios from '../api'
import { toast } from 'react-toastify'

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access')
      const res = await axios.get('/api/catalog/admin/products/', { params: { page }, headers: { Authorization: token ? `Bearer ${token}` : '' } })
      const data = res.data.results || res.data
      setProducts(data)
      setCount(res.data.count || data.length)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load products')
    } finally { setLoading(false) }
  }

  useEffect(()=>{fetchProducts()}, [])
  useEffect(()=>{fetchProducts()}, [page])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete product?')) return
    try {
      const token = localStorage.getItem('access')
      await axios.delete(`/api/catalog/admin/products/${id}/`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      toast.success('Deleted')
      fetchProducts()
    } catch (err) { toast.error('Delete failed') }
  }

  return (
    <div>
      <h2>Manage Products</h2>
      <div style={{marginBottom:12}}>
        <input placeholder="Search by name" value={query} onChange={(e)=>setQuery(e.target.value)} />
        <button onClick={()=>{setPage(1); fetchProducts()}}>Refresh</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).map(p=> (
              <tr key={p.id}>
                <td>
                  <img src={(p.main_image && (p.main_image.startsWith('http') ? p.main_image : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + p.main_image)) || '/assets/placeholder.png'} style={{width:80}} alt="img" />
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td>{p.status}</td>
                <td>
                  <button onClick={()=>alert('View not implemented')}>View</button>
                  <button onClick={()=>window.location.href = `/admin/products/${p.id}/edit`}>Edit</button>
                  <button onClick={()=>handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        <div style={{marginTop:12}}>
          <button onClick={()=>{ if(page>1) setPage(p=>p-1) }}>Prev</button>
          <span style={{margin:'0 8px'}}>Page {page} — {count} items</span>
          <button onClick={()=>{ setPage(p=>p+1) }}>Next</button>
        </div>
    </div>
  )
}
