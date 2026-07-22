import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";
import {
  getSellerSession,
  clearSellerSession,
  getMySellerProfile,
  getProductsBySeller,
  addSellerProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addCategory,
} from "../mock/marketplace";
import { getSellerQueries, replySellerQuery } from "../api/support";

const STATUS_COPY = {
  pending: {
    title: "Your account is pending review",
    body:
      "An admin is checking your business details. You can add products now — they'll go live on the storefront automatically as soon as you're verified.",
  },
  verified: {
    title: "You're a verified seller",
    body: "Your products are live and visible to every Meridian customer.",
  },
  rejected: {
    title: "Your application was not approved",
    body:
      "Your products won't appear to customers. Contact support if you'd like to update your details and re-apply.",
  },
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ price: "", stock: "", description: "" });
  const [activeTab, setActiveTab] = useState("products");
  const [queries, setQueries] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    image: "",
  });

  const refresh = async (sellerId) => {
    const [prods, cats] = await Promise.all([getProductsBySeller(sellerId), getCategories()]);
    setProducts(prods);
    setCategories(cats);
  };

  useEffect(() => {
    const session = getSellerSession();
    if (!session) {
      navigate("/seller/login");
      return;
    }
    (async () => {
      // pull the freshest copy in case an admin changed the status
      let fresh = session;
      try {
        fresh = await getMySellerProfile();
      } catch (e) {
        // fall back to the cached session if the token/profile call fails
      }
      setSeller(fresh);
      const cats = await getCategories();
      setCategories(cats);
      setForm((f) => ({ ...f, category: cats[0] || "" }));
      const prods = await getProductsBySeller(fresh.id);
      setProducts(prods);
      try {
        setQueries(await getSellerQueries());
      } catch (e) {
        // non-fatal — queries tab will just show empty
      }
    })();
  }, [navigate]);

  const handleLogout = () => {
    clearSellerSession();
    navigate("/seller/login");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const updated = await addCategory(newCategory.trim());
    setCategories(updated);
    setForm((f) => ({ ...f, category: newCategory.trim() }));
    setNewCategory("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.price || !form.category) {
      setError("Title, price, and category are required.");
      return;
    }

    try {
      await addSellerProduct(seller.id, form);
      await refresh(seller.id);
      setForm({
        title: "",
        price: "",
        stock: "",
        category: categories[0] || "",
        description: "",
        image: "",
      });
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data || err.message || "Could not add product.";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this product from your storefront?")) return;
    await deleteProduct(id);
    await refresh(seller.id);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValues({ price: p.price, stock: p.stock, description: p.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    await updateProduct(id, {
      price: Number(editValues.price),
      stock: Number(editValues.stock),
      description: editValues.description,
    });
    setEditingId(null);
    await refresh(seller.id);
  };

  const handleReplyToQuery = async (id) => {
    const message = (replyDrafts[id] || "").trim();
    if (!message) return;
    await replySellerQuery(id, message);
    setReplyDrafts({ ...replyDrafts, [id]: "" });
    setQueries(await getSellerQueries());
  };

  if (!seller) return null;

  const statusCopy = STATUS_COPY[seller.status] || STATUS_COPY.pending;

  return (
    <div className="sellerDash">
      <div className="sellerDash__header">
        <div className="container">
          <div>
            <h1>{seller.businessName}</h1>
            <p>{seller.email} · {seller.categoryFocus}</p>
          </div>
          <button className="sellerDash__logout" onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <div className="container">
        <div className={`sellerDash__banner ${seller.status}`}>
          <div>
            <strong>{statusCopy.title}</strong>
            <span>{statusCopy.body}</span>
          </div>
          <span className={`stamp-badge ${seller.status === "verified" ? "" : seller.status}`}>
            {seller.status}
          </span>
        </div>

        <div className="adminTabs">
          <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
            Products
          </button>
          <button className={activeTab === "queries" ? "active" : ""} onClick={() => setActiveTab("queries")}>
            Customer Queries ({queries.length})
          </button>
        </div>

        {activeTab === "products" && (
        <div className="sellerDash__grid">
          <div className="sellerDash__panel">
            <h3>Add a product</h3>
            <form className="sellerProductForm" onSubmit={handleSubmit}>
              <label>Product name</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <label>Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />

              <label>Stock quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="newCategoryRow">
                <input
                  placeholder="Or create a new category (e.g. Toys)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="button" onClick={handleAddCategory}>Add</button>
              </div>

              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              <label>Product image</label>
              <input type="file" accept="image/*" onChange={handleImage} />
              {form.image && <img className="preview" src={form.image} alt="preview" />}

              {error && <div className="sellerForm__error">{error}</div>}

              <button type="submit">Add product</button>
            </form>
          </div>

          <div className="sellerDash__panel">
            <h3>My products ({products.length})</h3>
            {products.length === 0 ? (
              <div className="sellerDash__empty">
                You haven't added any products yet. Use the form to list your first one.
              </div>
            ) : (
              <div className="sellerProducts__list">
                {products.map((p) => (
                  <div className="sellerProductCard" key={p.id}>
                    {p.image ? (
                      <img src={p.image} alt={p.title} />
                    ) : (
                      <div style={{ height: 140, background: "var(--paper)" }} />
                    )}
                    <div className="sellerProductCard__body">
                      <h4>{p.title}</h4>

                      {editingId === p.id ? (
                        <>
                          <label style={{ fontSize: 12 }}>Price ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValues.price}
                            onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                            style={{ width: "100%", marginBottom: 6, padding: 6, border: "1px solid var(--line)", borderRadius: 4 }}
                          />
                          <label style={{ fontSize: 12 }}>Stock</label>
                          <input
                            type="number"
                            min="0"
                            value={editValues.stock}
                            onChange={(e) => setEditValues({ ...editValues, stock: e.target.value })}
                            style={{ width: "100%", marginBottom: 6, padding: 6, border: "1px solid var(--line)", borderRadius: 4 }}
                          />
                          <label style={{ fontSize: 12 }}>Description</label>
                          <textarea
                            value={editValues.description}
                            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                            style={{ width: "100%", marginBottom: 8, padding: 6, border: "1px solid var(--line)", borderRadius: 4, minHeight: 50 }}
                          />
                          <div className="sellerProductCard__actions">
                            <button onClick={() => saveEdit(p.id)}>Save</button>
                            <button onClick={cancelEdit}>Cancel</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="sellerProductCard__meta">
                            <span>${p.price}</span>
                            <span>{p.category}</span>
                          </div>
                          <div className="sellerProductCard__actions">
                            <button onClick={() => startEdit(p)}>Edit</button>
                            <button className="danger" onClick={() => handleDelete(p.id)}>Remove</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === "queries" && (
          <div className="sellerDash__panel" style={{ marginBottom: 60 }}>
            <h3>Customer queries about your products</h3>
            {queries.length === 0 ? (
              <div className="sellerDash__empty">No customer queries yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {queries.map((q) => (
                  <div key={q.id} className="sellerReview__card">
                    <div className="sellerReview__top">
                      <div>
                        <h3>{q.subject}</h3>
                        <div className="sellerReview__meta">
                          {q.customerName} · {q.customerEmail}
                          {q.orderId && ` · Order: ${q.orderId}`}
                          {q.productName && ` · Product: ${q.productName}`}
                        </div>
                      </div>
                      <span className={`stamp-badge ${q.status === "resolved" ? "" : q.status === "escalated" ? "rejected" : "pending"}`}>
                        {q.status}
                      </span>
                    </div>

                    <div className="sellerReview__desc">{q.message}</div>

                    {q.replies.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.replies.map((r, i) => (
                          <div key={i} className="sellerReview__desc" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                            <strong style={{ textTransform: "capitalize" }}>{r.authorRole}</strong> ({r.authorName}): {r.message}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input
                        placeholder="Write a reply to this customer..."
                        value={replyDrafts[q.id] || ""}
                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [q.id]: e.target.value })}
                        style={{ flex: 1, minWidth: 200, padding: 8, border: "1px solid var(--line)", borderRadius: 4 }}
                      />
                      <button onClick={() => handleReplyToQuery(q.id)}>Reply</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
