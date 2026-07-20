import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import AddProduct from './admin/AddProduct'
import ManageProducts from './admin/ManageProducts'
import EditProduct from './admin/EditProduct'
import AdminLogin from './admin/AdminLogin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
