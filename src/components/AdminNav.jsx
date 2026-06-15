import React from "react";

export default function AdminNav({ adminTab, setAdminTab, collapsed, onToggle }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "🛍️" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "users", label: "Users", icon: "👥" },
  ];

  return (
    <div className={`admin-nav ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-nav-header">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h2>Admin Panel</h2>
          <button className="admin-nav-toggle" onClick={onToggle} aria-label="Toggle admin nav">{collapsed ? '☰' : '✕'}</button>
        </div>
      </div>
      <nav className="admin-nav-menu">
        {navItems.map((item) => (
          <a
            key={item.id}
            className={`admin-nav-item ${adminTab === item.id ? "active" : ""}`}
            onClick={() => setAdminTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <style>{`
        .admin-nav {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .admin-nav-header {
          padding: 15px 0;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 20px;
        }

        .admin-nav-header h2 {
          color: white;
          font-size: 18px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .admin-nav-toggle {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          padding: 6px 8px;
          border-radius: 6px;
          cursor: pointer;
        }

        .admin-nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          border-left: 3px solid transparent;
        }

        .admin-nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-left-color: #3498db;
        }

        .admin-nav-item.active {
          background: rgba(52, 152, 219, 0.2);
          color: white;
          border-left-color: #3498db;
        }

        .nav-icon {
          font-size: 18px;
        }

        .nav-label {
          flex: 1;
        }

        @media (max-width: 768px) {
          .admin-nav {
            position: fixed;
            left: 0;
            top: 64px;
            bottom: 0;
            width: 260px;
            transform: translateX(-110%);
            transition: transform 0.25s ease;
            z-index: 200;
          }

          .admin-nav.collapsed { transform: translateX(0%); }

          .admin-nav-header { padding: 12px 16px; }

          .admin-nav-menu { display: flex; flex-direction: column; }

          .admin-nav-item { padding: 12px 16px; font-size: 14px; }
          .nav-icon { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
