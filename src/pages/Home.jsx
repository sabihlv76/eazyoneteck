import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const quickCategories = [
  'Smartphones',
  'Computers',
  'Audio',
  'Accessories',
  'Watches',
];

const totalHeroSlides = heroSlides.length;

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
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

  const featuredProducts = filteredProducts.slice(0, 12);

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
      <section className="home-hero container">
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

        <aside className="hero-side-panel">
          <div className="hero-panel-card">
            <span className="eyebrow">Categories</span>
            <h2>Quick browse</h2>
            <div className="category-quick-grid">
              {quickCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="category-quick-card"
                  onClick={() => goToShop(category)}
                >
                  <strong>{category}</strong>
                  <span>Open collection</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="container promo-strip">
        <article className="promo-card">
          <img
            src="https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&w=1200&q=80"
            alt="Tech showcase"
          />
          <div className="promo-copy">
            <span className="eyebrow">Polished mobile storefront</span>
            <h3>Cleaner navigation, stronger visuals, better conversion flow</h3>
          </div>
        </article>
        <article className="promo-card">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"
            alt="Smartwatch collection"
          />
          <div className="promo-copy">
            <span className="eyebrow">Always reachable</span>
            <h3>Wishlist, cart, phone contact and account actions now stay visible</h3>
          </div>
        </article>
      </section>

      <section id="shop" ref={shopRef} className="container page-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop catalog</span>
            <h2>{selectedCategory === 'All' ? 'Featured products' : selectedCategory}</h2>
          </div>
          <div className="filter-chips">
            {['All', ...quickCategories].map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => onCategoryChange(category)}
              >
                {category}
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

        {featuredProducts.length === 0 ? (
          <div className="empty-state-card">
            <h3>No products matched this search</h3>
            <p>Try another keyword or switch to a different category.</p>
            <button type="button" className="btn-outline" onClick={() => onSearchChange('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => {
              const inWishlist = wishlist.includes(product.id);
              return (
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
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
