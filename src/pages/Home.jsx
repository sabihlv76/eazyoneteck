import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import customerShoppingImage from '../assets/ChatGPT Image Jul 2, 2026, 11_00_01 AM.png';
import loadingProductsImage from '../assets/file_00000000aaac7243b7d3126725d610d0.png';
import winShoppingImage from '../assets/IMG-20260629-WA0101.jpg';
import { applyProductImageFallback } from '../lib/productImageFallbacks';

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=90',
    title: 'Mobile-first tech shopping that feels premium',
    eyebrow: 'Fresh arrivals',
    description:
      'Showcase flagship phones, laptops and accessories with a cleaner slider, stronger imagery and faster mobile browsing.',
    category: 'Smartphones',
    cta: 'Explore phones',
  },
  {
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=90',
    title: 'Trusted laptops and work devices for every day',
    eyebrow: 'Work smart',
    description:
      'Professional layouts, calm typography and clear actions make shopping easier from small screens up.',
    category: 'Computers',
    cta: 'See computers',
  },
  {
    image:
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1600&q=90',
    title: 'Accessories and audio that complete the setup',
    eyebrow: 'Top accessories',
    description:
      'Better visual hierarchy, practical product cards and a wishlist that actually works across the site.',
    category: 'Accessories',
    cta: 'Shop accessories',
  },
  {
    image:
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1600&q=90',
    title: 'Samsung phones ready for work and play',
    eyebrow: 'Galaxy deals',
    description:
      'Big screens, sharp cameras and reliable batteries presented with clear product actions.',
    category: 'Smartphones',
    cta: 'View smartphones',
  },
  {
    image:
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1600&q=90',
    title: 'MacBooks and PCs for serious daily performance',
    eyebrow: 'Laptop lineup',
    description:
      'Make the first impression feel fast, polished and trustworthy from the landing page.',
    category: 'Computers',
    cta: 'Shop laptops',
  },
  {
    image:
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=90',
    title: 'iPhones customers can compare at a glance',
    eyebrow: 'Apple favorites',
    description:
      'Premium phone visuals with simple navigation help buyers move from browsing to cart faster.',
    category: 'Smartphones',
    cta: 'Compare iPhones',
  },
  {
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=90',
    title: 'Clean desk setups start with the right computer',
    eyebrow: 'Setup essentials',
    description:
      'Strong laptop imagery gives the store a more complete tech-shop feel immediately.',
    category: 'Computers',
    cta: 'Browse computers',
  },
];

const showcaseGroups = [
  {
    id: 'phones',
    label: 'Phones',
    category: 'Smartphones',
    categories: ['Smartphones'],
    kicker: 'iPhones and Samsungs',
    description: 'Flagship and daily phones with quick cart, wishlist and detail actions.',
  },
  {
    id: 'accessories',
    label: 'Accessories',
    category: 'Accessories',
    categories: ['Accessories', 'Audio', 'Watches'],
    kicker: 'Cases, audio and watches',
    description: 'Useful add-ons grouped together for fast add-to-cart decisions.',
  },
  {
    id: 'machines',
    label: 'Machines',
    category: 'Computers',
    categories: ['Computers'],
    kicker: 'Laptops and work tools',
    description: 'Bigger devices and work machines shown with stronger branded visuals.',
  },
];

const quickCategories = showcaseGroups.map((group) => group.category);
const totalHeroSlides = heroSlides.length;
const categoryBackdrop =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

// promoImages: index 0 = loadingProductsImage, index 1 = winShoppingImage
const promoImages = [
  {
    image: loadingProductsImage,
    title: 'Something Special for You Is Loading',
    label: 'Premium gadgets',
  },
  {
    image: winShoppingImage,
    title: 'It is a win shopping with us',
    label: 'Eazy1teck shopping',
  },
];

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

function groupMatchesProduct(group, product) {
  return group.categories.includes(product.category);
}

function ProductCard({
  product,
  wishlist,
  onAddToCart,
  onToggleWishlist,
}) {
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
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
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
  );
}

