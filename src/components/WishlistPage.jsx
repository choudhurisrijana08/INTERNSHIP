import React from "react";
import Navbar from "./Navbar";

export default function WishlistPage({ pageClass, wishlist, renderProductCard, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('wishlist')}>
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
      <div className="wishlist-page">
        <div className="breadcrumb"><span onClick={() => showPage('home')}>Home</span><span className="sep">›</span><span>Wishlist</span></div>
        <h1 style={{ marginBottom: '2rem' }}>My Wishlist 🤍</h1>
        <div className="products-grid" id="wishlist-products">
          {wishlist.length ? wishlist.map(renderProductCard) : null}
        </div>
        {!wishlist.length ? (
          <div id="wishlist-empty" className="empty-state">
            <div className="empty-icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favourite items to buy later</p>
            <button className="btn btn-primary" onClick={() => showPage('catalog')}>Start Shopping</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
