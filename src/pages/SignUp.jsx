import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.svg';

const SignUp = ({ onSignUp }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      await onSignUp({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        password: form.password,
      });
      navigate('/account');
    } catch (error) {
      setAuthError(error.message || 'Unable to create the account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back-link">
          Back to site
        </Link>
        <div className="auth-logo-block">
          <span className="brand-mark auth-brand-mark">
            <img src={logoImg} alt="Eazy1teck" className="brand-logo" />
          </span>
          <h1>Create account</h1>
          <p>Set up a customer profile that feels simple and clean on mobile.</p>
        </div>

        {authError && <p className="form-error">{authError}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                type="text"
                value={form.firstName}
                onChange={updateField('firstName')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                type="text"
                value={form.lastName}
                onChange={updateField('lastName')}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">Phone number</label>
            <input
              id="signup-phone"
              type="tel"
              value={form.phone}
              onChange={updateField('phone')}
              placeholder="+2507..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="password-field">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={updateField('password')}
                minLength={8}
                placeholder="Minimum 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-accent full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-helper-text">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
