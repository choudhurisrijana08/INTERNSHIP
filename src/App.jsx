import React, { useEffect, useMemo, useState } from "react";
import "./styles/global.css";

import HomePage from "./components/HomePage";
import AuthPage from "./components/AuthPage";
import CatalogPage from "./components/CatalogPage";
import ProductDetail from "./components/ProductDetail";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import WishlistPage from "./components/WishlistPage";
import DashboardPage from "./components/DashboardPage";
import SuccessPage from "./components/SuccessPage";
import AdminPanel from "./components/AdminPanel";
import ProductCard from "./components/ProductCard";
import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, getDocs, setDoc, doc, addDoc } from "firebase/firestore";

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState({ name: 'John Doe', email: 'john@luxe.com' });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ratingFilter, setRatingFilter] = useState('0');
  const [filterSale, setFilterSale] = useState(false);
  const [filterInStock, setFilterInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [detailTab, setDetailTab] = useState('tab-desc');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (!toast.visible) return;

    const timer = window.setTimeout(() => setToast({ visible: false, message: '' }), 3000);
    return () => window.clearTimeout(timer);
  }, [toast.visible]);

  async function loadProducts() {
    setProductsLoading(true);
    try {
      console.log('[Firestore] Calling getDocs for collection "products"');
      const fsSnapshot = await getDocs(collection(db, 'products'));
      const fsProducts = fsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      console.log('[Firestore] getDocs successful. Documents fetched count:', fsProducts.length);
      setProducts(fsProducts);
    } catch (fsErr) {
      console.error('[Firestore] getDocs failed. Code:', fsErr?.code, 'Message:', fsErr?.message, fsErr);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }


  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const minP = parseFloat(priceMin) || 0;
    const maxP = priceMax.trim() === '' ? Infinity : parseFloat(priceMax);
    const minR = parseFloat(ratingFilter) || 0;
    const query = searchQuery.toLowerCase().trim();

    const list = products.filter(p => {
      if (catFilter !== 'all' && p.cat !== catFilter) return false;
      if (p.price < minP || p.price > maxP) return false;
      if (p.rating < minR) return false;
      if (filterSale && !p.oldPrice) return false;
      if (filterInStock && !p.inStock) return false;
      if (query && !p.name.toLowerCase().includes(query) && !p.brand.toLowerCase().includes(query)) return false;
      return true;
    });

    if (sortOption === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sortOption === 'rating') return list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [catFilter, filterInStock, filterSale, priceMax, priceMin, ratingFilter, searchQuery, sortOption]);

  const cartQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const wishlistCount = wishlist.length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal - cartDiscount;
  const pageClass = id => page === id ? 'page active' : 'page';

  function showPage(id) {
    if (id === 'admin' && !isAdmin) {
      showToast('❌ Admin access denied');
      return;
    }
    if (id === 'dashboard' && !isLoggedIn) {
      setPage('login');
      setMobileOpen(false);
      return;
    }

    setPage(id);
    setMobileOpen(false);
  }

  function showToast(message) {
    setToast({ visible: true, message });
  }

  async function syncUserToBackend(user) {
    if (!user?.uid) {
      console.error('[Firestore] User sync skipped: missing uid');
      return;
    }

    // Firestore users collection is the source of truth.
    // Prevent duplicate user documents by using uid as the document ID.
    try {
      const uid = user.uid;
      const name = user.displayName || user.email;
      const email = user.email;

      const userRef = doc(db, 'users', String(uid));
      const payload = {
        uid,
        name,
        email,
        status: 'Active',
        // Ensure createdAt exists only once; when merging, keep existing if present.
        createdAt: new Date().toISOString(),
      };

      // setDoc(..., { merge: true }) prevents duplicate docs (same UID doc id).
      // To avoid resetting createdAt on login, only overwrite createdAt if missing.
      // (We do a lightweight get to distinguish create vs update.)
      const existingSnap = await (await import('firebase/firestore')).getDoc(userRef);
      const isExisting = existingSnap.exists();

      if (isExisting) {
        await setDoc(
          userRef,
          {
            uid,
            name,
            email,
            status: 'Active',
            // keep createdAt unchanged by not including it when updating
          },
          { merge: true }
        );
        console.log('User update success: Firestore');
      } else {
        await setDoc(userRef, payload, { merge: true });
        console.log('User saved to Firestore');
      }
    } catch (e) {
      console.error('Firestore user sync error');
      console.error(e?.code);
      console.error(e?.message);
    }

    // Keep existing backend sync intact for any dependent functionality.
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.displayName || user.email,
          email: user.email,
          status: 'Active',
          joined: new Date().toISOString().slice(0, 10),
        }),
      });
    } catch (error) {
      console.warn('Backend user sync failed', error);
    }
  }


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncUserToBackend(user);
        setIsLoggedIn(true);
        setCurrentUser({ name: user.displayName || user.email, email: user.email });
      } else {
        setIsLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);


  async function doLogin() {
    // Validation
    if (!loginEmail.trim()) {
      showToast('❌ Please enter your email');
      return;
    }
    if (!loginPassword.trim()) {
      showToast('❌ Please enter your password');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      showToast('❌ Please enter a valid email');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const user = userCredential.user;
      setIsLoggedIn(true);
      setCurrentUser({ name: user.displayName || user.email, email: user.email });
      // Check if admin
      if (user.email === 'admin@luxe.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      syncUserToBackend({
        displayName: user.displayName,
        email: user.email,
      });
      // Clear form
      setLoginEmail('');
      setLoginPassword('');
      showToast('✓ Welcome back!');
      setPage('home');
    } catch (error) {
      console.error(error);
      let message = '❌ Login failed';
      if (error.code === 'auth/user-not-found') {
        message = '❌ Email not registered';
      } else if (error.code === 'auth/wrong-password') {
        message = '❌ Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = '❌ Invalid email format';
      } else if (error.code === 'auth/user-disabled') {
        message = '❌ Account has been disabled';
      }
      showToast(message);
    }
  }

  async function doRegister() {
    // Validation
    if (!registerFirstName.trim()) {
      showToast('❌ Please enter your first name');
      return;
    }
    if (!registerLastName.trim()) {
      showToast('❌ Please enter your last name');
      return;
    }
    if (!registerEmail.trim()) {
      showToast('❌ Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      showToast('❌ Please enter a valid email');
      return;
    }
    if (!registerPassword.trim()) {
      showToast('❌ Please enter a password');
      return;
    }
    if (registerPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      showToast('❌ Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      showToast('❌ Please agree to the terms and conditions');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      await updateProfile(userCredential.user, {
        displayName: `${registerFirstName.trim()} ${registerLastName.trim()}`.trim(),
      });
      const user = auth.currentUser;
      setIsLoggedIn(true);
      setCurrentUser({ name: user.displayName || user.email, email: user.email });
      // Check if admin
      if (user.email === 'admin@luxe.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      syncUserToBackend({
        displayName: user.displayName,
        email: user.email,
      });
      
      // Clear form fields
      setRegisterFirstName('');
      setRegisterLastName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setAgreeTerms(false);
      
      showToast('🎉 Account created successfully!');
      setPage('home');
    } catch (error) {
      console.error(error);
      let message = '❌ Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        message = '❌ Email already registered';
      } else if (error.code === 'auth/invalid-email') {
        message = '❌ Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        message = '❌ Password is too weak (min 6 characters)';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = '❌ Registration is currently disabled';
      }
      showToast(message);
    }
  }

  async function doLogout() {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUser({ name: '', email: '' });
      // Clear form fields on logout
      setLoginEmail('');
      setLoginPassword('');
      setRegisterFirstName('');
      setRegisterLastName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setAgreeTerms(false);
      showToast('👋 Signed out successfully');
      setPage('home');
    } catch (error) {
      console.error(error);
      showToast('❌ Logout failed');
    }
  }

  function addToCart(id) {
    if (!isLoggedIn) {
      showToast('❌ Please login to add items to cart');
      setPage('login');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }

      const product = products.find(p => p.id === id);
      return product ? [...prev, { ...product, qty: 1 }] : prev;
    });

    const product = products.find(p => p.id === id);
    if (product) showToast(`✓ ${product.name} added to cart!`);
  }

  function updateQty(id, delta) {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0)
    );
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(item => item.id !== id));
    showToast('Item removed from cart');
  }

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (code === 'LUXE10') {
      setCartDiscount(500);
      showToast('✓ Coupon LUXE10 applied! ₹500 off');
      return;
    }
    if (code === 'FIRST15') {
      setCartDiscount(750);
      showToast('✓ Coupon FIRST15 applied! ₹750 off');
      return;
    }
    showToast('❌ Invalid coupon code');
  }

  function toggleWishlist(id) {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === id);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter(item => item.id !== id);
      }
      const product = products.find(p => p.id === id);
      if (product) showToast(`♥ ${product.name} added to wishlist!`);
      return product ? [...prev, product] : prev;
    });
  }

  function showProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setCurrentProduct(product);
    setDetailTab('tab-desc');
    setPage('product');
  }

  function addToCartFromDetail() {
    if (currentProduct) addToCart(currentProduct.id);
  }

  function addToWishlistFromDetail() {
    if (currentProduct) toggleWishlist(currentProduct.id);
  }

  function filterAndShowCatalog(category) {
    setCatFilter(category);
    setPage('catalog');
  }

  function resetFilters() {
    setCatFilter('all');
    setRatingFilter('0');
    setPriceMin('');
    setPriceMax('');
    setFilterSale(false);
    setFilterInStock(false);
    setSearchQuery('');
    setSortOption('featured');
  }

  function renderProductCard(product) {
    const inWish = wishlist.some(item => item.id === product.id);
    return (
      <ProductCard
        key={product.id}
        product={product}
        onShow={showProduct}
        onAddCart={addToCart}
        onToggleWishlist={toggleWishlist}
        inWishlist={inWish}
      />
    );
  }

  const detailProduct = useMemo(() => {
    const active = currentProduct || (products.length ? products[0] : null);
    if (!active) {
      return { id: '', name: '', cat: '', price: 0, stock: 0, inStock: false, rating: 0, description: '', images: [], brand: '', oldPrice: null };
    }
    return products.find(p => String(p.id) === String(active.id)) || active;
  }, [currentProduct, products]);
  const detailSizesHidden = ['Electronics', 'Home', 'Books', 'Beauty'].includes(detailProduct.cat);

  async function placeOrder() {
    if (!isLoggedIn) {
      showToast('❌ Please login to complete your purchase');
      setPage('login');
      return;
    }
    if (cart.length === 0) {
      showToast('❌ Your cart is empty!');
      return;
    }

    try {
      const orderData = {
        customer: currentUser.name || currentUser.email,
        email: currentUser.email,
        items: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        amount: `₹${total.toLocaleString()}`,
        total: total,
        status: 'Processing',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      };


      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Failed to save order on backend');
      console.log('Order saved to backend successfully');

      // Required: Firestore orders collection is the source of truth.
      // Add order document (auto-id) and include uid to support filtering.
      try {
        const uid = auth?.currentUser?.uid;
        await addDoc(collection(db, 'orders'), {
          uid: uid || null,
          customer: orderData.customer,
          email: orderData.email,
          products: orderData.items,
          productsItems: orderData.items,
          productsJson: orderData.items,
          quantity: orderData.items?.map((it) => it.qty).reduce((a,b)=>a+b,0) || 0,
          total: orderData.total,
          status: orderData.status,
          createdAt: new Date().toISOString(),
          date: orderData.date,
          items: orderData.items,
          amount: orderData.amount,
        });
      } catch (e) {
        console.error('[Firestore] Order write failed:', { code: e?.code, message: e?.message });
      }
    } catch (err) {
      console.error('Error placing order:', err);
    }

    setCart([]);
    setCartDiscount(0);
    showPage('success');
  }

  return (
    <>
      <HomePage
        pageClass={pageClass}
        showPage={showPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        wishlist={wishlist}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        products={products}
        filterAndShowCatalog={filterAndShowCatalog}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        showProduct={showProduct}
      />

      <AuthPage
        pageClass={pageClass}
        showPage={showPage}
        doLogin={doLogin}
        doRegister={doRegister}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        registerFirstName={registerFirstName}
        setRegisterFirstName={setRegisterFirstName}
        registerLastName={registerLastName}
        setRegisterLastName={setRegisterLastName}
        registerEmail={registerEmail}
        setRegisterEmail={setRegisterEmail}
        registerPassword={registerPassword}
        setRegisterPassword={setRegisterPassword}
        registerConfirmPassword={registerConfirmPassword}
        setRegisterConfirmPassword={setRegisterConfirmPassword}
        agreeTerms={agreeTerms}
        setAgreeTerms={setAgreeTerms}
      />

      <CatalogPage
        pageClass={pageClass}
        filteredProducts={filteredProducts}
        catFilter={catFilter}
        setCatFilter={setCatFilter}
        priceMin={priceMin}
        setPriceMin={setPriceMin}
        priceMax={priceMax}
        setPriceMax={setPriceMax}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        filterSale={filterSale}
        setFilterSale={setFilterSale}
        filterInStock={filterInStock}
        setFilterInStock={setFilterInStock}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        resetFilters={resetFilters}
        renderProductCard={renderProductCard}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <ProductDetail
        pageClass={pageClass}
        detailProduct={detailProduct}
        detailTab={detailTab}
        setDetailTab={setDetailTab}
        detailSizesHidden={detailSizesHidden}
        addToCartFromDetail={addToCartFromDetail}
        addToWishlistFromDetail={addToWishlistFromDetail}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <CartPage
        pageClass={pageClass}
        cart={cart}
        subtotal={subtotal}
        total={total}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        applyCoupon={applyCoupon}
        updateQty={updateQty}
        removeFromCart={removeFromCart}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <CheckoutPage
        pageClass={pageClass}
        cart={cart}
        subtotal={subtotal}
        placeOrder={placeOrder}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <WishlistPage
        pageClass={pageClass}
        wishlist={wishlist}
        renderProductCard={renderProductCard}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <DashboardPage
        pageClass={pageClass}
        currentUser={currentUser}
        wishlistCount={wishlistCount}
        dashboardTab={dashboardTab}
        setDashboardTab={setDashboardTab}
        doLogout={doLogout}
        showPage={showPage}
        showToast={showToast}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <SuccessPage
        pageClass={pageClass}
        showPage={showPage}
        wishlistCount={wishlistCount}
        cartQuantity={cartQuantity}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <AdminPanel
        pageClass={pageClass}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        currentUser={currentUser}
        showToast={showToast}
        showPage={showPage}
        cartQuantity={cartQuantity}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        products={products}
        setProducts={setProducts}
        refreshProducts={loadProducts}
        currentProduct={currentProduct}
        setCurrentProduct={setCurrentProduct}
      />


      <div className={`toast${toast.visible ? ' show' : ''}`} id="toast">
        <span className="toast-icon">✓</span>
        <span id="toast-msg">{toast.message}</span>
      </div>
    </>
  );
}
