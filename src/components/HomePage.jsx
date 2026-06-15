import React from "react";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";

export default function HomePage({ pageClass, showPage, mobileOpen, setMobileOpen, wishlist, wishlistCount, cartQuantity, isLoggedIn, isAdmin, products, filterAndShowCatalog, addToCart, toggleWishlist, showProduct }) {
  return (
    <div className={pageClass('home')}>
      <Navbar
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onToggleMobile={() => setMobileOpen(prev => !prev)}
      />
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} id="mobile-menu">
        <a onClick={() => { showPage('home'); setMobileOpen(false); }}>Home</a>
        <a onClick={() => { showPage('catalog'); setMobileOpen(false); }}>Products</a>
        <a onClick={() => { showPage('catalog'); setMobileOpen(false); }}>Categories</a>
        <a onClick={() => { showPage('cart'); setMobileOpen(false); }}>Cart</a>
        <a onClick={() => { showPage('wishlist'); setMobileOpen(false); }}>Wishlist</a>
        <a onClick={() => { showPage(isLoggedIn ? 'dashboard' : 'login'); setMobileOpen(false); }}>Dashboard</a>
        {!isLoggedIn && <a onClick={() => { showPage('login'); setMobileOpen(false); }}>Sign In</a>}
      </div>

      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag">✦ New Collection 2025</div>
          <h1>Elevate Your <span>Personal</span> Style</h1>
          <p>Discover curated luxury fashion, beauty, and lifestyle products. Every piece tells a story of craftsmanship and elegance.</p>
          <div className="hero-btns">
            <button className="btn btn-primary" onClick={() => showPage('catalog')}>Explore Collection</button>
            <button className="btn btn-outline" onClick={() => showPage('catalog')}>View Lookbook</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">12K+</div><div className="stat-label">Products</div></div>
            <div className="stat"><div className="stat-num">850+</div><div className="stat-label">Brands</div></div>
            <div className="stat"><div className="stat-num">4.9★</div><div className="stat-label">Rating</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-grid">
            <div><div style={{ height: '100%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>👗</div></div>
            <div><div style={{ height: '100%', background: '#2D2011', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>👠</div></div>
            <div><div style={{ height: '100%', background: '#2D2011', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>👜</div></div>
            <div><div style={{ height: '100%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>⌚</div></div>
          </div>
        </div>
      </div>

      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">✦ Browse By</div>
            <h2 className="section-title">Shop <span>Categories</span></h2>
          </div>
          <div className="categories-grid">
            {[
              { label: "Women's Fashion", icon: '👗', cat: 'Women', count: '2,480 items' },
              { label: "Men's Fashion", icon: '👔', cat: 'Men', count: '1,920 items' },
              { label: 'Electronics', icon: '📱', cat: 'Electronics', count: '3,150 items' },
              { label: 'Beauty', icon: '💄', cat: 'Beauty', count: '1,640 items' },
              { label: 'Home & Living', icon: '🏠', cat: 'Home', count: '2,100 items' },
              { label: 'Sports', icon: '⚽', cat: 'Sports', count: '980 items' },
              { label: 'Books', icon: '📚', cat: 'Books', count: '5,200 items' },
              { label: 'Jewelry', icon: '💍', cat: 'Jewelry', count: '760 items' },
            ].map(cat => (
              <div key={cat.cat} className="category-card" onClick={() => filterAndShowCatalog(cat.cat)}>
                <div className="cat-icon">{cat.icon}</div>
                <div className="cat-name">{cat.label}</div>
                <div className="cat-count">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">✦ Handpicked</div>
            <h2 className="section-title">Featured <span>Products</span></h2>
          </div>
          <div className="products-grid" id="home-featured">
            {products.slice(0, 6).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onShow={showProduct}
                onAddCart={addToCart}
                onToggleWishlist={toggleWishlist}
                inWishlist={wishlist.some(item => item.id === product.id)}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn btn-dark" onClick={() => showPage('catalog')}>View All Products →</button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over ₹999. Express delivery in 2-3 business days worldwide.' },
              { icon: '🔒', title: 'Secure Payments', desc: '256-bit SSL encryption. Your payment info is always protected.' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns. No questions asked, full refund.' },
              { icon: '🎖️', title: 'Authentic Products', desc: '100% genuine products verified by our expert team.' },
            ].map(feature => (
              <div key={feature.title} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-title">{feature.title}</div>
                <div className="feature-desc">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="newsletter">
        <div className="newsletter-inner">
          <div className="section-tag">✦ Stay Connected</div>
          <h3 className="section-title">Get Exclusive <span style={{ color: 'var(--gold)' }}>Offers</span></h3>
          <p>Subscribe to get 15% off your first order and early access to new collections.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button onClick={() => showPage('catalog')}>Subscribe</button>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">LUXE</div>
            <p>Your destination for premium fashion, beauty, and lifestyle. Curated with passion, delivered with care.</p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a onClick={() => showPage('catalog')}>New Arrivals</a></li>
              <li><a onClick={() => showPage('catalog')}>Best Sellers</a></li>
              <li><a onClick={() => showPage('catalog')}>Sale</a></li>
              <li><a onClick={() => showPage('catalog')}>Collections</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a>Track Order</a></li>
              <li><a>Returns & Refunds</a></li>
              <li><a>Size Guide</a></li>
              <li><a>Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a>About LUXE</a></li>
              <li><a>Careers</a></li>
              <li><a>Privacy Policy</a></li>
              <li><a>Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 LUXE. All rights reserved.</span>
          <span>Made with ♥ for fashion lovers</span>
        </div>
      </footer>
    </div>
  );
}
