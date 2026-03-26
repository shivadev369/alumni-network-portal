import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  // Pages where navbar should be hidden
  const hideNavbarRoutes = ["/student", "/alumni", "/admin", "/create-interview","/create-post","/messages","/connections","/chat","/interview-experience","/admin/posts"];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }
    const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/chat");

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <div className="navbar">
      <Link to="/" className="logo">👥 Alumni-Connect</Link>

      <div className="nav-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Navbar;