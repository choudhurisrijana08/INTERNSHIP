import React from "react";
import Navbar from "./Navbar";

export default function SuccessPage({ pageClass, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('success')}>
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
      <div className="empty-state" style={{ padding: '8rem 2rem' }}>
        <div className="empty-icon">🎉</div>
        <h3 style={{ color: 'var(--green)', fontSize: '2rem' }}>Order Placed Successfully!</h3>
        <p style={{ fontSize: '1rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          Your order #LUXE-2025-7841 has been confirmed. You'll receive a confirmation email shortly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => showPage('dashboard')}>Track Order</button>
          <button className="btn btn-dark" onClick={() => showPage('catalog')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
