import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

const ProductDetail = ({ products, onAddToCart, phone }) => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState({ productId: '', image: '' });
  const product = useMemo(
    () => products.find((item) => item.id === id) || null,
    [id, products]
  );
  const similarProducts = useMemo(() => {
    if (!product) return [];

    return products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .sort((first, second) => {
        const firstMatchesBrand = first.subcategory === product.subcategory ? 0 : 1;
        const secondMatchesBrand = second.subcategory === product.subcategory ? 0 : 1;
        if (firstMatchesBrand !== secondMatchesBrand) return firstMatchesBrand - secondMatchesBrand;
        return Math.abs(Number(first.price) - Number(product.price)) - Math.abs(Number(second.price) - Number(product.price));
      })
      .slice(0, 4);
  }, [product, products]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!product) {
    return (
      <div className="page-shell container">
        <div className="empty-state-card">
          <h2>Product not found</h2>
          <p>That product is no longer listed. Browse the store to choose another option.</p>
          <Link to="/" className="btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const images = [product.image, ...(product.extraImages || [])].filter(Boolean);
  const selectedImage = activeImage.productId === id ? activeImage.image : '';
  const displayImage = images.includes(selectedImage) ? selectedImage : product.image;

  const handleWhatsApp = () => {
    const message = `Hello Eazy1teck, I would like to order ${product.name} for ${formatRwf(
      product.price
    )}.`;
    window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="page-shell container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to store
      </Link>

      <section className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-main-image">
            <img
              src={displayImage}
              alt={product.name}
              onError={(event) => applyProductImageFallback(event, product.category)}
            />
          </div>

          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={`detail-thumb ${displayImage === image ? 'active' : ''}`}
                  onClick={() => setActiveImage({ productId: id, image })}
                >
                  <img
                    src={image}
                    alt={product.name}
                    onError={(event) => applyProductImageFallback(event, product.category)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatRwf(product.price)}</div>
          <p className="detail-description">{product.description}</p>

          <div className="detail-meta-list">
            <div>
              <strong>Variant</strong>
              <span>{product.size}</span>
            </div>
            {product.ingredients && (
              <div>
                <strong>Build</strong>
                <span>{product.ingredients}</span>
              </div>
            )}
          </div>

          {product.benefits?.length > 0 && (
            <ul className="feature-list">
              {product.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          )}

          <div className="detail-actions">
            <button type="button" className="btn-primary" onClick={() => onAddToCart(product)}>
              <ShoppingBag size={18} />
              Add to cart
            </button>
            <button type="button" className="btn-accent" onClick={handleWhatsApp}>
              <MessageSquare size={18} />
              WhatsApp order
            </button>
          </div>
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="detail-similar" aria-labelledby="similar-products-title">
          <div className="detail-similar-head">
            <div>
              <span className="eyebrow">More options for you</span>
              <h2 id="similar-products-title">You may also like these {product.category === 'Smartphones' ? 'phones' : 'products'}</h2>
            </div>
            <p>Compare similar choices by brand, features and RWF price.</p>
          </div>

          <div className="detail-similar-grid">
            {similarProducts.map((item) => (
              <article key={item.id} className="detail-similar-card">
                <Link to={`/product/${item.id}`} className="detail-similar-image">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(event) => applyProductImageFallback(event, item.category)}
                  />
                  {item.badge && <span>{item.badge}</span>}
                </Link>
                <div className="detail-similar-copy">
                  <small>{item.subcategory || item.category}</small>
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p>{item.size}</p>
                  <div>
                    <strong>{formatRwf(item.price)}</strong>
                    <button type="button" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name} to cart`}>
                      <ShoppingBag size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
