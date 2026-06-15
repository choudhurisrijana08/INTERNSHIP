import React from "react";
import Navbar from "./Navbar";

export default function CartPage({ pageClass, cart, subtotal, total, couponCode, setCouponCode, applyCoupon, updateQty, removeFromCart, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('cart')}>
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
      <div className="cart-page">
        <div className="breadcrumb"><span onClick={() => showPage('home')}>Home</span><span className="sep">›</span><span>Cart</span></div>
        <h1>Shopping Cart 🛒</h1>
        <div className="cart-layout">
          <div id="cart-items-container">
            {cart.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <button className="btn btn-primary" onClick={() => showPage('catalog')}>Shop Now</button>
              </div>
            ) : cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">{item.emoji}</div>
                <div>
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="cart-item-price">₹{(item.price * item.qty).toLocaleString()}</div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️ Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span id="cart-subtotal">₹{subtotal.toLocaleString()}</span></div>
            <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--green)' }}>FREE</span></div>
            <div className="summary-row"><span>Discount</span><span id="cart-discount" style={{ color: 'var(--red)' }}>-₹{total < subtotal ? (subtotal - total).toLocaleString() : 0}</span></div>
            <div className="coupon-input">
              <input type="text" placeholder="Coupon code" id="coupon-code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={applyCoupon}>Apply</button>
            </div>
            <div className="summary-row total"><span>Total</span><strong id="cart-total">₹{total.toLocaleString()}</strong></div>
            <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={() => showPage('checkout')}>Proceed to Checkout →</button>
            <button className="btn btn-dark btn-full btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => showPage('catalog')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}


