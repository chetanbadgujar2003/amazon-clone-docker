import { useMemo, useState, useEffect } from 'react'
import axios from './api'
import './App.css'

const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Gaming', 'Sports']
const deals = [
  { title: 'Up to 40% off', subtitle: 'Premium tech essentials' },
  { title: 'Free delivery', subtitle: 'On orders over $100' },
  { title: 'New arrivals', subtitle: 'Fresh picks every week' },
]
const products = [
  { id: 100, name: 'Aurora Noise Cancelling Headphones', price: '$149', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { id: 101, name: 'Lumen Smart Lamp', price: '$89', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' },
  { id: 102, name: 'Northstar Travel Backpack', price: '$79', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { id: 103, name: 'Halo Smartwatch', price: '$199', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80' },
]

// curated pool for electronics fallback images (used when product lacks enough provided images)
const electronicsPool = [
  'https://images.unsplash.com/photo-1518444029098-3aa4a2f0b6f3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519183071298-a2962be54a00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600180758890-9b4b7f2b0a53?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1585386959984-a4155225a6b6?auto=format&fit=crop&w=1200&q=80',
]

const categoryProducts = {
  Electronics: [
    { id: 1, category: 'Electronics', name: 'Aurora Headphones', price: '$149', images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518444029098-3aa4a2f0b6f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155225a6b6?auto=format&fit=crop&w=1200&q=80',
    ] },
    { id: 2, category: 'Electronics', name: 'Halo Smartwatch', price: '$199', images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541534401786-0a8f6f8e1c1f?auto=format&fit=crop&w=1200&q=80',
    ] },
    { id: 3, category: 'Electronics', name: 'Pixel Pro Camera', price: '$549', images: [
      'https://images.unsplash.com/photo-1519183071298-a2962be54a00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    ] },
    { id: 4, category: 'Electronics', name: 'Neon Bluetooth Speaker', price: '$59', images: [
      'https://images.unsplash.com/photo-1518444029098-3aa4a2f0b6f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=1200&q=80',
    ] },
    { id: 5, category: 'Electronics', name: 'Lumen Smart Lamp', price: '$89', images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491933383416-6e61b1d9b7c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    ] },
    { id: 999, category: 'Electronics', name: 'Xiaomi Power Bank 4i 20000mAh 33W', price: '₹1,499', images: [
      'https://images.unsplash.com/photo-1600180758890-9b4b7f2b0a53?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585386959984-a4155225a6b6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518444029098-3aa4a2f0b6f3?auto=format&fit=crop&w=1200&q=80',
    ], externalUrl: 'https://www.amazon.in/Xiaomi-20000mAh-Charging-Delivery-Supports/dp/B0DCZ3WDTB/?_encoding=UTF8&pd_rd_w=avwYb&content-id=amzn1.sym.2d1ab0f0-8827-4bb3-885e-1f3ae355e022&pf_rd_p=2d1ab0f0-8827-4bb3-885e-1f3ae355e022&pf_rd_r=Q5JY6YZ378NG9XR1CF27&pd_rd_wg=R7pxl&pd_rd_r=469598c3-05f5-4a37-b80e-a3305032132c&ref_=pd_hp_d_btf_ls_gwc_pc_en2_&th=1' },
  ],
    Fashion: [
      { id: 11, category: 'Fashion', name: 'Aero Running Shoes', price: '$119', images: [
      'https://picsum.photos/seed/aero-running-1/800/600',
      'https://picsum.photos/seed/aero-running-2/800/600',
      'https://picsum.photos/seed/aero-running-3/800/600',
    ] },
      { id: 12, category: 'Fashion', name: 'Canvas Denim Jacket', price: '$89', images: ['https://images.unsplash.com/photo-1520975698510-1b9c2b2b1d3f?auto=format&fit=crop&w=1200&q=80'] },
      { id: 13, category: 'Fashion', name: 'Silk Scarf', price: '$39', images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80'] },
      { id: 14, category: 'Fashion', name: 'Leather Wallet', price: '$49', images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80'] },
      { id: 15, category: 'Fashion', name: 'Classic Sunglasses', price: '$69', images: ['https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80'] },
  ],
  Home: [
      { id: 21, category: 'Home', name: 'Nordic Throw Pillow', price: '$29', images: ['https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=1200&q=80'] },
      { id: 22, category: 'Home', name: 'Lumen Smart Lamp', price: '$89', images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'] },
      { id: 23, category: 'Home', name: 'Ceramic Vase', price: '$25', images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'] },
      { id: 24, category: 'Home', name: 'Bamboo Cutting Board', price: '$19', images: ['https://images.unsplash.com/photo-1511688878355-4f91f3b7a7f9?auto=format&fit=crop&w=1200&q=80'] },
      { id: 25, category: 'Home', name: 'Cozy Blanket', price: '$59', images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'] },
  ],
  Books: [
      { id: 31, category: 'Books', name: 'Minimalist Living', price: '$18', images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80'] },
      { id: 32, category: 'Books', name: 'Modern Cooking', price: '$24', images: ['https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=80'] },
      { id: 33, category: 'Books', name: 'Design Patterns', price: '$39', images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80'] },
      { id: 34, category: 'Books', name: 'Journey to the Moon', price: '$15', images: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80'] },
      { id: 35, category: 'Books', name: 'Poetry Collection', price: '$12', images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80'] },
  ],
  Beauty: [
      { id: 41, category: 'Beauty', name: 'Radiant Serum', price: '$29', images: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'] },
      { id: 42, category: 'Beauty', name: 'Luxe Moisturizer', price: '$39', images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80'] },
      { id: 43, category: 'Beauty', name: 'Velvet Lipstick', price: '$19', images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80'] },
      { id: 44, category: 'Beauty', name: 'Scented Candle', price: '$22', images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'] },
      { id: 45, category: 'Beauty', name: 'Silk Hair Wrap', price: '$17', images: ['https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=1200&q=80'] },
  ],
  Gaming: [
      { id: 51, category: 'Gaming', name: 'Arcade Controller', price: '$59', images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80'] },
      { id: 52, category: 'Gaming', name: 'Pro Gaming Mouse', price: '$79', images: ['https://images.unsplash.com/photo-1587202372775-0d7b3a0f19f4?auto=format&fit=crop&w=1200&q=80'] },
      { id: 53, category: 'Gaming', name: 'Ultra RGB Keyboard', price: '$129', images: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1b?auto=format&fit=crop&w=1200&q=80'] },
      { id: 54, category: 'Gaming', name: 'Gaming Headset', price: '$69', images: ['https://images.unsplash.com/photo-1562184556-3d0a6e8b2f2b?auto=format&fit=crop&w=1200&q=80'] },
      { id: 55, category: 'Gaming', name: 'Streaming Webcam', price: '$99', images: ['https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80'] },
  ],
  Sports: [
      { id: 61, category: 'Sports', name: 'Carbon Tennis Racket', price: '$149', images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'] },
      { id: 62, category: 'Sports', name: 'Trail Running Shoes', price: '$129', images: ['https://images.unsplash.com/photo-1520975689321-1d35b6d2a5b4?auto=format&fit=crop&w=1200&q=80'] },
      { id: 63, category: 'Sports', name: 'Yoga Mat Pro', price: '$39', images: ['https://images.unsplash.com/photo-1543862473-1f4557b8c8aa?auto=format&fit=crop&w=1200&q=80'] },
      { id: 64, category: 'Sports', name: 'Hydration Pack', price: '$59', images: ['https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80'] },
      { id: 65, category: 'Sports', name: 'Fitness Tracker', price: '$89', images: ['https://images.unsplash.com/photo-1519861537780-7b5a8b7cd0b1?auto=format&fit=crop&w=1200&q=80'] },
  ],
}
const brands = ['Apple', 'Samsung', 'Nike', 'Sony', 'Levis', 'Dell']

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [cardImageIndex, setCardImageIndex] = useState({})
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const cartCount = useMemo(() => cartItems.reduce((s, it) => s + (it.qty || 0), 0), [cartItems])
  // local seed combined removed in favor of `allProductsCombined`
  const [remoteProducts, setRemoteProducts] = useState([])

  useEffect(() => {
    let mounted = true
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/catalog/products/')
        const data = res.data.results || res.data
        if (mounted && data) setRemoteProducts(data)
      } catch (err) {
        // ignore, keep local seed data
        // console.error(err)
      }
    }
    fetchProducts()
    // refresh products when a new product is created via admin
    const onCreated = () => { fetchProducts() }
    window.addEventListener('product:created', onCreated)
    return () => { mounted = false }
  }, [])

  const allProductsCombined = useMemo(() => (remoteProducts && remoteProducts.length ? remoteProducts : ([...products, ...Object.values(categoryProducts).flat()])), [remoteProducts])
  const activeProduct = useMemo(() => allProductsCombined.find((product) => product.id === selectedProduct) || null, [selectedProduct, allProductsCombined])

  const displayedProducts = useMemo(() => {
    if (selectedCategory && categoryProducts[selectedCategory] && (!remoteProducts || remoteProducts.length === 0)) return categoryProducts[selectedCategory]
    // if remoteProducts available, filter them by category; otherwise show local combined
    let all = (remoteProducts && remoteProducts.length) ? remoteProducts : [...products, ...Object.values(categoryProducts).flat()]
    if (selectedCategory && remoteProducts && remoteProducts.length) {
      all = all.filter((p) => String(p.category || '').toLowerCase() === String(selectedCategory || '').toLowerCase())
    }
    const seen = new Set()
    return all.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }, [selectedCategory])

  const handleProductClick = (productId) => {
    setSelectedProduct(productId)
    setSelectedImageIndex(0)
  }

  const getImages = (product) => {
    // support shapes from backend serializer: main_image, additional_images
    const provided = product.additional_images && product.additional_images.length ? [...product.additional_images] : (product.images ? [...product.images] : (product.main_image ? [product.main_image] : (product.image ? [product.image] : [])))
    const imgs = []
    // preserve provided images first
    for (let i = 0; i < provided.length && imgs.length < 3; i += 1) imgs.push(provided[i])
    // fill remaining slots with deterministic fallbacks
    while (imgs.length < 3) {
      if (product.category === 'Electronics') {
        // use curated electronics pool to avoid random placeholders for electronics
        const pick = electronicsPool[(product.id + imgs.length) % electronicsPool.length]
        imgs.push(pick)
      } else {
        // use category-seeded picsum to get relevant-looking images per category/product
        const seed = `${product.category || 'general'}-${product.id}-${imgs.length}`
        imgs.push(`https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`)
      }
    }
    return imgs
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category))
    setSelectedProduct(null)
    setSelectedImageIndex(0)
  }

  const handleCardImageClick = (e, productId, imageIdx) => {
    e.stopPropagation()
    setCardImageIndex((prev) => ({ ...prev, [productId]: imageIdx }))
  }

  const handleAddToCart = (product) => {
    // default add 1, merge if already present
    setCartItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 }
        return copy
      }
      return [...prev, { product, qty: 1 }]
    })
    setCartMessage(`${product.name} added to cart`)
    window.setTimeout(() => setCartMessage(''), 1400)
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId))
  }

  const updateQty = (productId, qty) => {
    setCartItems((prev) => prev.map((it) => (it.product.id === productId ? { ...it, qty } : it)))
  }

  if (activeProduct) {
    const detailImages = getImages(activeProduct)
    return (
      <div className="amazon-shell detail-shell">
        <header className="topbar">
          <div className="brand-block">
            <div className="brand-mark">N</div>
            <div>
              <div className="brand-name">Northstar</div>
              <div className="brand-sub">Marketplace</div>
            </div>
          </div>
          <button type="button" className="back-btn" onClick={() => setSelectedProduct(null)}>← Back to home</button>
          <div className="cart-pill" onClick={() => setIsCartOpen((s) => !s)} style={{cursor: 'pointer'}}>🛒 Cart ({cartCount})</div>
        </header>

        {isCartOpen ? (
          <div className="cart-dropdown">
            <h4>Your cart ({cartCount})</h4>
            {cartItems.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <div className="cart-list">
                {cartItems.map((it) => (
                  <div key={it.product.id} className="cart-item">
                    <img src={(it.product.images && it.product.images[0]) || it.product.image || 'https://via.placeholder.com/80'} alt={it.product.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Img' }} />
                    <div className="cart-item-meta">
                      <div className="cart-item-name">{it.product.name}</div>
                      <div className="cart-item-price">{it.product.price}</div>
                      <div className="cart-item-qty">Qty: <select value={it.qty} onChange={(e) => updateQty(it.product.id, Number(e.target.value))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
                    </div>
                    <button type="button" className="remove-btn" onClick={() => removeFromCart(it.product.id)}>Remove</button>
                  </div>
                ))}
                <div className="cart-actions">
                  <button type="button" className="primary-btn" onClick={() => { setIsCartOpen(false); alert('Proceed to checkout (not implemented)') }}>Proceed to checkout</button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <main className="detail-content">
          <section className="detail-card amazon-detail-grid">
            <aside className="thumb-col">
              {detailImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${activeProduct.name} view ${idx + 1}`}
                  className={`thumb-vertical ${idx === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Img' }}
                />
              ))}
            </aside>

            <div className="main-media">
              <img src={detailImages[selectedImageIndex]} alt={activeProduct.name} className="detail-image large" onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+not+found' }} />
              <div className="mobile-thumbnail-strip">
                {detailImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${activeProduct.name} view ${idx + 1}`}
                    className={`thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Img' }}
                  />
                ))}
              </div>
            </div>

            <aside className="buybox">
              <h1 className="buybox-title">{activeProduct.name}</h1>
              <p className="buybox-sub">{activeProduct.brand || ''} • {activeProduct.badge || ''}</p>
              <p className="detail-rating">★ {activeProduct.rating || ''} • {activeProduct.reviews || ''} ratings</p>
              <div className="price-row">
                <div className="detail-price large-price">{activeProduct.price}</div>
                <div className="small-note">Inclusive of all taxes</div>
              </div>

              <div className="delivery-info">
                <div>FREE delivery</div>
                <div>Delivery: <strong>Tomorrow</strong></div>
              </div>

              <div className="buybox-controls">
                <label>Quantity</label>
                <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <button type="button" className="primary-btn" onClick={() => handleAddToCart(activeProduct)}>Add to Cart</button>
                <button type="button" className="secondary-btn" onClick={() => { handleAddToCart(activeProduct); setSelectedProduct(null) }}>Buy Now</button>
                {activeProduct.externalUrl ? (
                  <a href={activeProduct.externalUrl} target="_blank" rel="noopener noreferrer" className="amazon-btn">View on Amazon</a>
                ) : null}
              </div>

              <div className="seller-info">
                <div>Ships from: <strong>Northstar</strong></div>
                <div>Sold by: <strong>{activeProduct.seller || 'Northstar Retail'}</strong></div>
              </div>

              {cartMessage ? <p className="cart-message">{cartMessage}</p> : null}
            </aside>
          </section>
        </main>
      </div>
    )
  }
  

  return (
    <div className="amazon-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">N</div>
          <div>
            <div className="brand-name">Northstar</div>
            <div className="brand-sub">Marketplace</div>
          </div>
        </div>

        <div className="location-pill">Deliver to India • 560001</div>

        <div className="searchbar">
          <input type="text" placeholder="Search for products, brands and more" />
          <button type="button">Search</button>
        </div>

        <div className="top-actions">
          <div>
            <div className="tiny-label">Hello, sign in</div>
            <strong>Account & Lists</strong>
          </div>
          <div>
            <div className="tiny-label">Returns</div>
            <strong>& Orders</strong>
          </div>
          <div className="cart-pill" onClick={() => setIsCartOpen((s) => !s)} style={{cursor: 'pointer'}}>🛒 Cart ({cartCount})</div>
        </div>
      </header>

      {isCartOpen ? (
        <div className="cart-dropdown">
          <h4>Your cart ({cartCount})</h4>
          {cartItems.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((it) => (
                <div key={it.product.id} className="cart-item">
                  <img src={(it.product.images && it.product.images[0]) || it.product.image || 'https://via.placeholder.com/80'} alt={it.product.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Img' }} />
                  <div className="cart-item-meta">
                    <div className="cart-item-name">{it.product.name}</div>
                    <div className="cart-item-price">{it.product.price}</div>
                    <div className="cart-item-qty">Qty: <select value={it.qty} onChange={(e) => updateQty(it.product.id, Number(e.target.value))}>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
                  </div>
                  <button type="button" className="remove-btn" onClick={() => removeFromCart(it.product.id)}>Remove</button>
                </div>
              ))}
              <div className="cart-actions">
                <button type="button" className="primary-btn" onClick={() => { setIsCartOpen(false); alert('Proceed to checkout (not implemented)') }}>Proceed to checkout</button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <nav className="secondary-nav">
        {categories.map((item) => (
          <a key={item} href="#" onClick={(e) => { e.preventDefault(); handleCategoryClick(item) }} className={selectedCategory === item ? 'active' : ''}>{item}</a>
        ))}
      </nav>

      <main className="content">
        {cartMessage ? <p className="cart-message">{cartMessage}</p> : null}
        <section className="hero-section">
          <div className="hero-banner">
            <div className="hero-copy">
              <p className="eyebrow">Premium everyday essentials</p>
              <h1>Discover products that feel as smart as they look.</h1>
              <p>From premium audio to modern home gear, shop a curated marketplace designed for fast delivery and effortless experience.</p>
              <a className="primary-btn" href="#products">Shop now</a>
            </div>
          </div>

          <aside className="hero-side-card">
            <h3>Today&apos;s Deals</h3>
            {deals.map((deal) => (
              <div key={deal.title} className="deal-item">
                <strong>{deal.title}</strong>
                <span>{deal.subtitle}</span>
              </div>
            ))}
          </aside>
        </section>

        <section className="section-card" id="products">
          <div className="section-head">
            <h3>{selectedCategory ? `${selectedCategory} Products` : 'Featured products'}</h3>
            {selectedCategory ? (
              <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCategory(null) }}>Clear</a>
            ) : (
              <a href="#">See more</a>
            )}
          </div>
          <div className="product-grid">
            {displayedProducts.map((product) => {
              const imgs = getImages(product)
              const imgIdx = cardImageIndex[product.id] || 0
              const currentImg = imgs[imgIdx]
              return (
                <article key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
                  <div className="card-image-container">
                    <img src={currentImg} alt={product.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Image+not+found' }} />
                  </div>
                  <div className="card-thumbnail-strip">
                    {imgs.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        className={`card-thumbnail ${idx === imgIdx ? 'active' : ''}`}
                        onClick={(e) => handleCardImageClick(e, product.id, idx)}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Img' }}
                      />
                    ))}
                  </div>
                  <div className="product-badge">{product.badge}</div>
                  <h4>{product.name}</h4>
                  <div className="product-meta">
                    <strong>{product.price}</strong>
                    <span>Free delivery</span>
                    {product.externalUrl ? (
                      <a href={product.externalUrl} target="_blank" rel="noopener noreferrer" className="external-link">Buy on Amazon</a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section-card">
          <div className="section-head">
            <h3>Shop by category</h3>
            <a href="#">Browse all</a>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category} className={`category-pill ${selectedCategory === category ? 'active' : ''}`} onClick={() => handleCategoryClick(category)}>{category}</div>
            ))}
          </div>
        </section>

        <section className="section-card brand-strip">
          <div className="section-head">
            <h3>Popular brands</h3>
            <a href="#">View all</a>
          </div>
          <div className="brand-grid">
            {brands.map((brand) => (
              <div key={brand} className="brand-pill">{brand}</div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Northstar Marketplace • Fast delivery • Secure checkout • Premium support</p>
      </footer>
    </div>
  )
}

export default App
