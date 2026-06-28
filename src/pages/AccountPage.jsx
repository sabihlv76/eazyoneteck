import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const emptyUser = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
};

const AccountPage = ({ user, onSave, onSignOut }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState(user || emptyUser);
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="page-shell container">
        <section className="empty-state-card">
          <h2>Sign in to manage your account</h2>
          <p>
            Customers can keep their contact information ready for faster mobile
            checkout and support.
          </p>
          <div className="inline-actions">
            <Link to="/signin" className="btn-primary">
              Sign in
            </Link>
            <Link to="/signup" className="btn-outline">
              Create account
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await onSave(form);
      setMessage('Your account settings have been updated.');
      window.setTimeout(() => setMessage(''), 2500);
    } catch (error) {
      setMessage(error.message || 'Unable to update your account.');
      window.setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div className="page-shell container">
      <section className="page-hero-card">
        <span className="eyebrow">Customer profile</span>
        <h1>Account settings</h1>
        <p>Keep customer details clean and easy to manage from mobile or desktop.</p>
      </section>

      <section className="settings-grid page-section">
        <form className="settings-card" onSubmit={handleSubmit}>
          <div className="settings-card-head">
            <h2>Profile information</h2>
            {message && <span className="status-pill success">{message}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={updateField('firstName')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={updateField('lastName')}
                required
              />
            </div>

            <div className="form-group span-2">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                required
              />
            </div>

            <div className="form-group span-2">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={updateField('phone')}
                placeholder="+2507..."
              />
            </div>
          </div>

          <div className="inline-actions end">
            <button type="submit" className="btn-accent">
              Save changes
            </button>
          </div>
        </form>

        <aside className="settings-card">
          <div className="settings-card-head">
            <h2>Quick actions</h2>
          </div>
          <div className="stack-list">
            <p>Signed in as <strong>{user.email}</strong>.</p>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/wishlist')}
            >
              Open wishlist
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/')}
            >
              Browse products
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onSignOut}
            >
              Sign out
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AccountPage;
