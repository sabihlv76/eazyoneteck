import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { applyProductImageFallback } from '../lib/productImageFallbacks';
import { collectionGroups, formatRwf } from '../lib/collections';
import heroShoppingImage from '../assets/hero-speakers.webp';

// Home is deliberately short: the hero, then straight into the products.
// The store story (collections showcase, lifestyle, recently added) lives on /about.
const Home = ({
  products,
  wishlist,
  searchQuery,
  selectedCategory,
  featuredProductId,
  heroImage,
  onAddToCart,
  onCategoryChange,
  onSearchChange,
  onToggleWishlist,
}) => {
  const catalogRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Links from other pages (e.g. "Shop phones" on /about) ask us to open on the
  // catalogue; scroll there once, then drop the flag so a refresh stays at the top.
  useEffect(() => {
    if (location.state?.scrollTo !== 'shop') {
      return;
    }
    window.requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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

  // The admin can pin the hero product in Store settings; without a pin (or if
  // the pinned product was deleted) fall back to the newest phone with an image.
  const heroProduct =
    products.find((product) => product.id === featuredProductId && product.image) ||
    products.find((product) => product.category === 'Smartphones' && product.image) ||
    products.find((product) => product.image) ||
    products[0] ||
    null;

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
                    src={heroImage || heroProduct.image}
                    alt={heroProduct.name}
                    className={heroImage ? 'commerce-hero-static-img' : undefined}
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
