import React from "react";
import "./ProductCard.css";
import { FaStar } from "react-icons/fa";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div className="productCard">
      <img
        src={product.image}
        alt={product.title}
        className="productCard__image"
      />

      <div className="productCard__info">
        <h3 className="productCard__title">{product.title}</h3>

        <p className="productCard__price">
          <small>₹</small>
          <strong>{product.price}</strong>
        </p>

        <div className="productCard__rating">
          {[...Array(product.rating)].map((_, index) => (
            <FaStar key={index} className="star" />
          ))}
        </div>

        <button className="productCard__button" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;