import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Market Sentiment</h1>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link
            to="/sentiment"
            className={`nav-item ${location.pathname === '/sentiment' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Market Sentiment</span>
          </Link>
          <Link
            to="/settings"
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
