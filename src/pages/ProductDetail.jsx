import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const ProductDetail = ({ products, onAddToCart, phone }) => {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState({ productId: '', image: '' });
  const [selection, setSelection] = useState({ productId: '', color: '', storage: '' });
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

  // Variant-aware selection: colors switch the photo, storages switch the price.
  const colorOptions = (product.variants?.colors || []).filter((color) => color?.name && color?.image);
  const storageOptions = (product.variants?.storages || []).filter((storage) => storage?.label);
  const hasVariants = colorOptions.length > 0 || storageOptions.length > 0;
  const isSelectionCurrent = selection.productId === id;
  const selectedColor =
    (isSelectionCurrent && colorOptions.find((color) => color.name === selection.color)) ||
    colorOptions[0] ||
    null;
  const selectedStorage =
    (isSelectionCurrent && storageOptions.find((storage) => storage.label === selection.storage)) ||
    storageOptions[0] ||
    null;
  const currentPrice = selectedStorage?.price ?? product.price;

  const baseImage = selectedColor?.image || product.image;
  const images = [...new Set([baseImage, ...(product.extraImages || [])])].filter(Boolean);
  const selectedImage = activeImage.productId === id ? activeImage.image : '';
  const displayImage = images.includes(selectedImage) ? selectedImage : baseImage;

  const handleSelectColor = (name) => {
    setSelection({ productId: id, color: name, storage: selectedStorage?.label || '' });
    setActiveImage({ productId: '', image: '' });
  };

  const handleSelectStorage = (label) => {
    setSelection({ productId: id, color: selectedColor?.name || '', storage: label });
  };

  const handleAddToCart = () => {
    if (!hasVariants) {
      onAddToCart(product);
      return;
    }

    const variantLabel = [selectedStorage?.label, selectedColor?.name].filter(Boolean).join(' • ');
    onAddToCart({
      ...product,
      price: currentPrice,
      size: variantLabel || product.size,
      image: baseImage,
    });
  };

  const handleWhatsApp = () => {
    const chosenVariant = [selectedStorage?.label, selectedColor?.name].filter(Boolean).join(', ');
    const orderName = chosenVariant ? `${product.name} (${chosenVariant})` : product.name;
    const message = `Hello Eazy1teck, I would like to order ${orderName} for ${formatRwf(
      currentPrice
    )}.`;
    window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const imageForPreview = product.image || 'https://eazy1teck.com/og-image.jpg';
  const productUrl = `https://eazy1teck.com/product/${product.id}`;
  const videoEmbedUrl = getYoutubeEmbedUrl(product.videoUrl);

  return (
    <>
      <Helmet>
        <title>{product.name} | Eazy1teck</title>
        <meta name="description" content={`${product.name} - ${formatRwf(product.price)}. Browse premium electronics in Rwanda on Eazy1teck.`} />
        <link rel="canonical" href={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={`${product.name} | Eazy1teck`} />
        <meta property="og:description" content={`${product.name} - ${formatRwf(product.price)}`} />
        <meta property="og:image" content={imageForPreview} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${product.name} | Eazy1teck`} />
        <meta property="twitter:description" content={`${product.name} - ${formatRwf(product.price)}`} />
        <meta property="twitter:image" content={imageForPreview} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            'name': product.name,
            'image': imageForPreview,
            'description': `${product.name} - Available at Eazy1teck`,
            'brand': {
              '@type': 'Brand',
              'name': 'Eazy1teck'
            },
            'offers': {
              '@type': 'Offer',
              'url': productUrl,
              'priceCurrency': 'RWF',
              'price': currentPrice,
              'availability': 'https://schema.org/InStock'
            }
          })}
        </script>
      </Helmet>
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
          <div className="detail-price">
            {formatRwf(currentPrice)}
            {Number(product.oldPrice) > Number(currentPrice) && (
              <span className="detail-price-old">{formatRwf(product.oldPrice)}</span>
            )}
          </div>
          <p className="detail-description">{product.description}</p>

          {colorOptions.length > 0 && (
            <div className="variant-group">
              <span className="variant-label">
                Color: <strong>{selectedColor?.name}</strong>
              </span>
              <div className="variant-options">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`variant-chip ${selectedColor?.name === color.name ? 'active' : ''}`}
                    aria-pressed={selectedColor?.name === color.name}
                    onClick={() => handleSelectColor(color.name)}
                  >
                    {color.swatch && <span className="variant-dot" style={{ background: color.swatch }} />}
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {storageOptions.length > 0 && (
            <div className="variant-group">
              <span className="variant-label">
                Storage: <strong>{selectedStorage?.label}</strong>
              </span>
              <div className="variant-options">
                {storageOptions.map((storage) => (
                  <button
                    key={storage.label}
                    type="button"
                    className={`variant-chip ${selectedStorage?.label === storage.label ? 'active' : ''}`}
                    aria-pressed={selectedStorage?.label === storage.label}
                    onClick={() => handleSelectStorage(storage.label)}
                  >
                    {storage.label}
                    {Number(storage.price) > 0 && <small>{formatRwf(storage.price)}</small>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="detail-meta-list">
            {!hasVariants && (
              <div>
                <strong>Variant</strong>
                <span>{product.size}</span>
              </div>
            )}
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
            <button type="button" className="btn-primary" onClick={handleAddToCart}>
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

      {videoEmbedUrl && (
        <section className="detail-video">
          <span className="eyebrow">Video description</span>
          <div className="detail-video-frame">
            <iframe
              src={videoEmbedUrl}
              title={`${product.name} video description`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {product.videoCaption && <p className="detail-video-caption">{product.videoCaption}</p>}
        </section>
      )}

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
                    <span className="detail-similar-price">
                      <strong>{formatRwf(item.price)}</strong>
                      {Number(item.oldPrice) > Number(item.price) && (
                        <small className="price-old">{formatRwf(item.oldPrice)}</small>
                      )}
                    </span>
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
    </>
  );
};

export default ProductDetail;
