import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Portfolio
        </Link>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
          </li>
          <li>
            <Link to="/projects" className={`nav-link ${isActive('/projects')}`}>
              Projects
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
