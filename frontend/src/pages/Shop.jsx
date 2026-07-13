import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

import {
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
} from "../assets";

import "./Shop.css";

const allProducts = [
  {
    id: 1,
    image: product1,
    title: "Apple iPhone 15 Pro",
    price: 999,
    rating: 5,
    category: "Mobiles",
  },
  {
    id: 2,
    image: product2,
    title: "Samsung Galaxy S24 Ultra",
    price: 899,
    rating: 4,
    category: "Mobiles",
  },
  {
    id: 3,
    image: product3,
    title: "Sony WH-1000XM5 Headphones",
    price: 349,
    rating: 5,
    category: "Electronics",
  },
  {
    id: 4,
    image: product4,
    title: "MacBook Air M3",
    price: 1299,
    rating: 5,
    category: "Electronics",
  },
  {
    id: 5,
    image: product5,
    title: "Smart Watch",
    price: 199,
    rating: 4,
    category: "Electronics",
  },
  {
    id: 6,
    image: product6,
    title: "Gaming Mouse",
    price: 59,
    rating: 4,
    category: "Accessories",
  },
];

const Shop = () => {
  const [search, setSearch] = useState("");
  // Read category from URL query param if present
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("category") || "All";
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    // update category when URL changes
    const p = new URLSearchParams(location.search).get("category") || "All";
    setCategory(p);
  }, [location.search]);

  // Load any admin-added products from localStorage and merge
  let storedProducts = [];
  try {
    const stored = localStorage.getItem("products");
    storedProducts = stored ? JSON.parse(stored) : [];
  } catch (e) {
    storedProducts = [];
  }

  const merged = [...storedProducts, ...allProducts];

  const filteredProducts = merged.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <Navbar />

      <div className="shop">

        <div className="shop__header">
          <h1>Shop</h1>

          <div className="shop__filters">

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All</option>
              <option>Mobiles</option>
              <option>Electronics</option>
              <option>Accessories</option>
            </select>

          </div>
        </div>

        <div className="shop__products">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <h2>No products found.</h2>
          )}

        </div>

      </div>

      <Footer />
    </>
  );
};

export default Shop;