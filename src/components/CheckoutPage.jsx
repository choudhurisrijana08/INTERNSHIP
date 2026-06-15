import React from "react";
import Navbar from "./Navbar";

export default function CheckoutPage({ pageClass, cart, subtotal, placeOrder, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('checkout')}>
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
      <div className="checkout-page">
        <div className="breadcrumb"><span onClick={() => showPage('home')}>Home</span><span className="sep">›</span><span onClick={() => showPage('cart')} style={{ cursor: 'pointer' }}>Cart</span><span className="sep">›</span><span>Checkout</span></div>
        <h1 style={{ marginBottom: '1.5rem' }}>Checkout</h1>
        <div className="step-indicator">
          <div className="step active"><div className="step-num">1</div>Address</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">2</div>Payment</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">3</div>Review</div>
        </div>
        <div className="checkout-layout">
          <div>
            <div className="checkout-section">
              <h3>Shipping Address</h3>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" placeholder="John" /></div>
                <div className="form-group"><label>Last Name</label><input type="text" placeholder="Doe" /></div>
              </div>
              <div className="form-group"><label>Address Line 1</label><input type="text" placeholder="123, Main Street" /></div>
              <div className="form-group"><label>Address Line 2</label><input type="text" placeholder="Apartment, suite, etc." /></div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input type="text" placeholder="Mumbai" /></div>
                <div className="form-group"><label>State</label><input type="text" placeholder="Maharashtra" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>PIN Code</label><input type="text" placeholder="400001" /></div>
                <div className="form-group"><label>Phone</label><input type="tel" placeholder="+91 98765 43210" /></div>
              </div>
            </div>
            <div className="checkout-section">
              <h3>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid var(--gold)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'rgba(201,168,76,0.05)' }}>
                  <input type="radio" name="payment" checked /> 💳 Credit / Debit Card
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid #DDD', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" /> 📱 UPI (Google Pay, PhonePe, Paytm)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid #DDD', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" /> 🏦 Net Banking
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1.5px solid #DDD', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" /> 💵 Cash on Delivery
                </label>
              </div>
              <div className="form-group"><label>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" /></div>
              <div className="form-row">
                <div className="form-group"><label>Expiry</label><input type="text" placeholder="MM/YY" /></div>
                <div className="form-group"><label>CVV</label><input type="text" placeholder="•••" /></div>
              </div>
              <div className="form-group"><label>Name on Card</label><input type="text" placeholder="John Doe" /></div>
            </div>
          </div>
          <div>
            <div className="cart-summary" style={{ position: 'static' }}>
              <h3>Order Summary</h3>
              <div id="checkout-items" style={{ marginBottom: '1rem' }}>
                {cart.length ? cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                    <span>{item.emoji} {item.name} × {item.qty}</span>
                    <span>₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                )) : <p style={{ color: 'var(--gray2)', fontSize: '0.9rem' }}>No items in cart</p>}
              </div>
              <div className="summary-row"><span>Subtotal</span><span id="checkout-subtotal">₹{subtotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--green)' }}>FREE</span></div>
              <div className="summary-row total"><span>Total</span><strong id="checkout-total">₹{subtotal.toLocaleString()}</strong></div>
              <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={placeOrder}>Place Order →</button>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--gray2)', marginTop: '0.75rem' }}>🔒 Secured by 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
