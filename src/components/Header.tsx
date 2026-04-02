import { Link } from "react-router-dom";

const Header = () => (
  <header className="bg-orange-600 text-white px-8 py-4 flex items-center justify-between shadow-md">
    <Link to="/" className="no-underline text-white">
      <h1 className="m-0 text-2xl tracking-wide font-bold">CLE Local</h1>
    </Link>
    <nav className="flex gap-6">
      <Link to="/" className="text-white no-underline hover:underline">
        Events
      </Link>
      <Link to="/venues" className="text-white no-underline hover:underline">
        Venues
      </Link>
      <Link to="/admin" className="text-white/70 no-underline hover:underline text-sm">
        Admin
      </Link>
    </nav>
  </header>
);

export default Header;
