import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="page-shell container">
      <section className="empty-state-card">
        <span className="eyebrow">404 error</span>
        <h1>Page not found</h1>
        <p>
          The page you are looking for is not available. Head back to the store and
          continue browsing our products.
        </p>
        <div className="inline-actions">
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Return home
          </Link>
          <Link to="/" className="btn-outline">
            <Search size={16} />
            Browse catalog
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
