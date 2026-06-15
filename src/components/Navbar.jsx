import React from "react";

export default function Navbar({ showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, onToggleMobile }) {
  return (
    <nav>
      <div className="nav-logo" onClick={() => showPage('home')}>LUXE</div>
      <ul className="nav-links">
        <li><a onClick={() => showPage('home')}>Home</a></li>
        <li><a onClick={() => showPage('catalog')}>Products</a></li>
        <li><a onClick={() => showPage('catalog')}>Categories</a></li>
        <li><a onClick={() => showPage('home')}>Collections</a></li>
        <li><a onClick={() => showPage('home')}>About</a></li>
      </ul>
      <div className="nav-actions">
        <button className="nav-icon-btn" onClick={() => showPage('catalog')} title="Search">🔍</button>
        <button className="nav-icon-btn" onClick={() => showPage('wishlist')} title="Wishlist">
          🤍 <span className="badge" id="wishlist-badge">{wishlistCount}</span>
        </button>
        <button className="nav-icon-btn" onClick={() => showPage('cart')} title="Cart">
          🛒 <span className="badge" id="cart-badge">{cartQuantity}</span>
        </button>
        {isAdmin && (
          <button className="btn-nav-admin" onClick={() => showPage('admin')} title="Admin Panel">
            ⚙️ Admin
          </button>
        )}
        <button className="btn-nav-login" onClick={() => showPage(isLoggedIn ? 'dashboard' : 'login')}>
          {isLoggedIn ? 'Dashboard' : 'Sign In'}
        </button>
        <button className="hamburger" onClick={onToggleMobile}>☰</button>
      </div>
    </nav>
  );
}
