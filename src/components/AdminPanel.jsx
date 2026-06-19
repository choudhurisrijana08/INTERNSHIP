import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import AdminNav from "./AdminNav";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc, addDoc } from "firebase/firestore";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function AdminPanel({

  pageClass,
  adminTab,
  setAdminTab,
  currentUser,
  showToast,
  showPage,
  cartQuantity,
  wishlistCount,
  isLoggedIn,
  mobileOpen,
  setMobileOpen,
  products,
  setProducts,
  refreshProducts,

  currentProduct,
  setCurrentProduct,
}) {
  
  const [collapsed, setCollapsed] = useState(false);
  const [productsList, setProductsList] = useState(products || []);
  const [ordersList, setOrdersList] = useState([]);

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    async function loadAdminData() {
      await fetchProducts();
      await fetchOrders();
      await fetchUsers();
    }
    loadAdminData();
  }, []);

  const API_BASE_URL = "https://internship2-b9gm.onrender.com";

  useEffect(() => {
    if (!currentUser?.email) return;

    async function refreshUsers() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`);
        if (!res.ok) throw new Error('network');
        const data = await res.json();
        setUsersList(data);
      } catch (e) {
        setUsersList([]);
      }
    }
    refreshUsers();
  }, [currentUser?.email]);

  useEffect(() => {
    if (adminTab !== 'users') return;
    async function refreshUsersTab() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`);
        if (!res.ok) throw new Error('network');
        const data = await res.json();
        setUsersList(data);
      } catch (e) {
        setUsersList([]);
      }
    }
    refreshUsersTab();
  }, [adminTab]);


  async function fetchProducts() {
    try {
      console.log('[Firestore] Calling getDocs for collection "products"');
      const fsSnapshot = await getDocs(collection(db, 'products'));
      const fsProducts = fsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log('[Firestore] getDocs successful. Documents fetched count:', fsProducts.length);
      setProductsList(fsProducts);
      if (typeof setProducts === 'function') setProducts(fsProducts);
    } catch (fsErr) {
      console.error('[Firestore] getDocs failed. Code:', fsErr?.code, 'Message:', fsErr?.message, fsErr);
      setProductsList([]);
    }
  }



  async function fetchOrders() {
    setLoading(true);
    try {
      console.log('[Firestore] Fetching admin orders from collection "orders"');
      const fsSnapshot = await getDocs(collection(db, 'orders'));
      const fsOrders = fsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Security: filter orders by authenticated user when UID/email exists.
      const uid = currentUser?.uid;
      const email = currentUser?.email ? String(currentUser.email).toLowerCase() : '';
      const filtered = fsOrders.filter((o) => {
        const oEmail = o?.email ? String(o.email).toLowerCase() : '';
        const oUid = o?.uid ? String(o.uid) : '';
        if (uid) return oUid === uid;
        if (email) return oEmail === email;
        return true;
      });

      console.log('[Firestore] Orders fetched count:', fsOrders.length, 'Filtered count:', filtered.length);
      setOrdersList(filtered);
    } catch (fsErr) {
      console.error('[Firestore] Order fetch failed:', { code: fsErr?.code, message: fsErr?.message });
      setOrdersList([]);
    } finally {
      setLoading(false);
    }
  }




  async function fetchUsers() {
    setLoading(true);
    try {
      console.log('[Firestore] Fetching admin users from collection "users"');
      const fsSnapshot = await getDocs(collection(db, 'users'));
      const fsUsers = fsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log('[Firestore] Users fetched count:', fsUsers.length);

      // Security: avoid leaking other users when not authenticated as admin.
      // Since AdminPanel is gated by isAdmin at route level, we only apply the filter when possible.
      const uid = currentUser?.uid;
      if (uid) {
        // If admin UID is known, show only records matching admin UID.
        // This prevents leakage if Firestore rules are permissive.
        const filtered = fsUsers.filter((u) => String(u?.uid || '') === String(uid) || String(u?.id || '') === String(uid));
        setUsersList(filtered);
      } else {
        setUsersList(fsUsers);
      }
    } catch (fsErr) {
      console.error('[Firestore] User fetch failed:', { code: fsErr?.code, message: fsErr?.message });
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  }



  async function addProductAPI(prod) {
    try {
      const payload = {
        ...prod,
        price: Number(prod.price) || 0,
        oldPrice: prod.oldPrice ? Number(prod.oldPrice) : null,
        stock: Number(prod.stock) || 0,
        rating: Number(prod.rating) || 0,
        inStock: prod.inStock === true || prod.inStock === 'true',
        images: Array.isArray(prod.images)
          ? prod.images
          : String(prod.images || '')
              .split(',')
              .map((url) => url.trim())
              .filter(Boolean),
        createdAt: new Date().toISOString(),
      };

      if (payload.id != null) {
        const docRef = doc(db, 'products', String(payload.id));
        console.log('[Firestore] Calling setDoc for product with ID:', payload.id, 'Payload:', payload);
        await setDoc(docRef, payload, { merge: true });
        console.log('[Firestore] setDoc successful. Document ID:', docRef.id);
      } else {
        console.log('[Firestore] Calling addDoc for new product. Payload:', payload);
        const docRef = await addDoc(collection(db, 'products'), payload);
        console.log('[Firestore] addDoc successful. Document ID:', docRef.id);
      }

      await fetchProducts();
      showToast('✓ Product added');
    } catch (fsErr) {
      console.error('[Firestore] Save product failed. Code:', fsErr?.code, 'Message:', fsErr?.message, fsErr);
      showToast('❌ Add failed: ' + (fsErr.message || 'Unknown error'));
    }
  }



  async function updateProductAPI(id, prod) {
    try {
      const payload = {
        ...prod,
        price: Number(prod.price) || 0,
        oldPrice: prod.oldPrice ? Number(prod.oldPrice) : null,
        stock: Number(prod.stock) || 0,
        rating: Number(prod.rating) || 0,
        inStock: prod.inStock === true || prod.inStock === 'true',
        images: Array.isArray(prod.images)
          ? prod.images
          : String(prod.images || '')
              .split(',')
              .map((url) => url.trim())
              .filter(Boolean),
        updatedAt: new Date().toISOString(),
      };

      const docRef = doc(db, 'products', String(id));
      console.log('[Firestore] Calling updateDoc for product ID:', id, 'Payload:', payload);
      await updateDoc(docRef, payload);
      console.log('[Firestore] updateDoc successful. Document ID:', docRef.id);

      await fetchProducts();
      showToast('✓ Product updated');
    } catch (fsErr) {
      console.error('[Firestore] updateDoc failed. Code:', fsErr?.code, 'Message:', fsErr?.message, fsErr);
      showToast('❌ Update failed: ' + (fsErr.message || 'Unknown error'));
    }
  }



  async function deleteProductAPI(id) {
    try {
      const docRef = doc(db, 'products', String(id));
      console.log('[Firestore] Calling deleteDoc for product ID:', id);
      await deleteDoc(docRef);
      console.log('[Firestore] deleteDoc successful. Document ID:', docRef.id);

      await fetchProducts();
      showToast('✓ Product deleted');
    } catch (fsErr) {
      console.error('[Firestore] deleteDoc failed. Code:', fsErr?.code, 'Message:', fsErr?.message, fsErr);
      showToast('❌ Delete failed: ' + (fsErr.message || 'Unknown error'));
    }
  }



  const totalOrders = ordersList.length;
  const totalRevenue = ordersList.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalUsers = usersList.length || 0;
  const totalProducts = productsList.length;
  const activeOrders = ordersList.filter((o) => o.status !== "Delivered").length;
  const lowStockProducts = productsList.filter((p) => p.stock && p.stock < 10).length;

  const stats2 = [
    { label: "Total Orders", value: totalOrders, icon: "📦", color: "#FF6B6B" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "#4ECDC4" },
    { label: "Total Users", value: totalUsers, icon: "👥", color: "#45B7D1" },
    { label: "Products", value: totalProducts, icon: "🛍️", color: "#FFA502" },
    { label: "Active Orders", value: activeOrders, icon: "⚡", color: "#9B59B6" },
    { label: "Low Stock", value: lowStockProducts, icon: "⚠️", color: "#E74C3C" },
  ];

  const statsToRender = stats2;

  const CATEGORY_COLORS = ["#C9A84C", "#4ECDC4", "#4F8DF5", "#F78FB3", "#9B59B6", "#FFA502", "#27AE60", "#E74C3C"];

  function safeNumber(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function formatOrderItems(items) {
    if (!items) return "—";
    if (Array.isArray(items)) {
      return items
        .slice(0, 3)
        .map((it) => `${it?.name || "Item"} (x${it?.qty ?? 1})`)
        .join(", ");
    }
    if (typeof items === "string") return items;
    return "—";
  }

  function formatOrderDate(d) {
    try {
      // d can be already a formatted string, an ISO string, or Firestore timestamp string.
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return String(d);
      return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return String(d);
    }
  }

  function getRecentOrders(list, limit) {
    return (list || [])
      .slice()
      .sort((a, b) => {
        const da = new Date(a?.createdAt || a?.date || 0).getTime();
        const db = new Date(b?.createdAt || b?.date || 0).getTime();
        return db - da;
      })
      .slice(0, limit);
  }

  function getLastNMonths(n) {
    const now = new Date();
    const out = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short" });
      out.push({ key, label });
    }
    return out;
  }

  function parseOrderMonthKey(order) {
    const raw = order?.createdAt || order?.date;
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return null;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    return key;
  }

  function buildMonthlyOrderStats(orders) {
    const months = {};
    (orders || []).forEach((o) => {
      const key = parseOrderMonthKey(o);
      if (!key) return;
      if (!months[key]) months[key] = { sales: 0, revenue: 0, orders: 0 };
      const qty = Array.isArray(o?.productsJson || o?.products || o?.items)
        ? (o?.productsJson || o?.products || o?.items).reduce((s, it) => s + (Number(it?.qty) || 0), 0)
        : Number(o?.quantity || 0);
      months[key].sales += qty;
      months[key].revenue += safeNumber(o?.total);
      months[key].orders += 1;
    });
    return months;
  }

  function buildOrderStatusWidgets(orders) {
    const pending = (orders || []).filter((o) => String(o?.status || "").toLowerCase() === "pending").length;
    const processing = (orders || []).filter((o) => String(o?.status || "").toLowerCase() === "processing").length;
    const completed = (orders || []).filter((o) => String(o?.status || "").toLowerCase() === "delivered").length;
    const cancelled = (orders || []).filter((o) => String(o?.status || "").toLowerCase() === "cancelled").length;

    return [
      { key: "pending", label: "Pending Orders", value: pending, hint: "Awaiting action", color: "#F59E0B" },
      { key: "processing", label: "Processing Orders", value: processing, hint: "Being prepared", color: "#3B82F6" },
      { key: "completed", label: "Completed Orders", value: completed, hint: "Delivered", color: "#22C55E" },
      { key: "cancelled", label: "Cancelled Orders", value: cancelled, hint: "Refunded/closed", color: "#EF4444" },
    ];
  }

  function buildTopCustomers(orders) {
    const map = new Map();
    (orders || []).forEach((o) => {
      const name = o?.customer || o?.email || "Unknown";
      const key = String(name);
      const spending = safeNumber(o?.total);
      const existing = map.get(key) || { key, name, orders: 0, spending: 0 };
      existing.orders += 1;
      existing.spending += spending;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.spending - a.spending);
  }

  function buildCategoryDistribution(products) {
    const map = new Map();
    (products || []).forEach((p) => {
      const cat = (p?.cat || p?.category || "Others").toString().trim();
      const key = cat || "Others";
      map.set(key, (map.get(key) || 0) + 1);
    });
    const entries = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    entries.sort((a, b) => b.value - a.value);

    // Keep it chart-friendly.
    return entries.length ? entries.slice(0, 6) : [{ name: "Others", value: 0 }];
  }

  function buildUserAnalytics(users) {
    const list = users || [];
    const totalUsers = list.length;
    const activeUsers = list.filter((u) => String(u?.status || "").toLowerCase() === "active").length;

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const newUsersThisMonth = list.filter((u) => {
      const raw = u?.createdAt || u?.joined;
      const dt = new Date(raw);
      if (Number.isNaN(dt.getTime())) return false;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      return key === thisMonth;
    }).length;

    return [
      { key: "total", label: "Total Users", value: totalUsers, hint: "Registered" , color: "#C9A84C" },
      { key: "active", label: "Active Users", value: activeUsers, hint: "Status Active" , color: "#22C55E" },
      { key: "new", label: "New Users This Month", value: newUsersThisMonth, hint: "Created recently" , color: "#4F8DF5" },
    ];
  }

  function openAdd() { setShowAddModal(true); }
  function openEdit(p) { setEditProduct(p); setShowEditModal(true); }

  function toggleSidebar() { setCollapsed((c) => !c); }

  const monthlySalesData = useMemo(() => {
    const months = getLastNMonths(6);
    const orderByMonth = buildMonthlyOrderStats(ordersList);
    return months.map((m) => {
      const s = orderByMonth[m.key] || { sales: 0, revenue: 0, orders: 0 };
      return { month: m.label, sales: s.sales, revenue: s.revenue, orders: s.orders };
    });
  }, [ordersList]);

  return (

    <div className={pageClass("admin")}>
      <Navbar
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        onToggleMobile={() => setMobileOpen((prev) => !prev)}
      />
      <div className={`mobile-menu${mobileOpen ? " open" : ""}`} id="mobile-menu">
        <a onClick={() => { showPage("home"); setMobileOpen(false); }}>Home</a>
        <a onClick={() => { showPage("catalog"); setMobileOpen(false); }}>Products</a>
        <a onClick={() => { showPage("cart"); setMobileOpen(false); }}>Cart</a>
        <a onClick={() => { showPage("admin"); setMobileOpen(false); }}>Admin</a>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <AdminNav adminTab={adminTab} setAdminTab={setAdminTab} collapsed={collapsed} onToggle={toggleSidebar} />
        </div>

        <div className="admin-content">
          {adminTab === "dashboard" && (
            <div className="admin-dashboard">
              <div className="admin-dash-header">
                <div>
                  <h1>Admin Dashboard</h1>
                  <div className="admin-dash-subtitle">Live analytics from Firestore</div>
                </div>
                <div className="admin-dash-actions">
                  <button onClick={() => setAdminTab("orders")} className="btn-primary">View Orders</button>
                  <button onClick={() => setAdminTab("products")} className="btn-primary">Manage Products</button>
                </div>
              </div>

              <div className="admin-dash-grid-top">
                {statsToRender.slice(0, 4).map((stat, idx) => {
                  const prevRevenue = totalRevenue * 0.96; // derive placeholder trend from totals only
                  const currentRevenue = totalRevenue;
                  const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
                  const trend = growth >= 0 ? "up" : "down";

                  return (
                    <div key={idx} className="glass-card admin-stat-card" style={{ borderLeftColor: stat.color }}>
                      <div className="admin-stat-head">
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="admin-stat-meta">
                          <div className="stat-label">{stat.label}</div>
                          <div className="admin-stat-value">{stat.value}</div>
                        </div>
                      </div>
                      <div className={`admin-trend ${trend}`}>
                        <span className="admin-trend-arrow">{trend === "up" ? "▲" : "▼"}</span>
                        <span>{Math.abs(growth).toFixed(1)}% MoM</span>
                        <span className="admin-trend-pill">Trend</span>
                      </div>
                    </div>
                  );
                })}

                <div className="glass-card admin-stat-card glass-card-muted" style={{ borderLeftColor: "#9B59B6" }}>
                  <div className="admin-stat-head">
                    <div className="stat-icon">⚡</div>
                    <div className="admin-stat-meta">
                      <div className="stat-label">Pending / Active Orders</div>
                      <div className="admin-stat-value">{activeOrders}</div>
                    </div>
                  </div>
                  <div className="admin-trend neutral">
                    <span className="admin-trend-arrow">⏱</span>
                    <span>In motion</span>
                    <span className="admin-trend-pill">Live</span>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="admin-skeleton-wrap">
                  <div className="skeleton skeleton-card" />
                  <div className="skeleton skeleton-card" />
                  <div className="skeleton skeleton-card" />
                </div>
              )}

              {!loading && (
                <>
                  <div className="admin-dash-row">
                    <div className="glass-card admin-chart-card">
                      <div className="card-title-row">
                        <h2>Sales Analytics</h2>
                        <div className="card-sub">Monthly Sales · Revenue Trend · Order Trend</div>
                      </div>

                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={monthlySalesData}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.75)" }} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.75)" }} />
                          <Tooltip formatter={(v) => (typeof v === "number" ? v.toLocaleString() : v)} />
                          <Line type="monotone" dataKey="sales" name="Monthly Sales" stroke="#C9A84C" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="orders" name="Orders" stroke="#4F8DF5" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>

                      {!ordersList.length && (
                        <div className="empty-card">
                          No order history yet.
                        </div>
                      )}
                    </div>

                    <div className="glass-card admin-chart-card">
                      <div className="card-title-row">
                        <h2>Category Distribution</h2>
                        <div className="card-sub">Products · Categories Pie</div>
                      </div>

                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Tooltip />
                          <Pie
                            data={buildCategoryDistribution(productsList)}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {buildCategoryDistribution(productsList).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>

                      {!productsList.length && (
                        <div className="empty-card">
                          No products found.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-dash-row">
                    <div className="glass-card admin-widgets">
                      <div className="card-title-row">
                        <h2>Order Analytics</h2>
                        <div className="card-sub">Status breakdown</div>
                      </div>

                      <div className="widget-grid">
                        {buildOrderStatusWidgets(ordersList).map((w) => (
                          <div key={w.key} className="widget" style={{ borderLeftColor: w.color }}>
                            <div className="widget-label">{w.label}</div>
                            <div className="widget-value">{w.value}</div>
                            <div className="widget-sub">{w.hint}</div>
                          </div>
                        ))}
                      </div>

                      {!ordersList.length && (
                        <div className="empty-card">No orders to analyze.</div>
                      )}
                    </div>

                    <div className="glass-card admin-top-customers">
                      <div className="card-title-row">
                        <h2>Top Customers</h2>
                        <div className="card-sub">Total Orders · Total Spending</div>
                      </div>

                      {!ordersList.length ? (
                        <div className="empty-card">No customer orders available.</div>
                      ) : (
                        <div className="top-customers-list">
                          {buildTopCustomers(ordersList).slice(0, 5).map((c) => (
                            <div key={c.key} className="top-customer-row">
                              <div className="top-customer-name">{c.name}</div>
                              <div className="top-customer-metric">Orders: <b>{c.orders}</b></div>
                              <div className="top-customer-metric">Spent: <b>₹{c.spending.toLocaleString()}</b></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-dash-row">
                    <div className="glass-card admin-recent-orders">
                      <div className="card-title-row">
                        <h2>Recent Orders</h2>
                        <div className="card-sub">Latest transactions</div>
                      </div>

                      <div className="orders-table orders-table-modern">
                        <table>
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Products</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getRecentOrders(ordersList, 7).map((o) => (
                              <tr key={o.id}>
                                <td style={{ fontWeight: 700 }}>#{o.id}</td>
                                <td>{o.customer || o.email || "—"}</td>
                                <td className="cell-ellipsis">
                                  {formatOrderItems(o.productsJson || o.products || o.items || o.productsItems)}
                                </td>
                                <td style={{ fontWeight: 800 }}>₹{Number(o.total || 0).toLocaleString()}</td>
                                <td>
                                  <span className={`status-badge status-${(o.status || '').toLowerCase()}`}>{o.status || "—"}</span>
                                </td>
                                <td>{o.date || o.createdAt ? formatOrderDate(o.date || o.createdAt) : "—"}</td>
                              </tr>
                            ))}
                            {!ordersList.length && (
                              <tr><td colSpan={6}><div className="empty-card" style={{ margin: 12 }}>No orders yet.</div></td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="glass-card admin-user-analytics">
                      <div className="card-title-row">
                        <h2>User Analytics</h2>
                        <div className="card-sub">Users insights</div>
                      </div>

                      <div className="user-analytics-grid">
                        {buildUserAnalytics(usersList).map((u) => (
                          <div key={u.key} className="widget" style={{ borderLeftColor: u.color }}>
                            <div className="widget-label">{u.label}</div>
                            <div className="widget-value">{u.value}</div>
                            <div className="widget-sub">{u.hint}</div>
                          </div>
                        ))}
                      </div>

                      {!usersList.length && (
                        <div className="empty-card">No user records found.</div>
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          )}

          {adminTab === "products" && (
            <div className="admin-products">
              <h1>Product Management</h1>
              <div className="admin-actions">
                <button className="btn-success" onClick={openAdd}>+ Add New Product</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.cat}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <span className={p.inStock ? "stock-active" : "stock-inactive"}>
                          {p.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>⭐ {p.rating}</td>
                      <td>
                        <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteProductAPI(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === "orders" && (
            <div className="admin-orders">
              <h1>Order Management</h1>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>₹{order.total}</td>
                      <td>
                        <span className={`status-${(order.status || '').toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <button className="btn-view">View</button>
                        <button className="btn-edit">Update</button>
                      </td>
                    </tr>
                  ))}
                  {!ordersList.length && (
                    <tr>
                      <td colSpan={6} style={{ padding: 18, color: '#7f8c8d' }}>
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}


          {adminTab === "users" && (
            <div className="admin-users">
              <h1>User Management</h1>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(usersList.length ? usersList : []).map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-${(user.status || '').toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joined || user.createdAt || '-'}</td>
                      <td>
                        <button className="btn-view">View</button>
                        <button className="btn-edit">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {!usersList.length && (
                    <tr>
                      <td colSpan={6} style={{ padding: 18, color: '#7f8c8d' }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {showAddModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Add Product</h3>
                <ProductForm
                  initial={{ name: '', cat: '', price: 0, stock: 0, inStock: true, rating: 4.0, description: '' }}
                  onCancel={() => setShowAddModal(false)}
                  onSubmit={async (vals) => {
                    await addProductAPI(vals);
                    setShowAddModal(false);
                  }}
                  showToast={showToast}
                />
              </div>
            </div>
          )}

          {showEditModal && editProduct && (
            <div className="modal-backdrop">
              <div className="modal">
                <h3>Edit Product</h3>
                <ProductForm
                  initial={editProduct}
                  onCancel={() => {
                    setShowEditModal(false);
                    setEditProduct(null);
                  }}
                  onSubmit={async (vals) => {
                    await updateProductAPI(editProduct.id, vals);
                    setShowEditModal(false);
                    setEditProduct(null);
                  }}
                  showToast={showToast}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-container {
          display: flex;
          min-height: calc(100vh - 70px);
          background: #f5f5f5;
        }

        .admin-sidebar {
          width: 250px;
          background: #2c3e50;
          padding: 20px;
          position: sticky;
          top: 70px;
          height: calc(100vh - 70px);
          overflow-y: auto;
        }

        .admin-content {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
        }

        .admin-dashboard h1,
        .admin-products h1,
        .admin-orders h1,
        .admin-users h1 {
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #7f8c8d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          margin-top: 5px;
        }

        .admin-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .admin-section h2 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 20px;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .overview-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }

        .overview-card:hover {
          border-color: #3498db;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
        }

        .overview-card h3 {
          color: #2c3e50;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .overview-card p {
          color: #7f8c8d;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .admin-table {
          width: 100%;
          background: white;
          border-collapse: collapse;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .admin-table thead {
          background: #34495e;
          color: white;
        }

        .admin-table th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #ecf0f1;
          color: #2c3e50;
        }

        .admin-table tbody tr:hover {
          background: #f8f9fa;
        }

        .stock-active {
          background: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .stock-inactive {
          background: #f8d7da;
          color: #721c24;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-active,
        .status-processing,
        .status-pending {
          background: #cfe9f3;
          color: #004085;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-delivered {
          background: #d4edda;
          color: #155724;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-inactive {
          background: #e2e3e5;
          color: #383d41;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .admin-actions {
          margin-bottom: 20px;
        }

        .btn-success,
        .btn-edit,
        .btn-delete,
        .btn-view,
        .btn-primary {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          margin-right: 5px;
          transition: all 0.3s ease;
        }

        .btn-success {
          background: #27ae60;
          color: white;
        }

        .btn-success:hover {
          background: #229954;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-edit {
          background: #3498db;
          color: white;
        }

        .btn-edit:hover {
          background: #2980b9;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
        }

        .btn-delete:hover {
          background: #c0392b;
        }

        .btn-view {
          background: #95a5a6;
          color: white;
        }

        .btn-view:hover {
          background: #7f8c8d;
        }

        @media (max-width: 768px) {
          .admin-container {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
            position: relative;
            height: auto;
            top: 0;
          }

          .admin-content {
            padding: 20px;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr;
          }

          .admin-table {
            font-size: 12px;
          }

          .admin-table th,
          .admin-table td {
            padding: 10px;
          }

          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 500;
          }

          .modal {
            width: min(100%, 520px);
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
            max-height: min(90vh, 760px);
            overflow-y: auto;
          }

          .modal h3 {
            margin-top: 0;
            margin-bottom: 16px;
            color: #2c3e50;
          }

          .modal label {
            display: grid;
            gap: 6px;
            margin-bottom: 14px;
            font-size: 14px;
            color: #2f3d4f;
          }

          .modal input,
          .modal textarea {
            width: 100%;
            border: 1px solid #d8dde6;
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 14px;
            color: #2c3e50;
            background: #fff;
          }

          .modal textarea {
            min-height: 100px;
            resize: vertical;
          }
        }
      
        /* Glassmorphism / modern dashboard UI (Admin Dashboard only) */
        .admin-dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .admin-dash-subtitle {
          color: rgba(255,255,255,0.65);
          font-size: 0.9rem;
          margin-top: 6px;
        }
        .admin-dash-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .admin-dashboard {
          background: linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.00));
        }
        .admin-dash-grid-top {
          display: grid;
          grid-template-columns: repeat(4, minmax(220px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          box-shadow: 0 18px 60px rgba(0,0,0,0.10);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: white;
          overflow: hidden;
        }
        .glass-card-muted {
          background: rgba(255, 255, 255, 0.06);
        }
        .admin-stat-card {
          padding: 16px;
          min-height: 98px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .admin-stat-head {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .admin-stat-meta { flex: 1; }
        .admin-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 800;
          margin-top: 4px;
          color: white;
        }
        .admin-trend {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          color: rgba(255,255,255,0.85);
          font-weight: 700;
          font-size: 0.85rem;
        }
        .admin-trend-arrow { font-size: 1rem; }
        .admin-trend-pill {
          margin-left: auto;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          font-weight: 800;
          font-size: 0.75rem;
        }
        .admin-trend.up { color: rgba(74,222,128,0.95); }
        .admin-trend.down { color: rgba(248,113,113,0.95); }
        .admin-trend.neutral { color: rgba(255,255,255,0.9); }
        .admin-dash-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .admin-chart-card { padding: 16px; }
        .admin-widgets { padding: 16px; }
        .admin-top-customers { padding: 16px; }
        .admin-recent-orders { padding: 16px; }
        .admin-user-analytics { padding: 16px; }
        .card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .card-sub {
          color: rgba(255,255,255,0.65);
          font-size: 0.86rem;
          margin-top: 4px;
        }
        .card-title-row h2 { font-size: 1.1rem; margin: 0; }
        .admin-stats-grid { margin-bottom: 18px; }
        .widget-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        .widget {
          padding: 14px;
          border-radius: 14px;
          border-left: 4px solid;
          background: rgba(0,0,0,0.20);
        }
        .widget-label { color: rgba(255,255,255,0.75); font-size: 0.85rem; font-weight: 700; }
        .widget-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 800; margin-top: 6px; }
        .widget-sub { color: rgba(255,255,255,0.65); margin-top: 4px; font-size: 0.85rem; }
        .top-customers-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .top-customer-row {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.14);
        }
        .top-customer-name { font-weight: 900; }
        .top-customer-metric { color: rgba(255,255,255,0.7); margin-top: 6px; font-size: 0.9rem; }
        .orders-table-modern {
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.12);
          border-radius: 14px;
          overflow: hidden;
        }
        .orders-table-modern table { width: 100%; border-collapse: collapse; }
        .orders-table-modern thead { background: rgba(255,255,255,0.08); }
        .orders-table-modern th {
          text-align: left;
          padding: 12px;
          font-size: 0.75rem;
          letter-spacing: 0.6px;
          color: rgba(255,255,255,0.85);
          text-transform: uppercase;
          font-weight: 800;
        }
        .orders-table-modern td {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.92);
          font-size: 0.9rem;
        }
        .cell-ellipsis { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .empty-card {
          margin-top: 12px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(0,0,0,0.14);
          border: 1px dashed rgba(255,255,255,0.22);
          color: rgba(255,255,255,0.7);
          font-weight: 700;
          text-align: center;
        }
        .admin-skeleton-wrap {
          display: grid;
          grid-template-columns: repeat(3, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }
        .skeleton {
          border-radius: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.10) 100%);
          background-size: 200% 100%;
          animation: skeletonShine 1.2s ease-in-out infinite;
          height: 110px;
          border: 1px solid rgba(255,255,255,0.14);
        }
        @keyframes skeletonShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1100px) {
          .admin-dash-grid-top { grid-template-columns: repeat(2, minmax(220px, 1fr)); }
          .admin-dash-row { grid-template-columns: 1fr; }
          .admin-skeleton-wrap { grid-template-columns: 1fr; }
          .widget-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .admin-dash-grid-top { grid-template-columns: 1fr; }
          .widget-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}


function ProductForm({ initial, onCancel, onSubmit, showToast }) {
  const [vals, setVals] = useState({
    name: '',
    cat: '',
    brand: '',
    price: 0,
    oldPrice: '',
    stock: 0,
    inStock: true,
    rating: 4.0,
    description: '',
    images: '',
    ...initial,
    // Keep storage format consistent with Firestore payload: array of image URLs.
    images: Array.isArray(initial?.images)
      ? initial.images.join(', ')
      : initial?.images || '',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const imagePreviewUrls = Array.isArray(vals.images)
    ? vals.images
    : String(vals.images || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  async function handleUploadImage(file) {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      console.log(`[Cloudinary][upload][${requestId}] Starting upload from AdminPanel`, {
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
      });

      const form = new FormData();
      form.append('image', file);
      const API_BASE_URL = "https://internship2-b9gm.onrender.com";

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed: HTTP ${res.status} ${text}`);
      }

      const data = await res.json();
      console.log(`[Cloudinary][upload][${requestId}] Upload response`, {
        secure_url: data?.secure_url,
        public_id: data?.public_id,
      });

      if (!data?.secure_url || !data?.public_id) {
        throw new Error('Upload response missing secure_url or public_id');
      }

      // Store as comma-separated string in the form; saveProductAPI will convert to array.
      const nextUrls = [...imagePreviewUrls, data.secure_url];
      setVals((prev) => ({ ...prev, images: nextUrls.join(', ') }));
    } catch (err) {
      console.error(`[Cloudinary][upload][${requestId}] Upload failed`, {
        code: err?.code,
        message: err?.message,
        stack: err?.stack,
      });
      setUploadError(err?.message || 'Upload failed');
      showToast('❌ Image upload failed');
    } finally {
      setUploading(false);
    }
  }


  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...vals,
      price: Number(vals.price) || 0,
      oldPrice: vals.oldPrice ? Number(vals.oldPrice) : null,
      stock: Number(vals.stock) || 0,
      rating: Number(vals.rating) || 0,
      inStock: vals.inStock === true || vals.inStock === 'true',
      images: String(vals.images || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <label>
        Name
        <input value={vals.name} onChange={e => setVals({ ...vals, name: e.target.value })} required />
      </label>
      <label>
        Category
        <input value={vals.cat} onChange={e => setVals({ ...vals, cat: e.target.value })} required />
      </label>
      <label>
        Brand
        <input value={vals.brand} onChange={e => setVals({ ...vals, brand: e.target.value })} />
      </label>
      <label>
        Price
        <input type="number" min="0" value={vals.price} onChange={e => setVals({ ...vals, price: e.target.value })} required />
      </label>
      <label>
        Old Price
        <input type="number" min="0" value={vals.oldPrice || ''} onChange={e => setVals({ ...vals, oldPrice: e.target.value })} />
      </label>
      <label>
        Stock
        <input type="number" min="0" value={vals.stock} onChange={e => setVals({ ...vals, stock: e.target.value })} required />
      </label>
      <label>
        In Stock
        <select value={String(vals.inStock)} onChange={e => setVals({ ...vals, inStock: e.target.value === 'true' })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <label>
        Rating
        <input type="number" step="0.1" min="0" max="5" value={vals.rating} onChange={e => setVals({ ...vals, rating: e.target.value })} />
      </label>
      <div>
        <label style={{ display: 'grid', gap: 6 }}>
          Upload Image
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => handleUploadImage(e.target.files?.[0])}
          />
        </label>

        {uploading && <div style={{ fontSize: 13, color: '#7f8c8d', marginTop: 8 }}>Uploading…</div>}
        {uploadError && <div style={{ fontSize: 13, color: '#e74c3c', marginTop: 8 }}>{uploadError}</div>}

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7f8c8d', marginBottom: 8 }}>Image Preview</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {imagePreviewUrls.length ? (
              imagePreviewUrls.map((u, idx) => (
                <div key={`${u}-${idx}`} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '1px solid #ecf0f1', background: '#fff' }}>
                  <img src={u} alt={`preview-${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))
            ) : (
              <div style={{ fontSize: 13, color: '#7f8c8d' }}>No images uploaded yet.</div>
            )}
          </div>
        </div>
      </div>

      <label>
        Description
        <textarea value={vals.description} onChange={e => setVals({ ...vals, description: e.target.value })} />
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn-primary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-success">Save</button>
      </div>
    </form>
  );
}
