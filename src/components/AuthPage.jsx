import React from "react";

export default function AuthPage({
  pageClass,
  showPage,
  doLogin,
  doRegister,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  registerFirstName,
  setRegisterFirstName,
  registerLastName,
  setRegisterLastName,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  registerConfirmPassword,
  setRegisterConfirmPassword,
  agreeTerms,
  setAgreeTerms,
}) {
  return (
    <>
      <div className={pageClass('login')}>
        <div className="auth-page">
          <div className="auth-visual">
            <div className="auth-visual-logo">LUXE</div>
            <div className="auth-visual-emoji">🛍️</div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your orders, wishlist, and exclusive member-only deals.</p>
          </div>
          <div className="auth-form-side">
            <div className="auth-form-box">
              <h2>Sign In</h2>
              <p className="sub">Enter your credentials to continue</p>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
                  <input type="checkbox" /> Remember me
                </label>
                <a style={{ color: 'var(--gold)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <button className="btn btn-primary btn-full" onClick={doLogin}>Sign In</button>
              <div className="auth-divider">or continue with</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button className="btn btn-dark" onClick={doLogin}>🔵 Google</button>
                <button className="btn btn-dark" onClick={doLogin}>🍎 Apple</button>
              </div>
              <div className="auth-link">Don't have an account? <a onClick={() => showPage('register')}>Create one →</a></div>
            </div>
          </div>
        </div>
      </div>

      <div className={pageClass('register')}>
        <div className="auth-page">
          <div className="auth-visual">
            <div className="auth-visual-logo">LUXE</div>
            <div className="auth-visual-emoji">✨</div>
            <h2>Join the Club</h2>
            <p>Create your LUXE account and unlock exclusive deals, early access to collections, and personalized recommendations.</p>
          </div>
          <div className="auth-form-side">
            <div className="auth-form-box">
              <h2>Create Account</h2>
              <p className="sub">Join 50,000+ happy shoppers</p>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--gray2)' }}>
                  <input
                    type="checkbox"
                    style={{ marginTop: '3px' }}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  I agree to the <a style={{ color: 'var(--gold)' }}>Terms of Service</a> and <a style={{ color: 'var(--gold)' }}>Privacy Policy</a>
                </label>
              </div>
              <button className="btn btn-primary btn-full" onClick={doRegister}>Create Account</button>
              <div className="auth-link">Already have an account? <a onClick={() => showPage('login')}>Sign in →</a></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
