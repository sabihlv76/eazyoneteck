import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';
import { formatRwf } from '../lib/collections';

export default function ProductCard({ product, wishlist, onAddToCart, onToggleWishlist }) {
  const inWishlist = wishlist.includes(product.id);

  return (
    <article className="product-card">
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
          className={`product-image-wishlist ${inWishlist ? 'wishlisted' : ''}`}
          onClick={() => onToggleWishlist(product.id)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={17} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        <p className="product-card-size">{product.size}</p>
        <div className="product-card-footer">
          <div className="product-price">
            {formatRwf(product.price)}
            {Number(product.oldPrice) > Number(product.price) && (
              <small className="price-old">{formatRwf(product.oldPrice)}</small>
            )}
          </div>
          <div className="product-card-actions">
            <Link
              to={`/product/${product.id}`}
              className="product-action-button product-view-button"
              aria-label={`View ${product.name}`}
            >
              <Eye size={16} />
            </Link>
            <button
              type="button"
              className="product-action-button product-cart-button"
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
