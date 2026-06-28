import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

function formatRwf(price) {
  return `${Number(price).toLocaleString()} RWF`;
}

const CartDrawer = ({ cart, isOpen, onClose, onRemoveItem, onUpdateQty, phone }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = (event) => {
    event.preventDefault();
    if (!name.trim() || !location.trim()) {
      window.alert('Please provide your name and delivery location.');
      return;
    }

    const lines = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} x ${item.quantity} - ${formatRwf(
            item.price * item.quantity
          )}`
      )
      .join('\n');

    const message = `New cart request from ${name}\nLocation: ${location}\n\n${lines}\n\nTotal: ${formatRwf(
      total
    )}`;

    window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="cart-header">
          <h3>
            <ShoppingBag size={20} />
            Cart
          </h3>
          <button type="button" className="btn-icon btn-icon-outline" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <h4>Your cart is empty</h4>
              <p>Add a product and it will appear here immediately.</p>
            </div>
          ) : (
            cart.map((item) => (
              <article key={`${item.id}-${item.size}`} className="cart-item-card">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-copy">
                  <strong>{item.name}</strong>
                  <span>{item.size}</span>
                  <div className="cart-qty-row">
                    <button
                      type="button"
                      className="qty-button"
                      onClick={() => onUpdateQty(item.id, item.size, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-button"
                      onClick={() => onUpdateQty(item.id, item.size, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-meta">
                  <strong>{formatRwf(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() => onRemoveItem(item.id, item.size)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <form className="cart-footer-form" onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="cart-name">Your name</label>
              <input
                id="cart-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cart-location">Delivery location</label>
              <input
                id="cart-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
              />
            </div>
            <div className="cart-total-row">
              <span>Total</span>
              <strong>{formatRwf(total)}</strong>
            </div>
            <button type="submit" className="btn-accent full-width">
              Send order on WhatsApp
            </button>
          </form>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
