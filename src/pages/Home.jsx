import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyProductImageFallback } from '../lib/productImageFallbacks';
import lifestyleShoppingImage from '../assets/IMG-20260629-WA0101.jpg';
import heroShoppingImage from '../assets/hero-speakers.webp';

const collectionGroups = [
  {
    id: 'phones',
    label: 'Phones',
    category: 'Smartphones',
    categories: ['Smartphones'],
    strapline: 'Choose the phone that fits you.',
    description: 'Compare Apple, Samsung and Android phones by storage, colour and RWF price.',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    category: 'Accessories',
    categories: ['Accessories', 'Audio', 'Watches'],
    strapline: 'Complete your setup.',
    description: 'Choose the audio, watches, chargers and protection you need for your devices.',
  },
  {
    id: 'machines',
    label: 'Machines',
    category: 'Computers',
    categories: ['Computers'],
    strapline: 'Get the right machine for your work.',
    description: 'Compare laptops for work, study and creative projects, then order the one you want.',
  },
];

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

function groupMatchesProduct(group, product) {
  return group.categories.includes(product.category);
}

function ProductCard({ product, wishlist, onAddToCart, onToggleWishlist }) {
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

const Home = ({
  products,
  wishlist,
  searchQuery,
  selectedCategory,
  onAddToCart,
  onCategoryChange,
  onSearchChange,
  onToggleWishlist,
}) => {
  const catalogRef = useRef(null);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedGroup = collectionGroups.find((group) => group.category === selectedCategory);

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedGroup
          ? selectedGroup.categories.includes(product.category)
          : product.category === selectedCategory);
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.subcategory || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const collections = useMemo(
    () =>
      collectionGroups.map((group) => {
        const items = products.filter((product) => groupMatchesProduct(group, product));
        return {
          ...group,
          count: items.length,
          leadProduct: items[0] || null,
          minPrice: items.length
            ? Math.min(...items.map((product) => Number(product.price) || 0))
            : 0,
        };
      }),
    [products]
  );

  const heroProduct =
    products.find((product) => product.category === 'Smartphones') || products[0] || null;
  const newArrivals = products.slice(0, 4);

  const showCollection = (category) => {
    onCategoryChange(category);
    window.requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <Helmet>
        <title>Eazy1teck | Electronics & Smartphones in Rwanda</title>
        <meta name="description" content="Shop premium smartphones, laptops, watches, and accessories in Rwanda. Browse and order on WhatsApp." />
        <link rel="canonical" href="https://eazy1teck.com/" />
      </Helmet>
      <div className="home-page reference-home">
      {heroProduct && (
        <section className="commerce-hero">
          <div className="container commerce-hero-layout">
            <div className="commerce-hero-shopping">
              <img src={heroShoppingImage} alt="Shopping for tech products" />
            </div>

            <div className="commerce-hero-right">
              <Link to={`/product/${heroProduct.id}`} className="commerce-hero-product">
                <div className="commerce-hero-image">
                  <img
                    src={heroProduct.image}
                    alt={heroProduct.name}
                    onError={(event) => applyProductImageFallback(event, heroProduct.category)}
                  />
                </div>
                <div className="commerce-hero-product-copy">
                  <span>{heroProduct.badge || 'Featured now'}</span>
                  <strong>{heroProduct.name}</strong>
                  <b>{formatRwf(heroProduct.price)}</b>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="container trust-bar-wrap">
        <section className="trust-bar" aria-label="Why shop with Eazy1teck">
          <article>
            <BadgeCheck aria-hidden="true" />
            <div><strong>Buy with confidence</strong><span>See real products with clear RWF prices</span></div>
          </article>
          <article>
            <ShieldCheck aria-hidden="true" />
            <div><strong>Ask us directly</strong><span>Get answers about products, delivery and pickup</span></div>
          </article>
          <article>
            <MapPin aria-hidden="true" />
            <div><strong>Pick up in Kigali</strong><span>Collect your order at Makuza Peace Plaza</span></div>
          </article>
        </section>
      </div>

      <section className="collection-stage" aria-labelledby="collection-stage-title">
        <div className="container">
          <div className="collection-stage-heading">
            <p>Start with what you need</p>
            <h2 id="collection-stage-title">Choose your next device.</h2>
          </div>

          <div className="collection-feature-list">
            {collections.map((group, index) => (
              <article
                key={group.id}
                className={`collection-feature${index % 2 ? ' collection-feature-reverse' : ''}`}
              >
                <div className="collection-feature-media">
                  {group.leadProduct && (
                    <img
                      src={group.leadProduct.image}
                      alt={group.leadProduct.name}
                      onError={(event) => applyProductImageFallback(event, group.leadProduct.category)}
                    />
                  )}
                </div>
                <div className="collection-feature-copy">
                  <span>
                    {group.count} product{group.count === 1 ? '' : 's'} · From {formatRwf(group.minPrice)}
                  </span>
                  <h3>{group.label}</h3>
                  <strong>{group.strapline}</strong>
                  <p>{group.description}</p>
                  <button type="button" onClick={() => showCollection(group.category)}>
                    Shop {group.label.toLowerCase()}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="store-lifestyle" aria-labelledby="store-lifestyle-title">
        <div className="container store-lifestyle-shell">
          <div className="store-lifestyle-image">
            <img
              src={lifestyleShoppingImage}
              alt="Customer shopping for phones and audio products"
            />
            <span>Kigali, Rwanda</span>
          </div>
          <div className="store-lifestyle-copy">
            <p>Shop your way</p>
            <h2 id="store-lifestyle-title">See the price. Ask us anything. Choose what works for you.</h2>
            <span>
              Browse every product with its RWF price. Add what you want to your cart, or message us before you order.
            </span>
            <div className="store-lifestyle-points">
              <strong>See every price</strong>
              <strong>Ask before you buy</strong>
              <strong>Pick up in Kigali</strong>
            </div>
            <button type="button" onClick={() => showCollection('All')}>
              Browse all products
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <section className="new-arrivals-section" aria-labelledby="new-arrivals-title">
        <div className="container">
          <div className="retail-section-head">
            <div>
              <p>See what is new</p>
              <h2 id="new-arrivals-title">Recently added</h2>
            </div>
            <button type="button" onClick={() => showCollection('All')}>
              View all products
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="new-arrivals-grid">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="store-belief">
        <div className="container store-belief-inner">
          <p>Eazy1teck, Kigali</p>
          <h2>You should never have to guess what a device costs or how to get it.</h2>
          <span>
            See the product, check the RWF price, add it to your cart and send your order directly to our Kigali team.
          </span>
        </div>
      </section>

      <section id="shop" ref={catalogRef} className="catalog-section">
        <div className="container">
          <div className="retail-section-head catalog-heading">
            <div>
              <p>Everything in store</p>
              <h2>{selectedCategory === 'All' ? 'Choose from all products' : `Shop ${selectedCategory.toLowerCase()}`}</h2>
            </div>
            <div className="catalog-filter-chips" aria-label="Filter products">
              {['All', ...collectionGroups.map((group) => group.category)].map((category) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => onCategoryChange(category)}
                >
                  {category === 'Smartphones' ? 'Phones' : category === 'Computers' ? 'Machines' : category}
                </button>
              ))}
            </div>
          </div>

          {searchQuery && (
            <p className="results-caption">
              {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} for <strong>{searchQuery}</strong>
            </p>
          )}

          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-state">
              <h3>We could not find that product.</h3>
              <p>Try a product name or choose another category.</p>
              <button type="button" onClick={() => onSearchChange('')}>Show all products</button>
            </div>
          ) : (
            <>
              <div className="catalog-product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    wishlist={wishlist}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="catalog-load-more">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  >
                    Load more products
                  </button>
                  <span>
                    Showing {visibleProducts.length} of {filteredProducts.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
