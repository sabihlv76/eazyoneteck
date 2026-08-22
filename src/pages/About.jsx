import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { applyProductImageFallback } from '../lib/productImageFallbacks';
import { collectionGroups, formatRwf, groupMatchesProduct } from '../lib/collections';
import lifestyleShoppingImage from '../assets/hero-shopping.webp';

// The store story: the showcase sections that used to sit under the home hero
// live here now, so the home page goes straight from the hero to the products.
const About = ({ products, wishlist, onAddToCart, onToggleWishlist, onCategoryChange }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const collections = useMemo(
    () =>
      collectionGroups.map((group) => {
        const items = products.filter((product) => groupMatchesProduct(group, product));
        return {
          ...group,
          count: items.length,
          leadProduct: items.find((product) => product.image) || items[0] || null,
          minPrice: items.length
            ? Math.min(...items.map((product) => Number(product.price) || 0))
            : 0,
        };
      }),
    [products]
  );

  const newArrivals = products.slice(0, 4);

  // Pick the collection, then land on the home catalogue already filtered.
  const showCollection = (category) => {
    onCategoryChange(category);
    navigate('/', { state: { scrollTo: 'shop' } });
  };

  return (
    <>
      <Helmet>
        <title>About Eazy1teck | Electronics store in Kigali</title>
        <meta
          name="description"
          content="Eazy1teck sells phones, laptops, watches and accessories in Kigali with clear RWF prices. See the price, ask us anything, pick up at Makuza Peace Plaza."
        />
        <link rel="canonical" href="https://eazy1teck.com/about" />
      </Helmet>
      <div className="about-page reference-home">
        <section className="about-hero" aria-labelledby="about-hero-title">
          <div className="container about-hero-inner">
            <p>About Eazy1teck</p>
            <h1 id="about-hero-title">Phones, laptops and accessories in Kigali — with the price in plain sight.</h1>
            <span>
              Eazy1teck is an electronics store in Kigali. Browse every product with its RWF price, ask us anything
              before you order, and collect your order at Makuza Peace Plaza.
            </span>
          </div>
        </section>

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
      </div>
    </>
  );
};

export default About;
