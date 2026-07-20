import React, { useEffect, useState } from 'react'
import axios from '../api'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function EditProduct(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({name:'', description:'', price:'', original_price:'', category:'Electronics', brand:'', stock:0, status:'active', featured:false})
  const [previewMain, setPreviewMain] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [additional, setAdditional] = useState([])
  const [previewAdditional, setPreviewAdditional] = useState([])

  useEffect(()=>{
    const fetchProduct = async () =>{
      try{
        const res = await axios.get(`/api/catalog/products/${id}/`)
        const p = res.data
        setForm({
          name: p.name || '', description: p.description || '', price: p.price || '', original_price: p.original_price || '', category: p.category || 'Electronics', brand: p.brand || '', stock: p.stock || 0, status: p.status || 'active', featured: p.featured || false
        })
        if(p.main_image) setPreviewMain(p.main_image)
        if(p.additional_images) setPreviewAdditional(p.additional_images)
      }catch(err){ toast.error('Failed to fetch') }
    }
    fetchProduct()
  }, [id])

  const handleFile = (file, isMain=false) => {
    if(!file) return
    const allowed = ['image/jpeg','image/png','image/webp']
    if(!allowed.includes(file.type)){ toast.error('Invalid image type'); return }
    if(file.size > 5 * 1024 * 1024){ toast.error('Image too large'); return }
    if(isMain){ setMainImage(file); setPreviewMain(URL.createObjectURL(file)) }
    else{ setAdditional((s)=>[...s,file]); setPreviewAdditional((s)=>[...s, URL.createObjectURL(file)]) }
  }

  const onSubmit = async (e) =>{
    e.preventDefault()
    setLoading(true)
    try{
      const fd = new FormData()
      Object.keys(form).forEach(k=>fd.append(k, form[k]))
      if(mainImage) fd.append('main_image', mainImage)
      additional.forEach(f=>fd.append('additional_images', f))
      await axios.put(`/api/catalog/admin/products/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Updated')
      navigate('/admin/products')
    }catch(err){ console.error(err); toast.error('Update failed') }
    finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Edit Product</h2>
      <form className="admin-form" onSubmit={onSubmit}>
        <label>Name</label>
        <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <label>Description</label>
        <textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
        <label>Price</label>
        <input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} />
        <label>Main Image</label>
        <input type="file" accept="image/*" onChange={(e)=>handleFile(e.target.files[0], true)} />
        {previewMain ? <img src={previewMain} alt="main" style={{maxWidth:200}} /> : null}
        <label>Additional Images</label>
        <input type="file" accept="image/*" multiple onChange={(e)=>{Array.from(e.target.files).forEach(f=>handleFile(f,false))}} />
        <div className="previews">{previewAdditional.map((p,i)=>(<img key={i} src={p} style={{maxWidth:120, marginRight:8}} alt={`a${i}`} />))}</div>
        <div className="form-actions"><button type="submit" className="primary-btn" disabled={loading}>{loading? 'Saving...':'Save'}</button></div>
      </form>
    </div>
  )
}
