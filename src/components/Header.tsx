import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/digests", label: "Digests" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="no-underline flex items-baseline gap-1">
          <span className="font-heading text-xl font-bold tracking-wide text-navy">
            CLE
          </span>
          <span className="font-body text-sm font-medium text-text-secondary">
            Brief
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-body text-sm font-medium no-underline transition-colors ${
                location.pathname === link.to
                  ? "text-navy border-b-2 border-coral pb-0.5"
                  : "text-text-secondary hover:text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="font-body text-sm font-medium no-underline text-text-muted hover:text-navy transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin
          </Link>
          <Link
            to="/#subscribe"
            className="font-body text-sm font-semibold no-underline bg-coral text-white px-4 py-2 rounded-md hover:bg-coral-dark transition-colors"
          >
            Subscribe
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-navy"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone bg-white px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`font-body text-sm font-medium no-underline py-1 ${
                location.pathname === link.to
                  ? "text-navy"
                  : "text-text-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMenuOpen(false)}
            className="font-body text-sm font-medium no-underline text-text-muted flex items-center gap-1 py-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admin
          </Link>
          <Link
            to="/#subscribe"
            onClick={() => setMenuOpen(false)}
            className="font-body text-sm font-semibold no-underline bg-coral text-white px-4 py-2 rounded-md text-center hover:bg-coral-dark transition-colors"
          >
            Subscribe
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
