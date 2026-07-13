import React, { useState } from "react";
import { useParams } from "react-router-dom";
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

const products = [
  {
    id: "1",
    title: "Men's T-Shirt",
    image: product1,
    price: 999,
    rating: 5,
    description:
      "The iPhone 15 Pro features an A17 Pro chip, titanium design, advanced cameras, and a stunning Super Retina XDR display.",
  },
  {
    id: "2",
    title: "Men's Suit",
    image: product2,
    price: 899,
    rating: 4,
    description:
      "The Samsung Galaxy S24 Ultra offers AI-powered features, a powerful Snapdragon processor, and an incredible camera system.",
  },
  {
    id: "3",
    title: "Children's Toy",
    image: product3,
    price: 349,
    rating: 5,
    description:
      "Industry-leading noise cancellation with premium sound quality and all-day comfort.",
  },
  {
    id: "4",
    title: "Toy Car",
    image: product4,
    price: 1299,
    rating: 5,
    description:
      "Ultra-fast M3 chip, lightweight design, all-day battery life, and a beautiful Liquid Retina display.",
  },
  {
    id: "5",
    title: "Smart Phone",
    image: product5,
    price: 199,
    rating: 4,
    description:
      "Track your health, fitness, heart rate, and notifications all from your wrist.",
  },
  {
    id: "6",
    title: "Phone",
    image: product6,
    price: 59,
    rating: 4,
    description:
      "High-precision gaming mouse with RGB lighting and programmable buttons.",
  },
];

const ProductDetail = () => {
  const { id } = useParams();

  const product = products.find((item) => item.id === id);

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <>
        <Header />
        <Navbar />

        <div className="productNotFound">
          <h2>Product Not Found</h2>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Navbar />

      <div className="productDetail">

        <div className="productDetail__image">
          <img
            src={product.image}
            alt={product.title}
          />
        </div>

        <div className="productDetail__info">

          <h1>{product.title}</h1>

          <div className="rating">
            {[...Array(product.rating)].map((_, index) => (
              <FaStar key={index} />
            ))}
          </div>

          <h2>₹{product.price}</h2>

          <p>{product.description}</p>

          <div className="quantity">

            <label>Quantity</label>

            <select
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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

          <button className="buyBtn">
            Buy Now
          </button>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;