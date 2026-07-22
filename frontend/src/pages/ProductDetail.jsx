import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
} from "../assets";

import "./ProductDetail.css";
import { useCart } from "../context/CartContext";
import { getProductById } from "../mock/marketplace";

// Static demo catalog — kept as a fallback for the original 6 placeholder
// products (ids "1".."6") that ship with the site and aren't in the backend.
const demoProducts = [
  { id: "1", title: "Men's T-Shirt", image: product1, price: 999, rating: 5,
    description: "The iPhone 15 Pro features an A17 Pro chip, titanium design, advanced cameras, and a stunning Super Retina XDR display." },
  { id: "2", title: "Men's Suit", image: product2, price: 899, rating: 4,
    description: "The Samsung Galaxy S24 Ultra offers AI-powered features, a powerful Snapdragon processor, and an incredible camera system." },
  { id: "3", title: "Children's Toy", image: product3, price: 349, rating: 5,
    description: "Industry-leading noise cancellation with premium sound quality and all-day comfort." },
  { id: "4", title: "Toy Car", image: product4, price: 1299, rating: 5,
    description: "Ultra-fast M3 chip, lightweight design, all-day battery life, and a beautiful Liquid Retina display." },
  { id: "5", title: "Smart Phone", image: product5, price: 199, rating: 4,
    description: "Track your health, fitness, heart rate, and notifications all from your wrist." },
  { id: "6", title: "Phone", image: product6, price: 59, rating: 4,
    description: "High-precision gaming mouse with RGB lighting and programmable buttons." },
];

function findLegacyAdminProduct(id) {
  try {
    const stored = localStorage.getItem("products");
    const list = stored ? JSON.parse(stored) : [];
    const found = list.find((p) => String(p.id) === String(id));
    if (!found) return null;
    // legacy admin-added shape already close to what this page expects
    return {
      id: found.id,
      title: found.title,
      image: found.image,
      price: found.price,
      rating: found.rating || 4,
      description: found.description || "",
    };
  } catch (e) {
    return null;
  }
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setProduct(null);

    (async () => {
      // 1. Try the real backend first (verified-seller / admin-added products)
      try {
        const p = await getProductById(id);
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
          return;
        }
      } catch (e) {
        // not found on the backend — fall through to local sources
      }

      // 2. Legacy admin quick-add products (localStorage)
      const legacy = findLegacyAdminProduct(id);
      if (legacy) {
        if (!cancelled) { setProduct(legacy); setLoading(false); }
        return;
      }

      // 3. Static demo catalog
      const demo = demoProducts.find((item) => item.id === id);
      if (!cancelled) { setProduct(demo || null); setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="productNotFound"><h2>Loading…</h2></div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="productNotFound">
          <h2>Product Not Found</h2>
          <p>It may have been removed, or its seller is no longer verified.</p>
        </div>
        <Footer />
      </>
    );
  }

  const stars = Math.max(0, Math.min(5, Math.round(product.rating || 0)));

  return (
    <>
      <Header />
      <Navbar />

      <div className="productDetail">

        <div className="productDetail__image">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="productDetail__info">

          <h1>{product.title}</h1>

          {product.sellerName && (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sold by {product.sellerName}</p>
          )}

          <div className="rating">
            {[...Array(stars)].map((_, index) => (
              <FaStar key={index} />
            ))}
          </div>

          <h2>₹{product.price}</h2>

          <p>{product.description}</p>

          <div className="quantity">
            <label>Quantity</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <button
            className="cartBtn"
            onClick={() => addToCart({ ...product, quantity })}
          >
            Add to Cart
          </button>

          <button
            className="buyBtn"
            onClick={() => {
              addToCart({ ...product, quantity });
              navigate("/checkout");
            }}
          >
            Buy Now
          </button>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
