import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../services/authService";

import "./Admin.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const a = localStorage.getItem("adminUser");
    if (!a) {
      navigate("/admin/login");
      return;
    }
    setAdmin(JSON.parse(a));

    const stored = localStorage.getItem("products");
    const all = stored ? JSON.parse(stored) : [];
    // show only products owned by this admin
    const mine = all.filter((p) => p.owner === JSON.parse(a).username);
    setProducts(mine);
  }, [navigate]);

  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;

    // remove from overall storage and from view
    const stored = localStorage.getItem("products");
    const all = stored ? JSON.parse(stored) : [];
    const remaining = all.filter((p) => p.id !== id);
    localStorage.setItem("products", JSON.stringify(remaining));

    const filtered = products.filter((p) => p.id !== id);
    setProducts(filtered);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/admin/login");
  };

  return (
    <>
      <Header />
      <Navbar />

      <div className="adminPage">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1>Admin Panel</h1>
          <div>
            <strong>{admin?.username}</strong>
            <button style={{marginLeft:12}} onClick={() => navigate('/admin')}>Add Product</button>
            <button style={{marginLeft:12}} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div style={{marginTop:16}}>
          {products.length === 0 ? (
            <div>No products yet. <Link to="/admin">Add one</Link></div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12}}>
              {products.map((p) => (
                <div key={p.id} style={{background:'#fff', padding:12, borderRadius:8}}>
                  <img src={p.image} alt={p.title} style={{width:'100%', height:140, objectFit:'cover', borderRadius:6}} />
                  <h3 style={{marginTop:8}}>{p.title}</h3>
                  <div>Price: ₹{p.price}</div>
                  <div>Category: {p.category}</div>
                  <div>Owner: {p.owner || 'unknown'}</div>
                  {p.owner === admin?.username && (
                    <div style={{marginTop:8}}>
                      <button onClick={() => navigate(`/admin/edit/${p.id}`)}>Edit</button>
                      <button style={{marginLeft:8}} onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminPanel;
