import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

import {
  banner1,
  home,
  electronics,
  fashion,
  books,
  product1,
  product2,
  product3,
  product4,
  product5,
  product6,
} from "../assets";

import "./Home.css";

const Home = () => {
  const products = [
    {
      id: 1,
      image: product1,
      title: "Men's T-Shirt",
      price: 999,
      rating: 5,
    },
    {
      id: 2,
      image: product2,
      title: "Men's Suit",
      price: 899,
      rating: 4,
    },
    {
      id: 3,
      image: product3,
      title: "Children's Toy",
      price: 349,
      rating: 5,
    },
    {
      id: 4,
      image: product4,
      title: "Toy Car",
      price: 1299,
      rating: 5,
    },
    {
      id: 5,
      image: product5,
      title: "Smart Phone",
      price: 199,
      rating: 4,
    },
    {
      id: 6,
      image: product6,
      title: "Phone",
      price: 59,
      rating: 4,
    },
  ];

  return (
    <>
      <Header />
      <Navbar />

      <div className="home">

        <section className="heroBanner">
          <div className="heroBanner__content">
            <span>Deal of the Day</span>
            <h1>Shop the Latest Collections</h1>
            <p>
              Discover top products with great offers across fashion, electronics, home essentials and more.
            </p>
            <div className="heroBanners__actions">
              <button>Shop Now</button>
              <button className="secondary">Explore Categories</button>
            </div>
          </div>
          <div className="heroBanner__image">
            <img src={banner1} alt="Hero Banner" />
          </div>
        </section>

        <section className="categories">
          <div className="sectionHeader">
            <div>
              <h2>Shop by Category</h2>
              <p>Browse curated categories and find the perfect product.</p>
            </div>
          </div>

          <div className="categoryGrid">
            <div className="categoryCard">
              <img src={home} alt="Home" />
              <h3>Home</h3>
              <p>Essentials and decor</p>
            </div>
            <div className="categoryCard">
              <img src={electronics} alt="Electronics" />
              <h3>Electronics</h3>
              <p>Latest gadgets and devices</p>
            </div>
            <div className="categoryCard">
              <img src={fashion} alt="Fashion" />
              <h3>Fashion</h3>
              <p>Trending looks for all</p>
            </div>
            <div className="categoryCard">
              <img src={books} alt="Books" />
              <h3>Books</h3>
              <p>Best sellers and novels</p>
            </div>
          </div>
        </section>

        <section className="products">
          <div className="sectionHeader">
            <div>
              <h2>Popular Products</h2>
              <p>Handpicked items that customers love.</p>
            </div>
          </div>

          <div className="productGrid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default Home;