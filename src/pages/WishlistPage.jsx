import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

const WishlistPage = ({ products, onAddToCart, onToggleWishlist }) => {
  return (
    <div className="page-shell container">
      <section className="page-hero-card">
        <span className="eyebrow">Saved products</span>
        <h1>Your wishlist</h1>
        <p>
          Everything you love stays here so clients can come back quickly from
          mobile and continue shopping without searching again.
        </p>
      </section>

      {products.length === 0 ? (
        <section className="empty-state-card">
          <Heart size={34} />
          <h2>No wishlist items yet</h2>
          <p>Tap the heart on any product and it will appear here instantly.</p>
          <Link to="/" className="btn-accent">
            Continue shopping
          </Link>
        </section>
      ) : (
        <section className="product-grid page-section">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <div className="product-card-media">
                <Link to={`/product/${product.id}`} className="product-card-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(event) => applyProductImageFallback(event, product.category)}
                  />
                </Link>
                <button
                  type="button"
                  className="product-image-wishlist wishlisted"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
              <div className="product-card-body">
                <Link to={`/product/${product.id}`}>
                  <h3 className="product-card-title">{product.name}</h3>
                </Link>
                <p className="product-card-size">{product.size}</p>
                <div className="product-card-footer">
                  <div className="product-price">{formatRwf(product.price)}</div>
                  <div className="card-actions product-card-actions">
                    <Link
                      to={`/product/${product.id}`}
                      className="product-action-button product-view-button"
                      title="See product"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      type="button"
                      className="product-action-button product-cart-button"
                      onClick={() => onAddToCart(product)}
                      title="Add to cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default WishlistPage;
