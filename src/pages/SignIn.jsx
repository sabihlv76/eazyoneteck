import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.svg';

const SignIn = ({ onSignIn }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      await onSignIn({
        email: form.email,
        password: form.password,
      });
      navigate('/account');
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in.');
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
          <h1>Sign in</h1>
          <p>Return to your account and continue shopping from any device.</p>
        </div>

        {authError && <p className="form-error">{authError}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signin-email">Email address</label>
            <input
              id="signin-email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signin-password">Password</label>
            <div className="password-field">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={updateField('password')}
                placeholder="Enter your password"
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

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-helper-text">
          Do not have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
