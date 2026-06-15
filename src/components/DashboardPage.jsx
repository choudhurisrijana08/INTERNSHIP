import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";

export default function DashboardPage({
  pageClass,
  currentUser,
  wishlistCount,
  dashboardTab,
  setDashboardTab,
  doLogout,
  showPage,
  showToast,
  cartQuantity,
  isLoggedIn,
  isAdmin,
  mobileOpen,
  setMobileOpen,
}) {
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const userEmail = currentUser?.email || '';

  const formatOrderItems = (items) => {
    if (!items) return '';
    if (typeof items === 'string') return items;
    if (Array.isArray(items)) {
      return items.map((it) => `${it.name || 'Item'} (x${it.qty ?? 1})`).join(', ');
    }
    return '';
  };

  const totalOrders = filteredOrders.length;
  const totalSpent = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const luxPoints = Math.round(totalSpent * 0.1);

  useEffect(() => {
    let cancelled = false;
    async function loadOrders() {
      if (!userEmail) {
        setFilteredOrders([]);
        return;
      }
      try {
        setOrdersLoading(true);
        // Security: request only this user's orders.
        const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        const mine = Array.isArray(data) ? data : [];
        if (!cancelled) setFilteredOrders(mine);
      } catch {
        if (!cancelled) setFilteredOrders([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }

    }
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editedProfile, setEditedProfile] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '+91',
    dob: currentUser.dob || '',
    gender: currentUser.gender || ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(null);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  // Cleanup: remove fake/localStorage-based address + payment storage.
  // Keep UI structure intact but show empty state.
  const storageKey = () => '';
  const [addresses, setAddresses] = useState({ home: null, office: null });
  const [paymentMethods, setPaymentMethods] = useState({ default: null, items: [] });

  useEffect(() => {
    // No-op: previously read from localStorage; now intentionally disabled.
  }, []);

  const handleProfileChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const saveProfile = () => {
    setIsEditingProfile(false);
    showToast('✓ Profile updated successfully!');
  };

  const saveAddress = () => {
    setIsEditingAddress(null);
    showToast('✓ Address saved (disabled in this demo)');
  };

  const savePayment = () => {
    setIsEditingPayment(false);
    showToast('✓ Payment saved (disabled in this demo)');
  };




  return (
    <div className={pageClass('dashboard')}>
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
        <a onClick={() => { showPage('dashboard'); setMobileOpen(false); }}>Dashboard</a>
        <a onClick={() => { doLogout(); setMobileOpen(false); }}>Sign Out</a>
      </div>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-user">
            <div className="user-avatar" id="dash-avatar">{(currentUser.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name" id="dash-name">{currentUser.name || 'Guest User'}</div>
              <div className="user-email" id="dash-email">{currentUser.email || 'No email provided'}</div>
            </div>
          </div>
          <ul className="sidebar-nav">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'orders', label: '📦 My Orders' },
              { id: 'profile', label: '👤 Profile' },
              { id: 'addresses', label: '📍 Addresses' },
              { id: 'payment', label: '💳 Payment Methods' },
            ].map(item => (
              <li key={item.id} className={dashboardTab === item.id ? 'active' : ''} onClick={() => setDashboardTab(item.id)}>{item.label}</li>
            ))}
            <li onClick={() => showPage('wishlist')}>🤍 Wishlist</li>
            <li onClick={doLogout} style={{ marginTop: 'auto', color: 'rgba(255,100,100,0.7)' }}>🚪 Sign Out</li>
          </ul>
        </aside>
        <div className="dash-content">
          {ordersLoading && (
            <div style={{ padding: '12px 0', color: '#7f8c8d', fontSize: 13 }}>Loading your orders…</div>
          )}
          <div id="dash-tab-overview" style={{ display: dashboardTab === 'overview' ? 'block' : 'none' }}>

            <h2 style={{ marginBottom: '1.5rem' }}>Welcome back! 👋</h2>
            <div className="dash-stats">
              <div className="dash-stat-card">
                <div className="dash-stat-label">Total Orders</div>
                <div className="dash-stat-value">{totalOrders}</div>
                <div className="dash-stat-sub">Your purchase history</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Total Spent</div>
                <div className="dash-stat-value">₹{totalSpent.toLocaleString()}</div>
                <div className="dash-stat-sub">Across all orders</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">Wishlist Items</div>
                <div className="dash-stat-value" id="dash-wishlist-count">{wishlistCount}</div>
                <div className="dash-stat-sub">Saved for later</div>
              </div>
              <div className="dash-stat-card">
                <div className="dash-stat-label">LUXE Points</div>
                <div className="dash-stat-value" style={{ color: 'var(--gold)' }}>{luxPoints.toLocaleString()}</div>
                <div className="dash-stat-sub">≈ ₹{(luxPoints / 10).toFixed(0)} value</div>
              </div>
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
            <div className="orders-table" id="orders-table-overview">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#{o.id}</td>
                      <td>{o.date}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formatOrderItems(o.items)}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{Number(o.total || 0).toLocaleString()}</td>
                      <td><span className={`status-badge status-${(o.status || '').toLowerCase()}`}>{o.status}</span></td>
                      <td><button className="btn btn-dark btn-sm" onClick={() => showToast(`Viewing order #${o.id}`)}>View</button></td>
                    </tr>
                  ))}
                  {!filteredOrders.length && (
                    <tr>
                      <td colSpan={6} style={{ padding: 18, color: '#7f8c8d' }}>
                        No orders yet. Place an order to see it here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


          <div id="dash-tab-orders" style={{ display: dashboardTab === 'orders' ? 'block' : 'none' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>My Orders</h2>
            <div className="orders-table" id="orders-table-full">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Products</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#{o.id}</td>
                      <td>{o.date}</td>
                      <td style={{ maxWidth: '260px', wordBreak: 'break-word' }}>
                        {Array.isArray(o.items) ? (
                          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
                            {o.items.map((it, idx) => (
                              <li key={`${o.id}-${idx}`}>{it.name} (x{it.qty ?? 1})</li>
                            ))}
                          </ul>
                        ) : (
                          <span>{o.items || ''}</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{Number(o.total || 0).toLocaleString()}</td>
                      <td><span className={`status-badge status-${(o.status || '').toLowerCase()}`}>{o.status}</span></td>
                      <td><button className="btn btn-dark btn-sm" onClick={() => showToast(`Order #${o.id}`)}>View</button></td>
                    </tr>
                  ))}
                  {!filteredOrders.length && (
                    <tr>
                      <td colSpan={6} style={{ padding: 18, color: '#7f8c8d' }}>
                        No orders yet.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          <div id="dash-tab-profile" style={{ display: dashboardTab === 'profile' ? 'block' : 'none' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>My Profile</h2>
            <div className="profile-card">
              <div className="profile-avatar-big" id="dash-avatar-big">{(editedProfile.name || 'U').charAt(0).toUpperCase()}</div>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" value={(editedProfile.name || '').split(' ')[0] || ''} id="profile-fname" onChange={(e) => { const parts = editedProfile.name.split(' '); parts[0] = e.target.value; handleProfileChange('name', parts.join(' ')); }} readOnly={!isEditingProfile} /></div>
                <div className="form-group"><label>Last Name</label><input type="text" value={(editedProfile.name || '').split(' ').slice(1).join(' ') || ''} id="profile-lname" onChange={(e) => { const parts = editedProfile.name.split(' '); parts[parts.length - 1] = e.target.value; handleProfileChange('name', parts.join(' ')); }} readOnly={!isEditingProfile} /></div>
              </div>
              <div className="form-group"><label>Email</label><input type="email" value={editedProfile.email || ''} id="profile-email" onChange={(e) => handleProfileChange('email', e.target.value)} readOnly={!isEditingProfile} /></div>
              <div className="form-group"><label>Phone</label><input type="tel" value={editedProfile.phone || ''} id="profile-phone" onChange={(e) => handleProfileChange('phone', e.target.value)} readOnly={!isEditingProfile} /></div>
              <div className="form-group"><label>Date of Birth</label><input type="date" value={editedProfile.dob || ''} id="profile-dob" onChange={(e) => handleProfileChange('dob', e.target.value)} readOnly={!isEditingProfile} /></div>
              <div className="form-group"><label>Gender</label>
                <select disabled={!isEditingProfile} value={editedProfile.gender || 'Male'} onChange={(e) => handleProfileChange('gender', e.target.value)}><option>Male</option><option>Female</option><option>Prefer not to say</option></select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                {!isEditingProfile ? (
                  <button className="btn btn-primary" onClick={() => setIsEditingProfile(true)}>✏️ Edit Profile</button>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={saveProfile}>✓ Save Changes</button>
                    <button className="btn btn-dark" onClick={() => { setIsEditingProfile(false); setEditedProfile({ name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '+91 98765 43210', dob: currentUser.dob || '1990-01-01', gender: currentUser.gender || 'Male' }); }}>✕ Cancel</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div id="dash-tab-addresses" style={{ display: dashboardTab === 'addresses' ? 'block' : 'none' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Saved Addresses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              <div className="checkout-section" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--gold)', color: 'var(--black)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '2px' }}>DEFAULT</div>
                {isEditingAddress !== 'home' ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🏠 Home</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--gray2)', lineHeight: '1.7' }}>
                      {currentUser.name || 'Guest'}
                      <br />{addresses.home?.line1 || '—'}
                      <br />{[addresses.home?.city, addresses.home?.state, addresses.home?.pin].filter(Boolean).join(', ') || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-dark btn-sm" onClick={() => setIsEditingAddress('home')}>✏️ Edit</button>
                      <button className="btn btn-sm" style={{ background: 'var(--light)', border: '1px solid #DDD' }} onClick={() => { setAddresses((a) => ({ ...a, home: null })); localStorage.setItem(storageKey('addresses'), JSON.stringify({ ...addresses, home: null })); showToast('Address deleted ✓'); }}>🗑️ Delete</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>🏠 Edit Home Address</div>
                    <div className="form-group"><label>Address Line 1</label><input type="text" data-address="home-line1" defaultValue={addresses.home?.line1 || ''} /></div>
                    <div className="form-group"><label>City</label><input type="text" data-address="home-city" defaultValue={addresses.home?.city || ''} /></div>
                    <div className="form-group"><label>State</label><input type="text" data-address="home-state" defaultValue={addresses.home?.state || ''} /></div>
                    <div className="form-group"><label>PIN Code</label><input type="text" data-address="home-pin" defaultValue={addresses.home?.pin || ''} /></div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={saveAddress}>✓ Save</button>
                      <button className="btn btn-dark btn-sm" onClick={() => setIsEditingAddress(null)}>✕ Cancel</button>
                    </div>
                  </>
                )}
              </div>
              <div className="checkout-section">
                {isEditingAddress !== 'office' ? (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🏢 Office</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--gray2)', lineHeight: '1.7' }}>
                      {currentUser.name || 'Guest'}
                      <br />{addresses.office?.line1 || '—'}
                      <br />{[addresses.office?.city, addresses.office?.state, addresses.office?.pin].filter(Boolean).join(', ') || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-dark btn-sm" onClick={() => setIsEditingAddress('office')}>✏️ Edit</button>
                      <button className="btn btn-sm" style={{ background: 'var(--light)', border: '1px solid #DDD' }} onClick={() => { setAddresses((a) => ({ ...a, office: null })); localStorage.setItem(storageKey('addresses'), JSON.stringify({ ...addresses, office: null })); showToast('Address deleted ✓'); }}>🗑️ Delete</button>
                    </div>

                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>🏢 Edit Office Address</div>
                    <div className="form-group"><label>Address Line 1</label><input type="text" data-address="office-line1" defaultValue={addresses.office?.line1 || ''} /></div>
                    <div className="form-group"><label>City</label><input type="text" data-address="office-city" defaultValue={addresses.office?.city || ''} /></div>
                    <div className="form-group"><label>State</label><input type="text" data-address="office-state" defaultValue={addresses.office?.state || ''} /></div>
                    <div className="form-group"><label>PIN Code</label><input type="text" data-address="office-pin" defaultValue={addresses.office?.pin || ''} /></div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={saveAddress}>✓ Save</button>
                      <button className="btn btn-dark btn-sm" onClick={() => setIsEditingAddress(null)}>✕ Cancel</button>
                    </div>
                  </>
                )}
              </div>
              <div className="checkout-section" style={{ border: '2px dashed #DDD', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px', cursor: 'pointer', background: 'transparent' }} onClick={() => showToast('Add address form opened ✓')}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--gray2)' }}>Add New Address</div>
              </div>
            </div>
          </div>

          <div id="dash-tab-payment" style={{ display: dashboardTab === 'payment' ? 'block' : 'none' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Payment Methods</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
              {!isEditingPayment ? (
                <>
                  <div className="checkout-section" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>💳</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{paymentMethods.default?.cardNumber ? `•••• ${String(paymentMethods.default.cardNumber).slice(-4)}` : '•••• •••• •••• ••••'}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--gray2)' }}>{paymentMethods.default?.expiry ? `Card — Expires ${paymentMethods.default.expiry}` : '—'}</div>
                    </div>
                    <div style={{ background: 'var(--gold)', color: 'var(--black)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '2px' }}>DEFAULT</div>

                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-dark btn-sm" onClick={() => setIsEditingPayment(true)}>✏️ Edit</button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--light)', border: '1px solid #DDD' }}
                      onClick={() => {
                        const next = { default: null, items: [] };
                        setPaymentMethods(next);
                        localStorage.setItem(storageKey('paymentMethods'), JSON.stringify(next));
                        showToast('Payment method deleted ✓');
                      }}
                    >
                      🗑️ Delete
                    </button>

                  </div>
                  <button className="btn btn-dark" onClick={() => showToast('Add payment method ✓')}>+ Add Payment Method</button>
                </>
              ) : (
                <div className="checkout-section">
                  <h3 style={{ marginBottom: '1rem' }}>✏️ Edit Payment Method</h3>
                  <div className="form-group"><label>Card Number</label><input type="text" data-payment="cardNumber" defaultValue={paymentMethods.default?.cardNumber || ''} placeholder="1234 5678 9012 3456" /></div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Expiry (MM/YY)</label><input type="text" data-payment="expiry" defaultValue={paymentMethods.default?.expiry || ''} placeholder="MM/YY" /></div>
                    <div className="form-group" style={{ flex: 1 }}><label>CVV</label><input type="text" data-payment="cvv" defaultValue={paymentMethods.default?.cvv || ''} placeholder="•••" /></div>
                  </div>
                  <div className="form-group"><label>Name on Card</label><input type="text" data-payment="nameOnCard" defaultValue={paymentMethods.default?.nameOnCard || ''} placeholder="John Doe" /></div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-primary btn-sm" onClick={savePayment}>✓ Save</button>
                    <button className="btn btn-dark btn-sm" onClick={() => setIsEditingPayment(false)}>✕ Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
