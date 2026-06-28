import { useState } from 'react';
import { CheckCircle2, MessageCircle, PhoneCall, Send, X } from 'lucide-react';

const quickMessages = [
  'Is this product available today?',
  'Can you confirm the latest price?',
  'I need delivery details in Kigali.',
];

const WhatsAppWidget = ({ phone, products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [message, setMessage] = useState(quickMessages[0]);

  const openWhatsApp = (customMessage = message) => {
    const selectedProduct = products.find((product) => product.id === productId);
    const composedMessage = [
      'Hello Eazy1teck, I need help with a product.',
      selectedProduct ? `Product: ${selectedProduct.name}` : null,
      customMessage,
    ]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(composedMessage)}`, '_blank');
  };

  const sendMessage = (event) => {
    event.preventDefault();
    openWhatsApp();
  };

  return (
    <div className="wa-widget-container">
      <button
        type="button"
        className={`wa-float-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open WhatsApp support"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {isOpen && (
        <>
          <div className="wa-chat-window">
            <div className="wa-chat-header">
              <div>
                <span className="wa-status">
                  <CheckCircle2 size={14} />
                  Available on WhatsApp
                </span>
                <h4>Eazy1teck support</h4>
                <p>Ask about stock, prices or delivery before ordering.</p>
              </div>
              <button type="button" className="wa-close-btn" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="wa-contact-row">
              <PhoneCall size={17} />
              <div>
                <span>Direct contact</span>
                <strong>{phone}</strong>
              </div>
            </div>

            <form className="wa-form" onSubmit={sendMessage}>
              <div className="form-group">
                <label htmlFor="wa-product">Product</label>
                <select
                  id="wa-product"
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wa-quick-list">
                {quickMessages.map((quickMessage) => (
                  <button
                    key={quickMessage}
                    type="button"
                    className={message === quickMessage ? 'active' : ''}
                    onClick={() => setMessage(quickMessage)}
                  >
                    {quickMessage}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label htmlFor="wa-message">Custom message</label>
                <textarea
                  id="wa-message"
                  rows="3"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your question"
                  required
                />
              </div>

              <button type="submit" className="wa-submit-button full-width">
                <Send size={16} />
                Open WhatsApp
              </button>
            </form>
          </div>
          <button
            type="button"
            className="wa-cancel-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close WhatsApp widget"
            title="Close"
          >
            <X size={18} />
          </button>
        </>
      )}
    </div>
  );
};

export default WhatsAppWidget;
