import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  ImagePlus,
  KeyRound,
  Laptop,
  LayoutGrid,
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
  Wrench,
} from 'lucide-react';
import { adminSignIn, getAdminSessionToken, uploadProductImage } from '../lib/api';
import logoImg from '../assets/logo.svg';
import adminLifestyleImage from '../assets/hero-shopping.webp';

const initialForm = {
  name: '',
  price: '',
  oldPrice: '',
  size: '',
  badge: '',
  color: '',
  image: '',
  extraImages: [],
  videoUrl: '',
  videoCaption: '',
  description: '',
  benefits: '',
  ingredients: '',
  instructions: '',
};

// Temporary read-only lock on the catalogue while a product issue is being fixed.
// Set to false and redeploy to give admins back add / edit / delete.
const MAINTENANCE_MODE = false;
const MAINTENANCE_TITLE = 'IHANGANE MUGIHE TURI GUKEMURA IKIBAZO';
const MAINTENANCE_BODY =
  'Kwongeramo no guhindura ibicuruzwa byahagaritswe by’agateganyo. Urashobora kureba ibicuruzwa byose ariko ntushobora kubihindura muri iki gihe.';

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

const builtInCategoryIds = defaultAdminCategories.map((category) => category.id);

function readAdminCategories() {
  try {
    const saved = window.localStorage.getItem(ADMIN_CATEGORY_KEY);
    if (!saved) {
      return defaultAdminCategories;
    }

    // Icons are React components, so JSON.stringify drops them. Re-attach by id.
    return JSON.parse(saved).map((category) => ({
      ...category,
      icon: defaultAdminCategories.find((item) => item.id === category.id)?.icon || Tags,
    }));
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

    // Built-in categories keep the broad match so loose subcategories (Earbuds,
    // Headphones) still land in a bucket. Custom categories match on their own
    // subcategory only, otherwise the first one would swallow the whole category.
    if (!builtInCategoryIds.includes(item.id)) {
      return productSubcategory.includes(itemSubcategory);
    }

    return productSubcategory.includes(itemSubcategory) || product.category === item.category;
  });
}

