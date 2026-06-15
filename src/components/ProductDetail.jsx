import React from "react";
import Navbar from "./Navbar";

export default function ProductDetail({ pageClass, detailProduct, detailTab, setDetailTab, detailSizesHidden, addToCartFromDetail, addToWishlistFromDetail, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('product')}>
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
      <div className="product-detail">
        <div className="breadcrumb">
          <span onClick={() => showPage('home')}>Home</span><span className="sep">›</span>
          <span onClick={() => showPage('catalog')}>Shop</span><span className="sep">›</span>
          <span id="detail-breadcrumb">{detailProduct.name}</span>
        </div>
        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-img" id="detail-main-img">
              {Array.isArray(detailProduct.images) && detailProduct.images.length ? (
                <img src={detailProduct.images[0]} alt={detailProduct.name} />
              ) : (
                detailProduct.emoji || '🛍️'
              )}
            </div>
            <div className="product-thumbnails">
              {(Array.isArray(detailProduct.images) && detailProduct.images.length ? detailProduct.images : [null, null, null]).slice(0, 3).map((imageUrl, index) => (
                <div key={index} className="thumbnail">
                  {imageUrl ? <img src={imageUrl} alt={`${detailProduct.name} ${index + 1}`} /> : (detailProduct.emoji || '🛍️')}
                </div>
              ))}
            </div>
          </div>
          <div className="product-detail-info">
            <div className="product-detail-brand" id="detail-brand">{detailProduct.brand || 'Brand'}</div>
            <h1 id="detail-name">{detailProduct.name}</h1>
            <div className="product-stars" style={{ margin: '0.75rem 0' }}>
              <span className="stars" id="detail-stars">{'⭐'.repeat(Math.floor(detailProduct.rating || 0))}</span>
              <span className="review-count" id="detail-reviews">({detailProduct.reviews || 0} reviews)</span>
            </div>
            <div className="product-detail-price" id="detail-price">
              ₹{Number(detailProduct.price || 0).toLocaleString()} {detailProduct.oldPrice ? <span style={{ fontSize: '1rem', color: 'var(--gray2)', textDecoration: 'line-through', fontWeight: 400 }}>₹{Number(detailProduct.oldPrice).toLocaleString()}</span> : null}
            </div>
            <div className="product-detail-desc" id="detail-desc">{detailProduct.description || detailProduct.desc || 'No description available.'}</div>

            <div id="detail-sizes-section" style={{ marginBottom: '1.5rem', display: detailSizesHidden ? 'none' : 'block' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '0.5rem' }}>Select Size</div>
              <div className="size-grid">
                {['XS','S','M','L','XL'].map(size => (
                  <button key={size} className="size-btn">{size}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '0.75rem' }}>Color</div>
              <div className="color-grid">
                {['#1A1A1A', '#C9A84C', '#8B2635', '#2E4057', '#F5F3EF'].map((color, index) => (
                  <div key={color} className={`color-swatch${index === 0 ? ' active' : ''}`} style={{ background: color, border: color === '#F5F3EF' ? '1px solid #DDD' : 'none' }} />
                ))}
              </div>
            </div>

            <div className="product-actions">
              <button className="btn btn-primary" style={{ flex: 1 }} id="detail-add-cart" onClick={addToCartFromDetail}>Add to Cart 🛒</button>
              <button className="btn btn-dark" id="detail-wishlist" onClick={addToWishlistFromDetail}>♡ Wishlist</button>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #EEE' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gray)' }}>✅ In Stock</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gray)' }}>🚚 Free Delivery</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gray)' }}>↩️ Easy Returns</div>
              </div>
            </div>

            <div className="tabs" style={{ marginTop: '2rem' }}>
              {[
                { id: 'tab-desc', label: 'Description' },
                { id: 'tab-reviews', label: 'Reviews' },
                { id: 'tab-shipping', label: 'Shipping' },
              ].map(tab => (
                <button key={tab.id} className={`tab-btn${detailTab === tab.id ? ' active' : ''}`} onClick={() => setDetailTab(tab.id)}>{tab.label}</button>
              ))}
            </div>
            <div className={`tab-content${detailTab === 'tab-desc' ? ' active' : ''}`} id="tab-desc" style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--gray2)' }}>
              Premium quality product with exceptional craftsmanship. Each item is carefully inspected before shipping. Made from sustainable materials, this product combines style with functionality.
            </div>
            <div className={`tab-content${detailTab === 'tab-reviews' ? ' active' : ''}`} id="tab-reviews">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>Priya S.</strong><span style={{ color: 'var(--gold)' }}>⭐⭐⭐⭐⭐</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray2)' }}>&quot;Absolutely love this! Quality exceeded my expectations. Will definitely buy again.&quot;</p>
                </div>
                <div style={{ background: 'var(--light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>Rahul M.</strong><span style={{ color: 'var(--gold)' }}>⭐⭐⭐⭐</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--gray2)' }}>&quot;Great product, fast delivery. Packaging was excellent too.&quot;</p>
                </div>
              </div>
            </div>
            <div className={`tab-content${detailTab === 'tab-shipping' ? ' active' : ''}`} id="tab-shipping" style={{ fontSize: '0.9rem', lineHeight: '1.8', color: 'var(--gray2)' }}>
              <strong>Standard Delivery:</strong> 3-5 business days — FREE on orders over ₹999<br />
              <strong>Express Delivery:</strong> 1-2 business days — ₹149<br />
              <strong>Returns:</strong> Free returns within 30 days of delivery.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
