import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";
import scribbieLogoV2 from "../../assets/ScribbieLogoV2.png";
import landingFace from "../../assets/landingface.png";

// Icons (You can replace with actual icon components)
const FeatureIcon = ({ children }) => (
  <div className="feature-icon">
    {children}
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const goToLogin = () => {
    navigate("/teacher-login");
  };

  const features = [
    {
      title: "Interactive Lessons",
      description: "Engaging reading and writing activities that make learning fun",
      icon: "📚"
    },
    {
      title: "User-Friendly",
      description: "Intuitive interface designed for all ages and skill levels",
      icon: "🎨"
    },
    {
      title: "Secure Platform",
      description: "Safe and reliable learning environment for everyone",
      icon: "🔒"
    }
  ];

  return (
    <div className="landingpage">
      {/* Sticky Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="nav-logo">
            <img
              src={scribbieLogoV2}
              alt="Scribbie Logo"
              className="navlogo-img"
            />
          </a>
          
          <div className="nav-actions">
            <button className="btn btn-secondary" onClick={goToLogin}>Sign In</button>
            <button className="btn btn-primary ml-4" onClick={goToLogin}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="hero-title">Make Learning <span className="text-gradient">Fun & Engaging</span></h1>
              <p className="hero-subtitle">Experience the future of education with interactive lessons that feel just like a real classroom.</p>
              <div className="hero-cta">
                <button className="btn btn-primary btn-lg" onClick={goToLogin}>
                  Start Learning Now
                  <span className="btn-icon">→</span>
                </button>
                <a href="#features" className="btn btn-outline ml-4">
                  Learn More
                </a>
              </div>
            </div>
            <div className="hero-image animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
              </div>
              <img
                src={landingFace}
                alt="Happy students learning"
                className="hero-img animate-float"
              />
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="container">
          <div className="section-header text-center mb-16">
            <span className="section-subtitle">Why Choose Us</span>
            <h2 className="section-title">Amazing Features</h2>
            <p className="section-description max-w-2xl mx-auto">Discover how our platform transforms the learning experience for students of all ages.</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card card glass animate-fade-in"
                style={{ animationDelay: `${0.2 * index}s` }}
              >
                <div className="feature-icon-wrapper">
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content glass">
            <h2 className="cta-title">Ready to transform your learning experience?</h2>
            <p className="cta-text">Join thousands of students already learning with Scribbie.</p>
            <button className="btn btn-primary btn-lg" onClick={goToLogin}>
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img 
                src={scribbieLogoV2} 
                alt="Scribbie Logo" 
                className="footer-logo"
              />
              <p className="footer-about">Making learning fun and engaging for students worldwide.</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <span className="social-icon">f</span>
                </a>
                <a href="#" aria-label="Twitter">
                  <span className="social-icon">t</span>
                </a>
                <a href="#" aria-label="Instagram">
                  <span className="social-icon">ig</span>
                </a>
              </div>
            </div>
            
            <div className="footer-links">
              <div className="footer-links-group">
                <h4 className="footer-links-title">Product</h4>
                <a href="#" className="footer-link">Features</a>
                <a href="#" className="footer-link">Pricing</a>
                <a href="#" className="footer-link">Testimonials</a>
              </div>
              <div className="footer-links-group">
                <h4 className="footer-links-title">Company</h4>
                <a href="#" className="footer-link">About Us</a>
                <a href="#" className="footer-link">Careers</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
              <div className="footer-links-group">
                <h4 className="footer-links-title">Resources</h4>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Help Center</a>
                <a href="#" className="footer-link">Tutorials</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">© {new Date().getFullYear()} Scribbie. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Privacy Policy</a>
              <span className="footer-legal-separator">•</span>
              <a href="#" className="footer-legal-link">Terms of Service</a>
              <span className="footer-legal-separator">•</span>
              <a href="#" className="footer-legal-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Back to Top Button */}
      <button 
        className={`back-to-top ${scrolled ? 'show' : ''}`} 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
     </div>
  );
};

export default LandingPage;
