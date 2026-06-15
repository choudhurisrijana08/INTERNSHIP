import React from "react";
import Navbar from "./Navbar";

export default function CatalogPage({ pageClass, filteredProducts, catFilter, setCatFilter, priceMin, setPriceMin, priceMax, setPriceMax, ratingFilter, setRatingFilter, filterSale, setFilterSale, filterInStock, setFilterInStock, searchQuery, setSearchQuery, sortOption, setSortOption, resetFilters, renderProductCard, showPage, wishlistCount, cartQuantity, isLoggedIn, isAdmin, mobileOpen, setMobileOpen }) {
  return (
    <div className={pageClass('catalog')}>
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
      <div className="section-banner">
        <h2>Shop <span>All Products</span></h2>
        <p>Discover our curated collection of premium items</p>
      </div>
      <div className="catalog-layout">
        <aside className="filter-sidebar">
          <div className="filter-title">Filters</div>
          <div className="filter-group">
            <div className="filter-group-title">Category</div>
            {['all', 'Women', 'Men', 'Electronics', 'Beauty', 'Home', 'Sports', 'Books', 'Jewelry'].map(value => (
              <label key={value} className="filter-option">
                <input type="radio" name="cat" value={value} checked={catFilter === value} onChange={() => setCatFilter(value)} />

                {value === 'all' ? 'All Categories' : value === 'Home' ? 'Home & Living' : value === 'Women' ? "Women's Fashion" : value === 'Men' ? "Men's Fashion" : value}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <div className="filter-group-title">Price Range (₹)</div>
            <div className="price-range">
              <input type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
              <input type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
            </div>
          </div>
          <div className="filter-group">
            <div className="filter-group-title">Rating</div>
                <label className="filter-option"><input type="radio" name="rating" value="0" checked={ratingFilter === '0'} onChange={() => setRatingFilter('0')} /> All Ratings</label>

            <label className="filter-option"><input type="radio" name="rating" value="4" checked={ratingFilter === '4'} onChange={() => setRatingFilter('4')} /> ⭐⭐⭐⭐ & above</label>
            <label className="filter-option"><input type="radio" name="rating" value="3" checked={ratingFilter === '3'} onChange={() => setRatingFilter('3')} /> ⭐⭐⭐ & above</label>
          </div>
          <div className="filter-group">
            <div className="filter-group-title">Availability</div>
            <label className="filter-option"><input type="checkbox" checked={filterSale} onChange={e => setFilterSale(e.target.checked)} /> On Sale</label>
            <label className="filter-option"><input type="checkbox" checked={filterInStock} onChange={e => setFilterInStock(e.target.checked)} /> In Stock</label>
          </div>
          <button className="btn btn-outline" style={{ color: 'var(--black)', borderColor: '#DDD', width: '100%', marginTop: '0.5rem' }} onClick={resetFilters}>Clear Filters</button>
        </aside>

        <div className="catalog-main">
          <div className="catalog-header">
            <h2 id="catalog-title">All Products <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--gray2)' }} id="product-count">({filteredProducts.length} items)</span></h2>
            <div className="catalog-controls">
              <div className="search-bar">
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button onClick={() => null}>🔍</button>
              </div>
              <select className="sort-select" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
          <div className="products-grid" id="catalog-products">
            {filteredProducts.length ? filteredProducts.map(renderProductCard) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
