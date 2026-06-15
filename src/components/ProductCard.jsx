import React from "react";

export default function ProductCard({ product, onShow, onAddCart, onToggleWishlist, inWishlist }) {
  const imageUrl = Array.isArray(product.images) && product.images.length ? product.images[0] : null;
  return (
    <div className="product-card" onClick={() => onShow(product.id)}>
      <div className="product-img">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <span>{product.emoji || '🛍️'}</span>
        )}
        <button
          className="wishlist-btn"
          onClick={e => { e.stopPropagation(); onToggleWishlist(product.id); }}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
        {product.tag ? <div className="badge-tag">{product.tag}</div> : null}
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-stars">
          <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
          <span className="review-count">({product.reviews})</span>
        </div>
        <div className="product-price-row">
          <div>
            <span className="price">₹{product.price.toLocaleString()}</span>
            {product.oldPrice ? <span className="price-old">₹{product.oldPrice.toLocaleString()}</span> : null}
          </div>
          <button
            className="add-cart-btn"
            onClick={e => { e.stopPropagation(); onAddCart(product.id); }}
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}
