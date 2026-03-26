import { Link } from "react-router-dom";
import "./Home.css";
import heroImage from "../assets/vector_img.svg";
import aboutImage from "../assets/univers.jpg";
import contactImage from "../assets/contact.jpg";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Home = () => {
  return (
    <div className="home-container">

      {/* NAVBAR */}
      <nav className="home-navbar">
        <h2 className="logo">👥 Alumni-Connect</h2>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <Link to="/login" className="nav-btn">Login</Link>
          <Link to="/register" className="nav-btn register-btn">Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <h1>Connect Students & Alumni</h1>
          <p>
            Build meaningful connections, share interview experiences,
            get career guidance, and grow together with your alumni network.
          </p>
          <Link to="/register" className="primary-btn">
            Join Now
          </Link>
        </div>

        <div className="hero-right">
          <img src={heroImage} alt="Hero" />
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="section-content">
          <div className="text">
            <h2>About Institution</h2>
            <p>
             Sri G.V.G. Visalakshi College for Women, Udumalpet, a government-aided autonomous institution affiliated to Bharathiar University, Coimbatore, was founded by the great philanthropist, Sri G.V.Govindaswamy Naidu. The college has made an indelible mark in the academic map of South India imparting quality education to rural women students since 1952 with a motto ‘Not for self, but for all’. The institution has always remained the iconic educational edifice imparting knowledge and values fulfilling the vision and mission of our founder and educational administrators over the period of 71 years offering 23 UG and 8 PG programmes.
            </p>
          </div>

          <img src={aboutImage} alt="About" />
        </div>
      </section>

      {/* CONTACT */}
   <section id="contact" className="section">
  <div className="contact-container">

    {/* LEFT IMAGE */}
    <div className="contact-image">
      <img src={contactImage} alt="Contact" />
    </div>

    {/* RIGHT CONTENT */}
    <div className="contact-content">

      {/* About */}
      {/* Quick Links */}
      <div className="footer-col">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="#about">About G.V.G</a></li>

        </ul>
      </div>

      {/* Social Links */}
      <div className="footer-col">
        <h3>Social Links</h3>
        <ul>
          <li>
            <a href="https://www.facebook.com/gvg.udumlapet.7?mibextid=2JQ9oc" target="_blank">
              <FaFacebookF className="icon" /> Facebook
            </a>
          </li>
          <li>
            <a href="/">
              <FaTwitter className="icon" /> Twitter
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/gvg_college_women/?igshid=NzZlODBkYWE4Ng%3D%3D" target="_blank">
              <FaInstagram className="icon" /> Instagram
            </a>
          </li>
          <li>
            <a href="/">
              <FaLinkedinIn className="icon" /> LinkedIn
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/@gvgmedia-sw1yb" target="_blank">
              <FaYoutube className="icon" /> YouTube
            </a>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div className="footer-col">
        <h3>Contact</h3>
        <p>🏠 Palani Road, Udumalpet, Tamil Nadu</p>
        <p>📞 04252-223019</p>
        <p>✉ gvgprincipal@gmail.com</p>
      </div>

    </div>
  </div>
</section>
    </div>
  );
};

export default Home;