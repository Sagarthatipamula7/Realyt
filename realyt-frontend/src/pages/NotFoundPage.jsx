import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="page-shell">
      <div className="container glow-card" style={{ padding: '36px' }}>
        <h1 className="hero-title">Page not found</h1>
        <p className="hero-copy">The page you are looking for cannot be found.</p>
        <Link to="/" className="btn-secondary" style={{ marginTop: '24px' }}>
          Return home
        </Link>
      </div>
    </main>
  );
}