const Admin = ({
  adminSettings,
  onAdminAuthExpired,
  onDeleteProduct,
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
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isPhoneDropupOpen, setIsPhoneDropupOpen] = useState(false);
  const [isAccessoryDropupOpen, setIsAccessoryDropupOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMaintenanceNoticeOpen, setIsMaintenanceNoticeOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [colorFilter, setColorFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const activeCategory = activeCategoryId === 'all'
    ? { id: 'all', label: 'All Devices', category: 'Catalog', colors: [] }
    : adminCategories.find((category) => category.id === activeCategoryId) || adminCategories[0];

  const customCategories = adminCategories.filter(
    (category) => !builtInCategoryIds.includes(category.id)
  );

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

  const availableColors = useMemo(
    () => [...new Set(filteredProducts.map((product) => product.color).filter(Boolean))].sort(),
    [filteredProducts]
  );

  const organizedProducts = useMemo(() => {
    const nextProducts = colorFilter === 'all'
      ? [...filteredProducts]
      : filteredProducts.filter((product) => product.color === colorFilter);

    return nextProducts.sort((first, second) => {
      if (sortOption === 'price-asc') return Number(first.price) - Number(second.price);
      if (sortOption === 'price-desc') return Number(second.price) - Number(first.price);
      if (sortOption === 'name-desc') return second.name.localeCompare(first.name);
      return first.name.localeCompare(second.name);
    });
  }, [colorFilter, filteredProducts, sortOption]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(organizedProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = organizedProducts.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

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
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      size: product.size || '',
      badge: product.badge || '',
      color: product.color || '',
      image: product.image || '',
      extraImages: product.extraImages || product.extra_images || [],
      videoUrl: product.videoUrl || product.video_url || '',
      videoCaption: product.videoCaption || '',
      description: product.description || '',
      benefits: (product.benefits || []).join('\n'),
      ingredients: product.ingredients || '',
      instructions: product.instructions || '',
    });
    setIsEditorOpen(true);
  };

  const selectCategory = (categoryId) => {
    setActiveCategoryId(categoryId);
    setActiveView('products');
    resetProductForm();
    setIsEditorOpen(false);
    setColorFilter('all');
    setCurrentPage(1);
    setSelectedProductIds([]);
  };

  const handlePrimaryImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingImages(true);

    try {
      const image = await uploadProductImage(file);
      setForm((current) => ({ ...current, image }));
    } catch (error) {
      showStatus(error.message || 'The image upload failed. Try again.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    setIsUploadingImages(true);

    try {
      const extraImages = await Promise.all(files.map(uploadProductImage));
      setForm((current) => ({ ...current, extraImages }));
    } catch (error) {
      showStatus(error.message || 'The image upload failed. Try again.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    if (blockedByMaintenance()) {
      setIsEditorOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      const colorValue = form.color.trim();
      const description =
        form.description.trim() ||
        `Choose ${form.name.trim()} at ${settingsForm.storeName || 'Eazy1teck'}. Send us a message if you want help with color, configuration or delivery.`;

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
          instructions: form.instructions.trim() || 'Choose your color and storage, then add the product to your cart or order on WhatsApp.',
          name: form.name.trim(),
          price: Number(form.price),
          oldPrice: form.oldPrice.trim() ? Number(form.oldPrice) : null,
          size: form.size.trim(),
          subcategory: activeCategory.subcategory,
          videoUrl: form.videoUrl.trim(),
          videoCaption: form.videoCaption.trim(),
        },
        editingId
      );

      setForm(initialForm);
      setEditingId(null);
      setIsEditorOpen(false);
      showStatus(editingId ? 'Product updated successfully.' : 'Product created successfully.');
    } catch (error) {
      showStatus(error.message || 'Unable to save this product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();

    const wantsPinChange = pinForm.newPin.trim() || pinForm.confirmPin.trim() || pinForm.currentPin.trim();

    if (wantsPinChange) {
      if (!pinForm.currentPin.trim()) {
        showStatus('Enter your current PIN to change it.');
        return;
      }
      if (pinForm.newPin.trim().length < 8) {
        showStatus('The new PIN must be at least 8 characters long.');
        return;
      }
      if (pinForm.newPin.trim() !== pinForm.confirmPin.trim()) {
        showStatus('The new PIN and its confirmation do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const payload = wantsPinChange
        ? { ...settingsForm, currentPin: pinForm.currentPin.trim(), newPin: pinForm.newPin.trim() }
        : settingsForm;

      await onSaveAdminSettings(payload);
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      showStatus(wantsPinChange ? 'Settings saved and admin PIN changed.' : 'Admin account settings updated.');
    } catch (error) {
      showStatus(error.message || 'Unable to save admin settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePinField = (field) => (event) => {
    const { value } = event.target;
    setPinForm((current) => ({ ...current, [field]: value }));
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

  const toggleProductSelection = (productId) => {
    setSelectedProductIds((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  };

  // Returns true when the action was blocked, so callers can bail out early.
  const blockedByMaintenance = () => {
    if (!MAINTENANCE_MODE) {
      return false;
    }

    setIsMaintenanceNoticeOpen(true);
    return true;
  };

  const handleLoadCuratedCatalog = async () => {
    if (blockedByMaintenance()) {
      return;
    }

    setIsSaving(true);

    try {
      await onResetCatalog();
      showStatus('All 52 store products are loaded.');
    } catch (error) {
      showStatus(error.message || 'We could not load the store products. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePageSelection = () => {
    const pageIds = paginatedProducts.map((product) => product.id);
    const pageIsSelected = pageIds.length > 0 && pageIds.every((id) => selectedProductIds.includes(id));
    setSelectedProductIds((current) => pageIsSelected
      ? current.filter((id) => !pageIds.includes(id))
      : [...new Set([...current, ...pageIds])]);
  };

  const handleBulkDelete = async () => {
    if (blockedByMaintenance()) return;
    if (!selectedProductIds.length || !window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return;

    try {
      await Promise.all(selectedProductIds.map((productId) => onDeleteProduct(productId)));
      setSelectedProductIds([]);
      showStatus('Selected products deleted.');
    } catch (error) {
      showStatus(error.message || 'Unable to delete the selected products.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-page">
        <section className="admin-auth-story" aria-label="Eazy1teck inventory workspace">
          <img src={adminLifestyleImage} alt="Eazy1teck customers shopping for technology" />
          <div className="admin-auth-story-copy">
            <img src={logoImg} alt="" className="admin-auth-logo" />
            <span>Inventory workspace</span>
            <h1>Keep the shop current.</h1>
            <p>Products, prices and store details in one focused workspace.</p>
          </div>
        </section>

        <section className="admin-auth-card">
          <div className="admin-auth-heading">
            <span>Protected access</span>
            <h2>Welcome back</h2>
          </div>
          <p>
            Sign in with your administrator email and PIN to manage Eazy1teck.
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
              Enter inventory desk
            </button>
          </form>
        </section>
      </div>
    );
  }

  const renderProductCard = (product) => (
    <article key={product.id} className="admin-product-card">
      <label className="admin-row-check">
        <input
          type="checkbox"
          checked={selectedProductIds.includes(product.id)}
          onChange={() => toggleProductSelection(product.id)}
          aria-label={`Select ${product.name}`}
        />
      </label>
      <img src={product.image} alt={product.name} />
      <div className="admin-product-copy">
        <div>
          <h3>{product.name}</h3>
          <p>{product.subcategory || product.category}{product.color ? `, ${product.color}` : ''}</p>
          <span className="admin-stock-state"><Check size={11} /> Live in store</span>
        </div>
        <strong>{Number(product.price).toLocaleString()} RWF</strong>
      </div>
      <div className="admin-product-actions">
        <button type="button" className="btn-icon btn-icon-outline" onClick={() => { if (blockedByMaintenance()) return; openEditModal(product); }} aria-label={`Edit ${product.name}`}>
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="btn-icon btn-icon-primary danger"
          onClick={async () => {
            if (blockedByMaintenance()) return;
            try {
              await onDeleteProduct(product.id);
              if (editingId === product.id) {
                resetProductForm();
              }
              setSelectedProductIds((current) => current.filter((id) => id !== product.id));
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
        <div className="admin-brand-lockup">
          <span className="admin-brand-mark">
            <img src={logoImg} alt="Eazy1teck" />
          </span>
          <div>
            <strong>{settingsForm.storeName || 'Eazy1teck'}</strong>
            <span>Inventory studio</span>
          </div>
        </div>
        <div className="admin-topbar-context">
          <span>Store operations</span>
          <strong>Catalogue control</strong>
        </div>
        <div className="admin-topbar-actions">
          <span className="admin-session-badge"><ShieldCheck size={15} /> Secure session</span>
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
            <span>Navigation</span>
          </div>

          <nav className="admin-side-nav" aria-label="Product categories">

            {/* Phone group — hover flyout */}
            <div className="admin-phone-hover-group">
              <button
                type="button"
                className={['iphones','androids','smartwatches'].includes(activeCategoryId) && activeView === 'products' ? 'group-active' : ''}
                onClick={() => selectCategory('iphones')}
                aria-expanded="true"
              >
                <Smartphone size={18} />
                <span>Phone</span>
                <ChevronRight className="admin-phone-chevron" size={14} />
              </button>

              <div className="admin-phone-side-flyout">
                <div className="admin-phone-side-flyout-inner">
                  {adminCategories.filter(c => ['iphones', 'androids', 'smartwatches'].includes(c.id)).map(cat => {
                    const Icon = cat.icon || Tags;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={activeView === 'products' && activeCategoryId === cat.id ? 'active' : ''}
                        onClick={() => selectCategory(cat.id)}
                      >
                        <Icon size={16} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PC */}
            <button
              type="button"
              className={activeView === 'products' && activeCategoryId === 'laptops' ? 'active' : ''}
              onClick={() => selectCategory('laptops')}
            >
              <Laptop size={18} />
              <span>PC</span>
            </button>

            {/* Accessories */}
            <button
              type="button"
              className={activeView === 'products' && activeCategoryId === 'speakers' ? 'active' : ''}
              onClick={() => selectCategory('speakers')}
            >
              <Speaker size={18} />
              <span>Accessories</span>
            </button>

            {/* Categories added from the Add category button */}
            {customCategories.map((cat) => {
              const Icon = cat.icon || Tags;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={activeView === 'products' && activeCategoryId === cat.id ? 'active' : ''}
                  onClick={() => selectCategory(cat.id)}
                >
                  <Icon size={18} />
                  <span>{cat.label}</span>
                </button>
              );
            })}

            {/* My Devices — all products */}
            <button
              type="button"
              className={activeCategoryId === 'all' && activeView === 'products' ? 'active' : ''}
              onClick={() => selectCategory('all')}
            >
              <LayoutGrid size={18} />
              <span>My Devices</span>
              <small>{allProductCount}</small>
            </button>

            <button type="button" className="admin-add-category" onClick={handleAddCategory}>
              <Plus size={18} />
              <span>Add category</span>
            </button>

            <button
              type="button"
              className={activeView === 'settings' ? 'active' : ''}
              onClick={() => setActiveView('settings')}
            >
              <Settings size={18} />
              <span>Store settings</span>
            </button>

          </nav>
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
                  <label htmlFor="settings-featured">Hero featured product</label>
                  <select
                    id="settings-featured"
                    value={settingsForm.featuredProductId || ''}
                    onChange={updateSettingsField('featuredProductId')}
                  >
                    <option value="">Automatic (newest phone)</option>
                    {[...products]
                      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                  <small className="admin-pin-hint">
                    Shown in the big box next to the hero poster. Stays fixed until you change it here.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="settings-hero-image">Hero image URL (optional)</label>
                  <input
                    id="settings-hero-image"
                    type="url"
                    value={settingsForm.heroImage || ''}
                    onChange={updateSettingsField('heroImage')}
                    placeholder="https://... (leave empty to use the product photo)"
                  />
                  <small className="admin-pin-hint">
                    Overrides the featured product photo in the hero with this exact image.
                  </small>
                </div>

                <div className="form-group span-2">
                  <label>Change admin PIN (optional)</label>
                  <div className="admin-pin-change-grid">
                    <div className="field-with-icon">
                      <KeyRound size={16} />
                      <input
                        id="settings-current-pin"
                        type="password"
                        value={pinForm.currentPin}
                        onChange={updatePinField('currentPin')}
                        placeholder="Current PIN"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="field-with-icon">
                      <KeyRound size={16} />
                      <input
                        id="settings-new-pin"
                        type="password"
                        value={pinForm.newPin}
                        onChange={updatePinField('newPin')}
                        placeholder="New PIN (min 8 characters)"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="field-with-icon">
                      <KeyRound size={16} />
                      <input
                        id="settings-confirm-pin"
                        type="password"
                        value={pinForm.confirmPin}
                        onChange={updatePinField('confirmPin')}
                        placeholder="Repeat new PIN"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <small className="admin-pin-hint">
                    Leave these empty to keep your current PIN. The PIN is stored encrypted and can never be shown again.
                  </small>
                </div>

                <button type="submit" className="btn-accent admin-save-button">
                  <ShieldCheck size={18} />
                  {isSaving ? 'Saving...' : 'Save settings'}
                </button>

                <div className="admin-catalog-sync span-2">
                  <div>
                    <strong>Restore all store products</strong>
                    <span>Reload all 52 products with their images and RWF prices.</span>
                  </div>
                  <button type="button" className="btn-outline" onClick={handleLoadCuratedCatalog} disabled={isSaving}>
                    {isSaving ? 'Loading...' : 'Load 52 products'}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <>
              <section className="admin-section-head">
                <div>
                  <span className="admin-section-kicker">Catalogue / {activeCategory.category}</span>
                  <h1>{activeCategory.label}</h1>
                  <p>Add stock, set the price, upload images and keep the shelf tidy.</p>
                </div>
                <div className="admin-section-actions">
                  <div className="admin-stat-strip">
                    <span><b>{organizedProducts.length}</b> shown</span>
                    <span><b>{allProductCount}</b> total</span>
                    <span><b>{totalValue.toLocaleString()}</b> RWF</span>
                  </div>
                  {activeCategoryId !== 'all' && (
                    <button
                      type="button"
                      className="btn-accent admin-add-product-button"
                      onClick={() => {
                        if (blockedByMaintenance()) return;
                        resetProductForm();
                        setIsEditorOpen(true);
                      }}
                    >
                      <Plus size={17} /> Add product
                    </button>
                  )}
                </div>
              </section>

              <section className="admin-entry-grid">
                {isEditorOpen && activeCategoryId !== 'all' && (
                  <div className="admin-editor-backdrop" onMouseDown={() => setIsEditorOpen(false)}>
                  <form className="admin-product-form" onSubmit={handleSaveProduct} onMouseDown={(event) => event.stopPropagation()}>
                    <div className="admin-form-title">
                      <div>
                        <span className="admin-form-kicker">Product editor</span>
                        <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
                        <p>{activeCategory.label} will appear in {activeCategory.category}.</p>
                      </div>
                      <button type="button" className="btn-outline" onClick={() => setIsEditorOpen(false)}>
                        Close
                      </button>
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
                      <label htmlFor="product-old-price">Old price in RWF (optional)</label>
                      <input
                        id="product-old-price"
                        type="number"
                        value={form.oldPrice}
                        onChange={updateFormField('oldPrice')}
                        placeholder="2500000"
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
                      <label htmlFor="product-image">
                        {isUploadingImages ? 'Uploading images…' : 'Images'}
                      </label>
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
                      <label htmlFor="product-video">YouTube video URL (phone description)</label>
                      <input
                        id="product-video"
                        type="url"
                        value={form.videoUrl}
                        onChange={updateFormField('videoUrl')}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="form-group span-2">
                      <label htmlFor="product-video-caption">Video caption (optional)</label>
                      <input
                        id="product-video-caption"
                        type="text"
                        value={form.videoCaption}
                        onChange={updateFormField('videoCaption')}
                        placeholder="e.g. LIVE: AMAKURU ARAMBUYE | Tariki 29 NYAKANGA 2026"
                      />
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

                    <button type="submit" className="btn-accent admin-save-button" disabled={isUploadingImages}>
                      <Plus size={18} />
                      {isUploadingImages ? 'Uploading images…' : isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Save product'}
                    </button>
                  </form>
                  </div>
                )}

                <section className="admin-list-panel admin-list-panel-wide">
                  <div className="admin-toolbar">
                    <div className="search-field">
                      <Search size={18} />
                      <input
                        type="search"
                        placeholder={`Search ${activeCategory.label.toLowerCase()}`}
                        value={searchQuery}
                        onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
                      />
                    </div>
                    <select
                      className="admin-filter-select"
                      value={colorFilter}
                      onChange={(event) => { setColorFilter(event.target.value); setCurrentPage(1); }}
                      aria-label="Filter by color"
                    >
                      <option value="all">All colors</option>
                      {availableColors.map((color) => <option key={color} value={color}>{color}</option>)}
                    </select>
                    <select
                      className="admin-filter-select"
                      value={sortOption}
                      onChange={(event) => { setSortOption(event.target.value); setCurrentPage(1); }}
                      aria-label="Sort products"
                    >
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="price-asc">Price low-high</option>
                      <option value="price-desc">Price high-low</option>
                    </select>
                  </div>

                  {selectedProductIds.length > 0 && (
                    <div className="admin-bulk-bar">
                      <strong>{selectedProductIds.length} selected</strong>
                      <button type="button" onClick={handleBulkDelete}><Trash2 size={15} /> Delete selected</button>
                    </div>
                  )}

                  <div className="admin-table-head" aria-hidden="true">
                    <label className="admin-row-check">
                      <input
                        type="checkbox"
                        checked={paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedProductIds.includes(product.id))}
                        onChange={togglePageSelection}
                        aria-label="Select this page"
                      />
                    </label>
                    <span>Image</span>
                    <span>Product details and price</span>
                    <span>Actions</span>
                  </div>

                  <div className="admin-product-list">
                    {organizedProducts.length === 0 && (
                      <div className="admin-empty-state">
                        <strong>No products here yet</strong>
                        <span>Clear the filters or add the first {activeCategory.label.toLowerCase()} item.</span>
                      </div>
                    )}
                    {paginatedProducts.map(renderProductCard)}
                  </div>

                  {organizedProducts.length > 0 && (
                    <div className="admin-pagination">
                      <span>
                        {(safeCurrentPage - 1) * pageSize + 1}-{Math.min(safeCurrentPage * pageSize, organizedProducts.length)} of {organizedProducts.length}
                      </span>
                      <div>
                        <button type="button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
                        <strong>Page {safeCurrentPage} of {totalPages}</strong>
                        <button type="button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
                      </div>
                    </div>
                  )}
                </section>
              </section>
            </>
          )}
        </main>
      </div>

      {isMaintenanceNoticeOpen && (
        <div
          className="maintenance-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="maintenance-title"
          onMouseDown={() => setIsMaintenanceNoticeOpen(false)}
        >
          <div className="maintenance-card" onMouseDown={(event) => event.stopPropagation()}>
            <span className="maintenance-icon" aria-hidden="true">
              <Wrench size={26} />
            </span>
            <h2 id="maintenance-title">{MAINTENANCE_TITLE}</h2>
            <p>{MAINTENANCE_BODY}</p>
            <button
              type="button"
              className="btn-accent maintenance-close"
              onClick={() => setIsMaintenanceNoticeOpen(false)}
              autoFocus
            >
              Nabyumvise
            </button>
          </div>
        </div>
      )}

      <nav className="admin-mobile-bottom-nav">
        <div className="bottom-nav-item">
          <button 
            type="button" 
            className={`bottom-nav-btn ${isPhoneDropupOpen ? 'active' : ''}`}
            onClick={() => { setIsPhoneDropupOpen(!isPhoneDropupOpen); setIsAccessoryDropupOpen(false); }}
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
        {customCategories.length === 0 ? (
          <button type="button" className={`bottom-nav-btn ${activeCategoryId === 'speakers' ? 'active' : ''}`} onClick={() => { selectCategory('speakers'); setIsPhoneDropupOpen(false); }}>
            <Speaker size={20} />
            <span>Accessories</span>
          </button>
        ) : (
          <div className="bottom-nav-item">
            <button
              type="button"
              className={`bottom-nav-btn ${isAccessoryDropupOpen ? 'active' : ''}`}
              onClick={() => { setIsAccessoryDropupOpen(!isAccessoryDropupOpen); setIsPhoneDropupOpen(false); }}
            >
              <Speaker size={20} />
              <span>Accessories</span>
            </button>
            {isAccessoryDropupOpen && (
              <div className="admin-phone-dropup">
                <button type="button" onClick={() => { selectCategory('speakers'); setIsAccessoryDropupOpen(false); }}>
                  <Speaker size={16} />
                  <span>Accessories</span>
                </button>
                {customCategories.map((cat) => {
                  const Icon = cat.icon || Tags;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { selectCategory(cat.id); setIsAccessoryDropupOpen(false); }}
                    >
                      <Icon size={16} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <button type="button" className={`bottom-nav-btn ${activeCategoryId === 'all' ? 'active' : ''}`} onClick={() => { selectCategory('all'); setIsPhoneDropupOpen(false); }}>
          <LayoutGrid size={20} />
          <span>My Devices</span>
        </button>
      </nav>
    </div>
  );
};

export default Admin;
