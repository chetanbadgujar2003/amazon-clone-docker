import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const categories = ['Electronics','Fashion','Home & Kitchen','Books','Grocery','Beauty','Sports','Toys']

export default function AddProduct() {
  const [form, setForm] = useState({name: '', description: '', price: '', original_price: '', category: categories[0], brand: '', stock: 0, status: 'active', featured: false})
  const [mainImage, setMainImage] = useState(null)
  const [additional, setAdditional] = useState([])
  const [previewMain, setPreviewMain] = useState(null)
  const [previewAdditional, setPreviewAdditional] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [placeholderAvailable, setPlaceholderAvailable] = useState(false)
  const [placeholderUrl, setPlaceholderUrl] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const resp = await fetch('/placeholder.png')
        const ct = resp.headers.get('content-type') || ''
        if (resp.ok && ct.startsWith('image/') && mounted) {
          setPlaceholderAvailable(true)
          setPlaceholderUrl('/placeholder.png')
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleFile = (file, isMain=false) => {
    if (!file) return
    const allowed = ['image/jpeg','image/png','image/webp']
    if (!allowed.includes(file.type)) { toast.error('Invalid image type'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image too large'); return }
    if (isMain) {
      setMainImage(file)
      setPreviewMain(URL.createObjectURL(file))
    } else {
      setAdditional((s) => [...s, file])
      setPreviewAdditional((s) => [...s, URL.createObjectURL(file)])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault();
    const files = [...e.dataTransfer.files]
    files.forEach(f => handleFile(f, false))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.description || !form.price) {
      toast.error('Please fill required fields')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      if (form.original_price) fd.append('original_price', form.original_price)
      fd.append('category', form.category)
      fd.append('brand', form.brand)
      fd.append('stock', form.stock)
      fd.append('status', form.status)
      fd.append('featured', form.featured)
      // if no main image selected, try to use a placeholder image from public/placeholder.png
      if (mainImage) {
        fd.append('main_image', mainImage)
      } else {
        try {
          const resp = await fetch('/placeholder.png')
          const ct = resp.headers.get('content-type') || ''
          if (resp.ok && ct.startsWith('image/')) {
            const blob = await resp.blob()
            const file = new File([blob], 'placeholder.png', { type: blob.type })
            fd.append('main_image', file)
          }
        } catch (e) {
          // ignore — will submit without main_image
        }
      }
      additional.forEach((f) => fd.append('additional_images', f))

      const token = localStorage.getItem('access')
      const res = await axios.post('/api/catalog/admin/products/', fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: token ? `Bearer ${token}` : '' } })
      toast.success('Product created')
      setForm({name: '', description: '', price: '', original_price: '', category: categories[0], brand: '', stock: 0, status: 'active', featured: false})
      setMainImage(null); setAdditional([]); setPreviewMain(null); setPreviewAdditional([])
      // navigate to homepage and notify listeners to refresh product list
      try { window.dispatchEvent(new CustomEvent('product:created')) } catch (e) {}
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create product')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2>Add Product</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Product Name*</label>
        <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <label>Description*</label>
        <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
        <label>Price*</label>
        <input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} />
        <label>Original Price</label>
        <input value={form.original_price} onChange={(e)=>setForm({...form,original_price:e.target.value})} />
        <label>Category</label>
        <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.map(c=> <option key={c} value={c}>{c}</option>)}</select>
        <label>Brand</label>
        <input value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})} />
        <label>Stock Quantity</label>
        <input type="number" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})} />

        <label>Main Image*</label>
        <input type="file" accept="image/*" onChange={(e)=>handleFile(e.target.files[0], true)} />
        {previewMain ? (
          <img src={previewMain} alt="main" style={{maxWidth:200, display:'block'}} />
        ) : (placeholderAvailable ? (
          <div style={{marginTop:8}}>
            <div style={{fontSize:12, color:'#666'}}>No main image selected — placeholder will be used</div>
            <img src={placeholderUrl} alt="placeholder" style={{maxWidth:200, display:'block', opacity:0.9, marginTop:6}} />
          </div>
        ) : null)}

        <label>Additional Images (drag & drop supported)</label>
        <div className="dropzone" onDrop={handleDrop} onDragOver={(e)=>e.preventDefault()}>
          <input type="file" accept="image/*" multiple onChange={(e)=>{Array.from(e.target.files).forEach(f=>handleFile(f,false))}} />
          <div>Drop images here or click to select</div>
        </div>
        <div className="previews">
          {previewAdditional.map((p,idx)=>(<img key={idx} src={p} alt={`add-${idx}`} style={{maxWidth:120, marginRight:8}} />))}
        </div>

        <label>Status</label>
        <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select>

        <label><input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form,featured:e.target.checked})} /> Featured</label>

        <div className="form-actions">
          <button type="button" onClick={()=>{setForm({name:'',description:'',price:'',original_price:'',category:categories[0],brand:'',stock:0,status:'active',featured:false}); setMainImage(null); setAdditional([]); setPreviewMain(null); setPreviewAdditional([])}}>Reset</button>
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
        </div>
      </form>
    </div>
  )
}
