import { useMemo, useState } from 'react';
import {
  Check,
  ImagePlus,
  KeyRound,
  Laptop,
  LayoutGrid,
  ListPlus,
  LogOut,
  Mail,
  Palette,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Speaker,
  Tags,
  Trash2,
  Watch,
} from 'lucide-react';
import { adminSignIn, getAdminSessionToken } from '../lib/api';
import logoImg from '../assets/logo.svg';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const initialForm = {
  name: '',
  price: '',
  size: '',
  badge: '',
  color: '',
  image: '',
  extraImages: [],
  description: '',
  benefits: '',
  ingredients: '',
  instructions: '',
};

const ADMIN_CATEGORY_KEY = 'e1t_admin_categories';

const defaultAdminCategories = [
  {
    id: 'iphones',
    label: 'iPhones',
    category: 'Smartphones',
    subcategory: 'Apple',
    icon: Smartphone,
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium', 'Deep Purple', 'Gold'],
  },
  {
    id: 'androids',
    label: 'Androids',
    category: 'Smartphones',
    subcategory: 'Android',
    icon: Smartphone,
    colors: ['Phantom Black', 'Titanium Gray', 'Cream', 'Violet', 'Green', 'Graphite'],
  },
  {
    id: 'smartwatches',
    label: 'Smartwatches',
    category: 'Watches',
    subcategory: 'Smart Watches',
    icon: Watch,
    colors: ['Midnight', 'Starlight', 'Silver', 'Pink', 'Graphite', 'Titanium'],
  },
  {
    id: 'laptops',
    label: 'Laptops',
    category: 'Computers',
    subcategory: 'Laptops',
    icon: Laptop,
    colors: ['Space Black', 'Silver', 'Space Gray', 'Midnight', 'Starlight'],
  },
  {
    id: 'speakers',
    label: 'Speakers',
    category: 'Audio',
    subcategory: 'Speakers',
    icon: Speaker,
    colors: ['Black', 'Blue', 'Red', 'Teal', 'White'],
  },
];

const badgeOptions = ['New Arrival', 'Best Seller', 'Hot Deal', 'Top Rated', 'Great Value', 'Trending', 'Genuine'];

function readAdminCategories() {
  try {
    const saved = window.localStorage.getItem(ADMIN_CATEGORY_KEY);
    return saved ? JSON.parse(saved) : defaultAdminCategories;
  } catch {
    return defaultAdminCategories;
  }
}

function saveAdminCategories(categories) {
  try {
    window.localStorage.setItem(ADMIN_CATEGORY_KEY, JSON.stringify(categories));
  } catch (error) {
    console.warn('Unable to save admin categories', error);
  }
}

function getCategoryForProduct(product, categories) {
  return categories.find((item) => {
    const sameCategory = product.category === item.category;
    const productSubcategory = (product.subcategory || '').toLowerCase();
    const itemSubcategory = item.subcategory.toLowerCase();

    if (!sameCategory) {
      return false;
    }

    if (item.id === 'iphones') {
      return productSubcategory.includes('apple') || product.name.toLowerCase().includes('iphone');
    }

    if (item.id === 'androids') {
      return (
        product.category === 'Smartphones' &&
        !productSubcategory.includes('apple') &&
        !product.name.toLowerCase().includes('iphone')
      );
    }

    return productSubcategory.includes(itemSubcategory) || product.category === item.category;
  });
}