function CategoryShowcase({
  group,
  products,
  wishlist,
  onAddToCart,
  onCategoryChange,
  onToggleWishlist,
}) {
  const railRef = useRef(null);

  const moveRail = useCallback((direction = 1) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const cardWidth = rail.querySelector('.product-card')?.getBoundingClientRect().width || 230;
    const gap = 14;
    const maxScrollLeft = rail.scrollWidth - rail.clientWidth;

    if (direction > 0 && rail.scrollLeft >= maxScrollLeft - 8) {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (direction < 0 && rail.scrollLeft <= 8) {
      rail.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      return;
    }

    rail.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (products.length < 2) {
      return undefined;
    }

    const intervalId = window.setInterval(() => moveRail(1), 3600);

    return () => window.clearInterval(intervalId);
  }, [moveRail, products.length]);

  return (
    <section className="category-showcase" aria-labelledby={`${group.id}-title`}>
      <div className="category-showcase-head">
        <div>
          <span className="eyebrow">{group.kicker}</span>
          <h3 id={`${group.id}-title`}>{group.label}</h3>
        </div>
        <button
          type="button"
          className="btn-outline category-view-button"
          onClick={() => onCategoryChange(group.category)}
        >
          View all
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="category-slider-wrap">
        <button
          type="button"
          className="category-slider-arrow category-slider-arrow-left"
          onClick={() => moveRail(-1)}
          aria-label={`Previous ${group.label} products`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="category-slider-rail" ref={railRef}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlist}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
        <button
          type="button"
          className="category-slider-arrow category-slider-arrow-right"
          onClick={() => moveRail(1)}
          aria-label={`Next ${group.label} products`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const shopRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % totalHeroSlides);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.subcategory || '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const visibleShowcaseGroups = useMemo(
    () =>
      showcaseGroups
        .map((group) => ({
          ...group,
          products: filteredProducts.filter((product) => groupMatchesProduct(group, product)),
        }))
        .filter(
          (group) =>
            group.products.length > 0 &&
            (selectedCategory === 'All' || group.categories.includes(selectedCategory))
        ),
    [filteredProducts, selectedCategory]
  );

  const rightRailProducts = filteredProducts.slice(0, 3);

  const goToShop = (category = selectedCategory) => {
    onCategoryChange(category);
    window.requestAnimationFrame(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const showPreviousSlide = () => {
    setCurrentSlide((current) => (current - 1 + totalHeroSlides) % totalHeroSlides);
  };

  const showNextSlide = () => {
    setCurrentSlide((current) => (current + 1) % totalHeroSlides);
  };

  return (
    <div className="home-page">
      <div className="desktop-store-frame container">
        {/* ===== LEFT SIDEBAR: now replaced with hamburger nav - handled in App.jsx header ===== */}
        {/* Left sidebar shows category nav as cards with a search bar on desktop */}
        <aside className="desktop-left-categories" aria-label="Product categories">
          {/* Compact search bar */}
          <div className="left-sidebar-search">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search…"
              aria-label="Search products"
            />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <span className="eyebrow">Categories</span>
          <h2>Browse</h2>
          <div className="desktop-category-list">
            <button
              type="button"
              className={selectedCategory === 'All' ? 'active' : ''}
              onClick={() => goToShop('All')}
            >
              <strong>All products</strong>
              <span>{products.length} items</span>
            </button>
            {showcaseGroups.map((group) => (
              <LeftCategoryDropdown
                key={group.id}
                group={group}
                products={products}
                selectedCategory={selectedCategory}
                onSelect={goToShop}
              />
            ))}
          </div>

          {/* Desktop-only: girls shopping image below navigation */}
          <div className="left-sidebar-promo-image">
            <img src={customerShoppingImage} alt="Girls shopping at Eazy1teck" />
          </div>
        </aside>

        <div className="store-center-pane">
          <section className="home-hero">
            <div className="hero-slider-card">
              {heroSlides.map((slide, index) => (
                <article
                  key={slide.title}
                  className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img src={slide.image} alt={slide.title} className="hero-slide-image" />
                  <div className="hero-slide-overlay" />
                  <div className="hero-slide-content">
                    <span className="eyebrow">{slide.eyebrow}</span>
                    <h1>{slide.title}</h1>
                    <p>{slide.description}</p>
                    <button
                      type="button"
                      className="btn-accent"
                      onClick={() => goToShop(slide.category)}
                    >
                      {slide.cta}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}

              <div className="hero-slider-controls">
                <button type="button" onClick={showPreviousSlide} aria-label="Previous slide">
                  <ChevronLeft size={18} />
                </button>
                <span>{currentSlide + 1} / {totalHeroSlides}</span>
                <button type="button" onClick={showNextSlide} aria-label="Next slide">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="hero-dots">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    className={index === currentSlide ? 'active' : ''}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick browse panel moved here — below hero slider on mobile, beside it on desktop */}
            <aside className="hero-side-panel">
              <div
                className="hero-panel-card"
                style={{ '--category-bg': `url("${categoryBackdrop}")` }}
              >
                <span className="eyebrow">Categories</span>
                <h2>Quick browse</h2>
                <div className="category-quick-grid">
                  {showcaseGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      className="category-quick-card"
                      onClick={() => goToShop(group.category)}
                    >
                      <strong>{group.label}</strong>
                      <span>Open collection</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          {/* Promo strip: replaced girls image with loadingProductsImage */}
          <section className="promo-strip">
            <article className="promo-card promo-card-featured">
              <img
                src={loadingProductsImage}
                alt="Premium gadgets loading"
              />
              <div className="promo-copy">
                <div className="promo-marquee-track">
                  <div className="promo-marquee-set">
                    <span className="eyebrow">Polished storefront</span>
                    <h3>Cleaner navigation, stronger visuals, faster shopping flow</h3>
                  </div>
                  <div className="promo-marquee-set" aria-hidden="true">
                    <span className="eyebrow">Polished storefront</span>
                    <h3>Cleaner navigation, stronger visuals, faster shopping flow</h3>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section id="shop" ref={shopRef} className="page-section">
            <div className="section-head">
              <div>
                <span className="eyebrow">Shop catalog</span>
                <h2>{selectedCategory === 'All' ? 'Shop by category' : selectedCategory}</h2>
              </div>
              <div className="filter-chips">
                {['All', ...quickCategories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => onCategoryChange(category)}
                  >
                    {category === 'Smartphones'
                      ? 'Phones'
                      : category === 'Computers'
                        ? 'Machines'
                        : category}
                  </button>
                ))}
              </div>
            </div>

            {searchQuery && (
              <p className="results-caption">
                {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} for
                {' '}
                <strong>{searchQuery}</strong>
              </p>
            )}

            {visibleShowcaseGroups.length === 0 ? (
              <div className="empty-state-card">
                <h3>No products matched this search</h3>
                <p>Try another keyword or switch to a different category.</p>
                <button type="button" className="btn-outline" onClick={() => onSearchChange('')}>
                  Clear search
                </button>
              </div>
            ) : (
              <div className="category-showcase-stack">
                {visibleShowcaseGroups.map((group, index) => (
                  <>
                    <CategoryShowcase
                      key={group.id}
                      group={group}
                      products={group.products}
                      wishlist={wishlist}
                      onAddToCart={onAddToCart}
                      onCategoryChange={onCategoryChange}
                      onToggleWishlist={onToggleWishlist}
                    />
                    {/* Mobile-only: insert winShoppingImage between accessories (index 1) and computers */}
                    {index === 1 && (
                      <div className="mobile-promo-image mobile-promo-image--between" key="mobile-promo-between">
                        <img src={winShoppingImage} alt="It is a win shopping with us" />
                      </div>
                    )}
                  </>
                ))}
              </div>
            )}

            {/* Mobile-only: bottom promo image before footer */}
            <div className="mobile-promo-image mobile-promo-image--bottom">
              <img src={customerShoppingImage} alt="Girls shopping at Eazy1teck" />
            </div>
          </section>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className="desktop-right-showcase" aria-label="Featured products">
          {/* Top image */}
          <article className="right-visual-card">
            <img src={promoImages[0].image} alt={promoImages[0].title} />
          </article>

          {/* On Display — placed between the two images */}
          <div className="right-product-stack">
            <span className="eyebrow">On display</span>
            {rightRailProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="right-product-card">
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(event) => applyProductImageFallback(event, product.category)}
                />
                <span>
                  <strong>{product.name}</strong>
                  <small>{formatRwf(product.price)}</small>
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom image */}
          <article className="right-visual-card">
            <img src={promoImages[1].image} alt={promoImages[1].title} />
          </article>
        </aside>
      </div>
    </div>
  );
};

/* ===== Left sidebar category item with dropdown showing products ===== */
function LeftCategoryDropdown({ group, products, selectedCategory, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const groupProducts = products.filter((p) => group.categories.includes(p.category)).slice(0, 5);
  const isActive = selectedCategory === group.category;

  return (
    <div className="left-cat-dropdown">
      <button
        type="button"
        className={`left-cat-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span className="left-cat-info">
          <strong>{group.label}</strong>
          <span>{products.filter((p) => group.categories.includes(p.category)).length} items</span>
        </span>
        <svg
          className={`left-cat-chevron ${isOpen ? 'open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="left-cat-menu">
          <button
            type="button"
            className="left-cat-menu-all"
            onClick={() => { onSelect(group.category); setIsOpen(false); }}
          >
            View all {group.label}
            <ArrowRight size={12} />
          </button>
          {groupProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="left-cat-menu-item"
              onClick={() => setIsOpen(false)}
            >
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => applyProductImageFallback(e, product.category)}
              />
              <span>
                <strong>{product.name}</strong>
                <small>{Number(product.price).toLocaleString()} RWF</small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
