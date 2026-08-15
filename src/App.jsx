import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  Home as HomeIcon,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import Terms from './pages/Terms';
import CartDrawer from './components/CartDrawer';
import WhatsAppWidget from './components/WhatsAppWidget';
import { products as defaultProducts } from './productsData';
import {
  ADMIN_SETTINGS_KEY,
  CART_KEY,
  PRODUCTS_KEY,
  USER_KEY,
  WISHLIST_KEY,
  readStorage,
  writeStorage,
} from './lib/localStore';
import {
  adminSignOut,
  createProduct,
  deleteProduct,
  fetchCurrentUser,
  fetchProducts,
  fetchSettings,
  resetProducts,
  saveAccount,
  signIn,
  signOut,
  signUp,
  updateProduct,
  updateSettings,
} from './lib/api';
import logoImg from './assets/logo.svg';
import './index.css';

const navCategories = [
  'Smartphones',
  'Accessories',
  'Computers',
];

const navCategoryLabels = {
  Smartphones: 'Phones',
  Accessories: 'Accessories',
  Computers: 'Machines',
};

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

function NavCategoryDropdown({ category, label, products, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const categoryProducts = products
    .filter((p) => {
      if (category === 'Accessories') return ['Accessories', 'Audio', 'Watches'].includes(p.category);
      return p.category === category;
    })
    .slice(0, 6);

  return (
    <div className="nav-cat-wrap" ref={ref}>
      <button
        type="button"
        className="nav-cat-trigger"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown size={13} className={isOpen ? 'nav-cat-chevron open' : 'nav-cat-chevron'} />
      </button>
      {isOpen && (
        <div className="nav-cat-dropdown">
          <button
            type="button"
            className="nav-cat-view-all"
            onClick={() => { onSelect(category); setIsOpen(false); }}
          >
            View all {label}
          </button>
          <div className="nav-cat-items">
            {categoryProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="nav-cat-item"
                onClick={() => setIsOpen(false)}
              >
                <img src={product.image} alt={product.name} />
                <span>
                  <strong>{product.name}</strong>
                  <small>{Number(product.price).toLocaleString()} RWF</small>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildProductId(name) {
  return `${slugify(name)}-${Date.now()}`;
}

function HeaderAction({
  label,
  count,
  to,
  onClick,
  icon: Icon,
}) {
  const content = (
    <>
      <span className="header-action-icon-wrap">
        <Icon size={18} />
        {typeof count === 'number' && count > 0 && (
          <span className="header-count-badge">{count}</span>
        )}
      </span>
      <span className="header-action-label">{label}</span>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `header-action-button${isActive ? ' active' : ''}`
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <button type="button" className="header-action-button" onClick={onClick}>
      {content}
    </button>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ['/signin', '/signup'].includes(location.pathname);
  const isAdminPage = location.pathname === '/e1t-secure-panel';
  const showStoreChrome = !isAuthPage && !isAdminPage;

  const [products, setProducts] = useState(() =>
    readStorage(PRODUCTS_KEY, defaultProducts)
  );
  const [cart, setCart] = useState(() => readStorage(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => readStorage(WISHLIST_KEY, []));
  const [user, setUser] = useState(() => readStorage(USER_KEY, null));
  const [adminSettings, setAdminSettings] = useState(() =>
    readStorage(ADMIN_SETTINGS_KEY, {})
  );
  const [dataError, setDataError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    writeStorage(PRODUCTS_KEY, products);
  }, [products]);

  useEffect(() => {
    writeStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(WISHLIST_KEY, wishlist);
  }, [wishlist]);

  useEffect(() => {
    writeStorage(USER_KEY, user);
  }, [user]);

  useEffect(() => {
    writeStorage(ADMIN_SETTINGS_KEY, adminSettings);
  }, [adminSettings]);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const [nextProducts, nextSettings, sessionUser] = await Promise.all([
          fetchProducts(),
          fetchSettings(),
          fetchCurrentUser(),
        ]);

        if (!isMounted) {
          return;
        }

        setProducts(nextProducts);
        setAdminSettings((current) => ({
          ...current,
          ...nextSettings,
        }));
        setUser(sessionUser);
        setDataError('');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDataError(error.message || 'We could not load the products. Check your connection and refresh the page.');
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let previousY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const hasScrolled = currentY > 20;
      const isMoving = Math.abs(currentY - previousY) > 6;

      if (!hasScrolled) {
        setShowMobileNav(false);
      } else if (isMoving) {
        setShowMobileNav(true);
      }

      previousY = currentY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const featuredWishlistItems = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist]
  );

  const goHomeAndFilter = (category = 'All') => {
    setSelectedCategory(category);
    if (location.pathname !== '/') {
      navigate('/');
      return;
    }

    window.requestAnimationFrame(() => {
      const target = document.getElementById('shop');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) => item.id === product.id && item.size === product.size
      );

      if (existingIndex >= 0) {
        return currentCart.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          image: product.image,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: product.size,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, size, quantity) => {
    if (quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter((item) => !(item.id === id && item.size === size))
      );
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (id, size) => {
    setCart((currentCart) =>
      currentCart.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(productId)
        ? currentWishlist.filter((id) => id !== productId)
        : [...currentWishlist, productId]
    );
  };

  const handleSignIn = async (payload) => {
    const nextUser = await signIn(payload);
    setUser(nextUser);
  };

  const handleSignUp = async (payload) => {
    const nextUser = await signUp(payload);
    setUser(nextUser);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  const handleAccountSave = async (payload) => {
    const nextUser = await saveAccount(payload);
    setUser(nextUser);
  };

  const handleAdminSettingsSave = async (nextSettings) => {
    const savedSettings = await updateSettings(nextSettings);
    setAdminSettings(savedSettings);
  };

  const handleSaveProduct = async (productPayload, editingId) => {
    const payload = editingId
      ? productPayload
      : {
          id: buildProductId(productPayload.name),
          ...productPayload,
        };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }

    const nextProducts = await fetchProducts();
    setProducts(nextProducts);
  };

  const handleDeleteProduct = async (productId) => {
    await deleteProduct(productId);
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId)
    );
    setWishlist((currentWishlist) =>
      currentWishlist.filter((id) => id !== productId)
    );
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const handleResetCatalog = async () => {
    const nextProducts = await resetProducts();
    setProducts(nextProducts);
  };

  const handleAdminAuthExpired = async () => {
    await adminSignOut().catch(() => {});
  };

  return (
    <>
      {showStoreChrome && (
        <header className="site-header">
          <div className="store-announcement">
            <span>Kigali pickup</span>
            <strong>See the price. Choose your product. Order directly.</strong>
          </div>
          <div className="container site-header-shell">
            <div className="site-header-top">
              <Link to="/" className="brand-lockup" onClick={() => goHomeAndFilter('All')}>
                <span className="brand-mark">
                  <img src={logoImg} alt="Eazy1teck" className="brand-logo" />
                </span>
                <span className="brand-copy">
                  <strong>Eazy1teck</strong>
                  <span>Phones, laptops and more in Kigali</span>
                </span>
              </Link>

              {/* Desktop nav links, inline in the single header bar */}
              <div className="site-nav-row" ref={hamburgerRef}>
                <nav className="site-nav-links">
                  <button type="button" onClick={() => goHomeAndFilter('All')}>
                    Home
                  </button>
                  <button type="button" onClick={() => goHomeAndFilter('All')}>
                    All products
                  </button>
                  {navCategories.map((category) => (
                    <NavCategoryDropdown
                      key={category}
                      category={category}
                      label={navCategoryLabels[category] || category}
                      products={products}
                      onSelect={goHomeAndFilter}
                    />
                  ))}
                </nav>
              </div>

              <div className="header-search">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => {
                    if (location.pathname !== '/') {
                      navigate('/');
                    }
                  }}
                  aria-label="Search products"
                  placeholder="What are you looking for?"
                />
                <Search size={18} aria-hidden="true" />
              </div>

              <div className="site-header-actions">
                <HeaderAction
                  label="Wishlist"
                  count={wishlist.length}
                  to="/wishlist"
                  icon={Heart}
                />
                <HeaderAction
                  label="Cart"
                  count={cartCount}
                  onClick={() => setIsCartOpen(true)}
                  icon={ShoppingBag}
                />
                <HeaderAction
                  label={user ? 'Account' : 'Sign in'}
                  to={user ? '/account' : '/signin'}
                  icon={User}
                />
              </div>
            </div>

            {/* Mobile hamburger menu */}
            <div className={`mobile-hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="mobile-hamburger-toggle"
                onClick={() => setIsHamburgerOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={isHamburgerOpen}
              >
                {isHamburgerOpen ? <X size={20} /> : <Menu size={20} />}
                <span>Categories</span>
              </button>
              {isHamburgerOpen && (
                <div className="mobile-hamburger-dropdown">
                  <button
                    type="button"
                    className="mobile-ham-item"
                    onClick={() => { goHomeAndFilter('All'); setIsHamburgerOpen(false); }}
                  >
                    All products
                  </button>
                  {navCategories.map((category) => (
                    <div key={category} className="mobile-ham-cat">
                      <button
                        type="button"
                        className="mobile-ham-cat-trigger"
                        onClick={() => setMobileCatOpen(mobileCatOpen === category ? null : category)}
                      >
                        <span>{navCategoryLabels[category] || category}</span>
                        <ChevronDown
                          size={14}
                          className={mobileCatOpen === category ? 'mobile-ham-chevron open' : 'mobile-ham-chevron'}
                        />
                      </button>
                      {mobileCatOpen === category && (
                        <div className="mobile-ham-sublist">
                          <button
                            type="button"
                            className="mobile-ham-sub-all"
                            onClick={() => { goHomeAndFilter(category); setIsHamburgerOpen(false); }}
                          >
                            View all {navCategoryLabels[category]}
                          </button>
                          {products
                            .filter((p) => {
                              if (category === 'Accessories') return ['Accessories', 'Audio', 'Watches'].includes(p.category);
                              return p.category === category;
                            })
                            .slice(0, 5)
                            .map((product) => (
                              <NavLink
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="mobile-ham-product"
                                onClick={() => setIsHamburgerOpen(false)}
                              >
                                <img src={product.image} alt={product.name} />
                                <span>{product.name}</span>
                              </NavLink>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {showStoreChrome && (
        <a className="call-fab" href={`tel:${adminSettings.phone}`} aria-label="Call Eazy1teck">
          <Phone size={20} />
        </a>
      )}

      {showStoreChrome && (
        <nav className={`mobile-bottom-nav${showMobileNav ? ' visible' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Home"
          >
            <HomeIcon size={20} />
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="bottom-nav-count">{wishlist.length}</span>
            )}
          </NavLink>
          <button
            type="button"
            className="bottom-nav-item"
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="bottom-nav-count">{cartCount}</span>}
          </button>
          <NavLink
            to={user ? '/account' : '/signin'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label="Account"
          >
            <User size={20} />
          </NavLink>
        </nav>
      )}

      <main className="site-main">
        {dataError && showStoreChrome && (
          <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="status-banner">{dataError}</div>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                products={products}
                wishlist={wishlist}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                featuredProductId={adminSettings.featuredProductId}
                heroImage={adminSettings.heroImage}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
                onCategoryChange={setSelectedCategory}
                onSearchChange={setSearchQuery}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetail
                products={products}
                onAddToCart={handleAddToCart}
                phone={adminSettings.phone}
              />
            }
          />
          <Route
            path="/wishlist"
            element={
              <WishlistPage
                products={featuredWishlistItems}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlist}
              />
            }
          />
          <Route
            path="/account"
            element={
              <AccountPage
                key={user?.email || 'guest'}
                user={user}
                onSave={handleAccountSave}
                onSignOut={handleSignOut}
              />
            }
          />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route
            path="/e1t-secure-panel"
            element={
              <Admin
                adminSettings={adminSettings}
                onAdminAuthExpired={handleAdminAuthExpired}
                onDeleteProduct={handleDeleteProduct}
                onResetCatalog={handleResetCatalog}
                onSaveAdminSettings={handleAdminSettingsSave}
                onSaveProduct={handleSaveProduct}
                products={products}
              />
            }
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {showStoreChrome && (
        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-brand">
              <span className="brand-mark footer-brand-mark">
                <img src={logoImg} alt="Eazy1teck" className="brand-logo" />
              </span>
            </div>

            <div className="footer-privacy">
              <h4>Shop policies</h4>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/refund-policy">Refund Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
            </div>

            <div>
              <h4>Account</h4>
              <Link to={user ? '/account' : '/signin'}>My account</Link>
              <Link to="/wishlist">Wishlist</Link>
              <button type="button" onClick={() => setIsCartOpen(true)}>
                Cart
              </button>
            </div>

            <div>
              <h4>Talk to us</h4>
              <span>{adminSettings.storeName || 'Eazy1teck'}</span>
              <span>Visit us: Makuza Peace Plaza, KN 84 Street, Kigali</span>
              <a href={`tel:${adminSettings.phone}`}>{adminSettings.phone}</a>
              <a href={`mailto:${adminSettings.email}`}>{adminSettings.email}</a>
              <span>Pickup available in Kigali</span>
            </div>
          </div>
        </footer>
      )}

      {showStoreChrome && (
        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={handleRemoveItem}
          onUpdateQty={handleUpdateQty}
          phone={adminSettings.phone}
        />
      )}

      {showStoreChrome && (
        <WhatsAppWidget phone={adminSettings.phone} products={products} />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
