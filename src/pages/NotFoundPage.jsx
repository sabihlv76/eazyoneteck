import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="page-shell container">
      <section className="empty-state-card">
        <span className="eyebrow">404 error</span>
        <h1>We could not find that page</h1>
        <p>
          The link may be old or incorrect. Return to the store to find the product you need.
        </p>
        <div className="inline-actions">
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Go to the store
          </Link>
          <Link to="/" className="btn-outline">
            <Search size={16} />
            Browse all products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