const Admin = ({
  adminSettings,
  onAdminAuthExpired,
  onDeleteProduct,
  onRefreshProducts,
  onResetCatalog,
  onSaveAdminSettings,
  onSaveProduct,
  products,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminSessionToken()));
  const [credentials, setCredentials] = useState({ email: '', pin: '' });
  const [authError, setAuthError] = useState('');
  const [adminCategories, setAdminCategories] = useState(readAdminCategories);
  const [activeCategoryId, setActiveCategoryId] = useState('iphones');
  const [activeView, setActiveView] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState('');
  const [settingsForm, setSettingsForm] = useState(adminSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhoneDropupOpen, setIsPhoneDropupOpen] = useState(false);

  const activeCategory = activeCategoryId === 'all'
    ? { id: 'all', label: 'All Devices', category: 'Catalog', colors: [] }
    : adminCategories.find((category) => category.id === activeCategoryId) || adminCategories[0];

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      const productAdminCategory = getCategoryForProduct(product, adminCategories);
      const isActiveCategory = activeCategoryId === 'all' ? true : productAdminCategory?.id === activeCategoryId;
      const matchesQuery =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.subcategory || '').toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return isActiveCategory && matchesQuery;
    });
  }, [activeCategoryId, adminCategories, products, searchQuery]);

  const showStatus = (message) => {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(''), 2800);
  };

  const updateAuthField = (field) => (event) => {
    setCredentials((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateFormField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateSettingsField = (field) => (event) => {
    setSettingsForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');

    try {
      const settings = await adminSignIn(credentials);
      setSettingsForm(settings);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.message || 'Incorrect email or PIN.');
    }
  };

  const handleLogout = async () => {
    await onAdminAuthExpired();
    setIsAuthenticated(false);
  };

  const resetProductForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const openEditModal = (product) => {
    const nextCategory = getCategoryForProduct(product, adminCategories) || activeCategory;
    setActiveCategoryId(nextCategory.id);
    setActiveView('products');
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      price: String(product.price || ''),
      size: product.size || '',
      badge: product.badge || '',
      color: product.color || '',
      image: product.image || '',
      extraImages: product.extraImages || product.extra_images || [],
      description: product.description || '',
      benefits: (product.benefits || []).join('\n'),
      ingredients: product.ingredients || '',
      instructions: product.instructions || '',
    });
  };

  const selectCategory = (categoryId) => {
    setActiveCategoryId(categoryId);
    setActiveView('products');
    resetProductForm();
  };

  const handlePrimaryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const image = await fileToDataUrl(file);
    setForm((current) => ({ ...current, image }));
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const extraImages = await Promise.all(files.map(fileToDataUrl));
    setForm((current) => ({ ...current, extraImages }));
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    setIsSaving(true);

    try {
      const colorValue = form.color.trim();
      const description =
        form.description.trim() ||
        `${form.name.trim()} is available at ${settingsForm.storeName || 'Eazy1teck'}. Contact the store for current stock and booking.`;

      await onSaveProduct(
        {
          badge: form.badge.trim(),
          benefits: form.benefits
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          category: activeCategory.category,
          color: colorValue,
          description,
          extraImages: form.extraImages,
          image: form.image,
          ingredients: form.ingredients.trim() || colorValue,
          instructions: form.instructions.trim() || 'Confirm color and storage before booking.',
          name: form.name.trim(),
          price: Number(form.price),
          size: form.size.trim(),
          subcategory: activeCategory.subcategory,
        },
        editingId
      );

      setForm(initialForm);
      setEditingId(null);
      showStatus(editingId ? 'Product updated successfully.' : 'Product created successfully.');
    } catch (error) {
      showStatus(error.message || 'Unable to save this product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSaveAdminSettings(settingsForm);
      showStatus('Admin account settings updated.');
    } catch (error) {
      showStatus(error.message || 'Unable to save admin settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    const label = window.prompt('Category name');
    if (!label?.trim()) {
      return;
    }

    const id = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (adminCategories.some((category) => category.id === id)) {
      showStatus('That category already exists.');
      return;
    }

    const nextCategory = {
      id,
      label: label.trim(),
      category: 'Accessories',
      subcategory: label.trim(),
      icon: Tags,
      colors: ['Black', 'White', 'Silver', 'Blue'],
    };
    const nextCategories = [...adminCategories, nextCategory];
    setAdminCategories(nextCategories);
    saveAdminCategories(nextCategories);
    setActiveCategoryId(id);
    setActiveView('products');
    showStatus('Category added.');
  };

  const totalValue = filteredProducts.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const allProductCount = products.length;

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <span className="eyebrow">Protected access</span>
          <h1>Admin panel sign in</h1>
          <p>
            This secure page protects product management, account settings and mobile image uploads.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-email">Admin email</label>
              <input
                id="admin-email"
                type="email"
                value={credentials.email}
                onChange={updateAuthField('email')}
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-pin">PIN or password</label>
              <input
                id="admin-pin"
                type="password"
                value={credentials.pin}
                onChange={updateAuthField('pin')}
                placeholder="Enter your admin PIN"
                required
              />
            </div>

            {authError && <p className="form-error">{authError}</p>}

            <button type="submit" className="btn-primary full-width">
              Access admin panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderProductCard = (product) => (
    <article key={product.id} className="admin-product-card">
      <img src={product.image} alt={product.name} />
      <div className="admin-product-copy">
        <div>
          <h3>{product.name}</h3>
          <p>{product.subcategory || product.category}{product.color ? `, ${product.color}` : ''}</p>
        </div>
        <strong>{Number(product.price).toLocaleString()} RWF</strong>
      </div>
      <div className="admin-product-actions">
        <button type="button" className="btn-icon btn-icon-outline" onClick={() => openEditModal(product)} aria-label={`Edit ${product.name}`}>
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-primary danger"
          onClick={async () => {
            try {
              await onDeleteProduct(product.id);
              if (editingId === product.id) {
                resetProductForm();
              }
              showStatus('Product deleted.');
            } catch (error) {
              showStatus(error.message || 'Unable to delete the product.');
            }
          }}
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src={logoImg} alt="Eazy1teck" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <strong style={{ fontSize: '1.05rem' }}>{settingsForm.storeName || 'Eazy1teck'}</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Inventory desk</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-icon btn-icon-outline" onClick={() => setActiveView('settings')} aria-label="Settings">
            <Settings size={18} />
          </button>
          <button type="button" className="btn-icon btn-icon-outline" onClick={handleLogout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {statusMessage && <div className="status-banner success">{statusMessage}</div>}

      <div className="admin-workbench">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            <span>Categories</span>
            <button type="button" className="btn-icon btn-icon-outline" onClick={handleAddCategory} aria-label="Add category">
              <ListPlus size={16} />
            </button>
          </div>

          <nav className="admin-side-nav" aria-label="Product categories">
            {adminCategories.map((category) => {
              const Icon = category.icon || Tags;
              const count = products.filter(
                (product) => getCategoryForProduct(product, adminCategories)?.id === category.id
              ).length;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={activeView === 'products' && activeCategoryId === category.id ? 'active' : ''}
                  onClick={() => selectCategory(category.id)}
                >
                  <Icon size={18} />
                  <span>{category.label}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            className={`admin-settings-link${activeView === 'settings' ? ' active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button type="button" className="admin-sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Log out
          </button>
        </aside>

        <main className="admin-main-card">
          {activeView === 'settings' ? (
            <section className="admin-settings-panel">
              <div className="admin-section-head">
                <div>
                  <h1>Settings</h1>
                  <p>Keep the contact details and admin access simple.</p>
                </div>
              </div>

              <form className="admin-form-grid" onSubmit={handleSaveSettings}>
                <div className="form-group">
                  <label htmlFor="settings-store">Store name</label>
                  <input
                    id="settings-store"
                    type="text"
                    value={settingsForm.storeName || ''}
                    onChange={updateSettingsField('storeName')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="settings-email">Recovery email</label>
                  <div className="field-with-icon">
                    <Mail size={16} />
                    <input
                      id="settings-email"
                      type="email"
                      value={settingsForm.email}
                      onChange={updateSettingsField('email')}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="settings-phone">Business phone</label>
                  <div className="field-with-icon">
                    <Phone size={16} />
                    <input
                      id="settings-phone"
                      type="tel"
                      value={settingsForm.phone}
                      onChange={updateSettingsField('phone')}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="settings-pin">Admin PIN</label>
                  <div className="field-with-icon">
                    <KeyRound size={16} />
                    <input
                      id="settings-pin"
                      type="password"
                      value={settingsForm.pin}
                      onChange={updateSettingsField('pin')}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-accent admin-save-button">
                  <ShieldCheck size={18} />
                  {isSaving ? 'Saving...' : 'Save settings'}
                </button>
              </form>
            </section>
          ) : (
            <>
              <section className="admin-section-head">
                <div>
                  <h1>{activeCategory.label}</h1>
                  <p>Add stock, set the price, upload images and keep the shelf tidy.</p>
                </div>
                <div className="admin-stat-strip">
                  <span>{filteredProducts.length} shown</span>
                  <span>{allProductCount} total</span>
                  <span>{totalValue.toLocaleString()} RWF</span>
                </div>
              </section>

              <section className="admin-entry-grid">
                {activeCategoryId !== 'all' && (
                  <form className="admin-product-form" onSubmit={handleSaveProduct}>
                    <div className="admin-form-title">
                      <div>
                        <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
                        <p>{activeCategory.label} will appear in {activeCategory.category}.</p>
                      </div>
                      {editingId && (
                        <button type="button" className="btn-outline" onClick={resetProductForm}>
                          New item
                        </button>
                      )}
                    </div>

                  <div className="admin-form-grid">
                    <div className="form-group span-2">
                      <label htmlFor="product-name">Product name</label>
                      <input
                        id="product-name"
                        type="text"
                        value={form.name}
                        onChange={updateFormField('name')}
                        placeholder="iPhone 15 Pro Max 256GB"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-price">Price in RWF</label>
                      <input
                        id="product-price"
                        type="number"
                        value={form.price}
                        onChange={updateFormField('price')}
                        placeholder="1800000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-size">Size or version</label>
                      <input
                        id="product-size"
                        type="text"
                        value={form.size}
                        onChange={updateFormField('size')}
                        placeholder="256GB"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-badge">Tag</label>
                      <div className="field-with-icon">
                        <Tags size={16} />
                        <input
                          id="product-badge"
                          type="text"
                          value={form.badge}
                          onChange={updateFormField('badge')}
                          list="admin-badge-options"
                          placeholder="Best Seller"
                        />
                      </div>
                      <datalist id="admin-badge-options">
                        {badgeOptions.map((badge) => (
                          <option key={badge} value={badge} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-color">Color</label>
                      <div className="field-with-icon">
                        <Palette size={16} />
                        <input
                          id="product-color"
                          type="text"
                          value={form.color}
                          onChange={updateFormField('color')}
                          list="admin-color-options"
                          placeholder={activeCategory.colors[0] || 'Black'}
                        />
                      </div>
                      <datalist id="admin-color-options">
                        {activeCategory.colors.map((color) => (
                          <option key={color} value={color} />
                        ))}
                      </datalist>
                    </div>

                    <div className="color-swatch-row span-2">
                      {activeCategory.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={form.color === color ? 'active' : ''}
                          onClick={() => setForm((current) => ({ ...current, color }))}
                        >
                          {form.color === color && <Check size={13} />}
                          {color}
                        </button>
                      ))}
                    </div>

                    <div className="form-group span-2">
                      <label htmlFor="product-image">Images</label>
                      <div className="admin-upload-grid">
                        <label className="upload-field" htmlFor="product-image">
                          <ImagePlus size={18} />
                          <span>Main image</span>
                        </label>
                        <input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          onChange={handlePrimaryImageUpload}
                          className="hidden-input"
                        />

                        <label className="upload-field" htmlFor="product-gallery">
                          <ImagePlus size={18} />
                          <span>Gallery</span>
                        </label>
                        <input
                          id="product-gallery"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleExtraImagesUpload}
                          className="hidden-input"
                        />
                      </div>

                      {(form.image || form.extraImages.length > 0) && (
                        <div className="upload-preview-grid">
                          {form.image && <img src={form.image} alt="Primary preview" className="upload-preview" />}
                          {form.extraImages.map((image) => (
                            <img key={image} src={image} alt="Extra preview" className="upload-preview" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="form-group span-2">
                      <label htmlFor="product-description">Short note</label>
                      <textarea
                        id="product-description"
                        rows="3"
                        value={form.description}
                        onChange={updateFormField('description')}
                        placeholder="Optional customer-facing note"
                      />
                    </div>
                  </div>

                    <button type="submit" className="btn-accent admin-save-button">
                      <Plus size={18} />
                      {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Save product'}
                    </button>
                  </form>
                )}

                <section className="admin-list-panel" style={activeCategoryId === 'all' ? { gridColumn: '1 / -1' } : {}}>
                  <div className="admin-toolbar">
                    <div className="search-field">
                      <Search size={18} />
                      <input
                        type="search"
                        placeholder={`Search ${activeCategory.label.toLowerCase()}`}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-product-list">
                    {filteredProducts.length === 0 && (
                      <div className="admin-empty-state">
                        <strong>No products here yet</strong>
                        <span>Add the first {activeCategory.label.toLowerCase()} item with the form.</span>
                      </div>
                    )}

                    {activeCategoryId === 'all' ? (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                          {adminCategories.map(cat => {
                            const catProducts = filteredProducts.filter(p => getCategoryForProduct(p, adminCategories)?.id === cat.id);
                            if (catProducts.length === 0) return null;
                            return (
                              <a 
                                key={`nav-${cat.id}`} 
                                href={`#cat-${cat.id}`} 
                                style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.8rem', background: 'var(--surface-muted)', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}
                              >
                                {cat.label}
                              </a>
                            );
                          })}
                        </div>
                        {adminCategories.map(cat => {
                          const catProducts = filteredProducts.filter(p => getCategoryForProduct(p, adminCategories)?.id === cat.id);
                          if (catProducts.length === 0) return null;
                          return (
                            <div key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: '1.5rem', scrollMarginTop: '100px' }}>
                              <h3 style={{ marginBottom: '0.8rem', fontSize: '1rem', color: 'var(--gold-deep)' }}>{cat.label}</h3>
                              <div style={{ display: 'grid', gap: '0.8rem' }}>
                                {catProducts.map(renderProductCard)}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      filteredProducts.map(renderProductCard)
                    )}
                  </div>
                </section>
              </section>
            </>
          )}
        </main>
      </div>

      <nav className="admin-mobile-bottom-nav">
        <div className="bottom-nav-item">
          <button 
            type="button" 
            className={`bottom-nav-btn ${isPhoneDropupOpen ? 'active' : ''}`}
            onClick={() => setIsPhoneDropupOpen(!isPhoneDropupOpen)}
          >
            <Smartphone size={20} />
            <span>Phone</span>
          </button>
          {isPhoneDropupOpen && (
            <div className="admin-phone-dropup">
              {adminCategories.filter(c => ['iphones', 'androids', 'smartwatches'].includes(c.id)).map(cat => {
                const Icon = cat.icon || Tags;
                return (
                  <button 
                    key={cat.id} 
                    type="button" 
                    onClick={() => { selectCategory(cat.id); setIsPhoneDropupOpen(false); }}
                  >
                    <Icon size={16} />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <button type="button" className={`bottom-nav-btn ${activeCategoryId === 'laptops' ? 'active' : ''}`} onClick={() => { selectCategory('laptops'); setIsPhoneDropupOpen(false); }}>
          <Laptop size={20} />
          <span>PC</span>
        </button>
        <button type="button" className={`bottom-nav-btn ${activeCategoryId === 'speakers' ? 'active' : ''}`} onClick={() => { selectCategory('speakers'); setIsPhoneDropupOpen(false); }}>
          <Speaker size={20} />
          <span>Accessories</span>
        </button>
        <button type="button" className={`bottom-nav-btn ${activeCategoryId === 'all' ? 'active' : ''}`} onClick={() => { selectCategory('all'); setIsPhoneDropupOpen(false); }}>
          <LayoutGrid size={20} />
          <span>My Devices</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin;
