import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";
import scribbieLogoV2 from "../../assets/ScribbieLogoV2.png";
import heroLearning from "../../assets/hero-learning.png";

// Import UI components
import { 
  Button, 
  Badge,
  Progress,
  Separator,
  Card,
  CardContent
} from '../ui';

// Feature icons mapping
const FeatureIcon = ({ children, color }) => (
  <div className="feature-icon" style={{ color }}>
    {children}
  </div>
);

// Simple icon components
const GamepadIcon = () => <span>🎮</span>;
const TrendingUpIcon = () => <span>📈</span>;
const SchoolIcon = () => <span>🏫</span>;
const ShieldIcon = () => <span>🔒</span>;
const BrainIcon = () => <span>🧠</span>;
const SmartphoneIcon = () => <span>📱</span>;
const ArrowRightIcon = () => <span>→</span>;
const CheckCircleIcon = () => <span>✓</span>;
const SparklesIcon = () => <span>✨</span>;
const ArrowUpIcon = () => <span>↑</span>;
const BookOpenIcon = () => <span>📚</span>;
const FacebookIcon = () => <span>f</span>;
const TwitterIcon = () => <span>𝕏</span>;
const InstagramIcon = () => <span>📷</span>;
const YoutubeIcon = () => <span>▶</span>;

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToLogin = () => {
    navigate("/teacher-login");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      title: "Interactive Reading Games",
      description: "Engaging word games and reading challenges that make learning feel like play. Students develop critical literacy skills through fun, interactive activities that adapt to their level.",
      icon: GamepadIcon,
      color: "#36B8E4",
      progress: 85
    },
    {
      title: "Real-Time Progress Tracking",
      description: "Monitor student progress with detailed analytics and personalized learning insights. Teachers and parents stay informed with comprehensive dashboards and automated reports.",
      icon: TrendingUpIcon,
      color: "#FDB10D",
      progress: 92
    },
    {
      title: "Classroom Management",
      description: "Powerful tools for teachers to create, manage, and assign lessons to students with ease. Organize classes, track assignments, and celebrate student achievements.",
      icon: SchoolIcon,
      color: "#F13A50",
      progress: 78
    },
    {
      title: "Child-Safe Environment",
      description: "Secure, COPPA-compliant platform designed specifically for young learners with robust privacy protection. Parents and teachers can rest easy knowing kids are safe.",
      icon: ShieldIcon,
      color: "#10B981",
      progress: 95
    },
    {
      title: "Adaptive Learning AI",
      description: "Smart system that adapts to each student's learning pace and provides personalized challenges. Every child gets the right level of difficulty to stay engaged and progress.",
      icon: BrainIcon,
      color: "#8B5CF6",
      progress: 88
    },
    {
      title: "Multi-Device Access",
      description: "Learn anywhere, anytime! Access Scribbie on tablets, computers, and interactive whiteboards. Seamless experience across all devices with automatic progress sync.",
      icon: SmartphoneIcon,
      color: "#EF4444",
      progress: 90
    }
  ];


  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Grade 1 Teacher",
      school: "Maple Elementary",
      content: "Scribbie has transformed my classroom! My students are more engaged with reading than ever before. The interactive games make learning feel like play.",
      rating: 5,
      avatar: "👩‍🏫"
    },
    {
      name: "Michael Chen",
      role: "Parent",
      school: "Parent of Emma, Age 6",
      content: "Emma loves her daily Scribbie time! Her reading skills have improved dramatically, and she actually asks to practice reading now.",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Lisa Rodriguez",
      role: "Reading Specialist",
      school: "Sunshine Academy",
      content: "The progress tracking features are incredible. I can see exactly where each student needs support and celebrate their achievements.",
      rating: 5,
      avatar: "👩‍🎓"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Navbar */}
      <nav className={`navbar-modern ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-modern">
          <a href="#" className="nav-logo-modern">
            <img src={scribbieLogoV2} alt="Scribbie Logo" style={{ height: '40px', width: 'auto', borderRadius: '0.5rem' }} />
          </a>
          
          <div className="nav-actions-modern">
            <Button variant="ghost" onClick={goToLogin}>Sign In</Button>
            <Button variant="primary" onClick={goToLogin}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Modern Hero Section */}
      <section className="hero-modern">
        {/* Animated Background Elements */}
        <div className="hero-bg-elements">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="bg-element bg-element-3"></div>
          <div className="bg-element bg-element-4"></div>
        </div>

        <div className="container-modern hero-container">
          <div className="hero-grid">
            {/* Hero Text */}
            <div className="hero-text-modern">
              <Badge variant="secondary" className="hero-badge">
                <SparklesIcon />
                <span>Trusted by 10,000+ teachers</span>
              </Badge>
              
              <h1 className="hero-title-modern">
                Make Learning{" "}
                <span className="text-gradient-warm">
                  Fun & Engaging
                </span>
              </h1>
              
              <p className="hero-subtitle-modern">
                Transform your classroom with interactive reading games that turn literacy practice into an adventure. 
                Watch your students' eyes light up as they master reading skills through play.
              </p>
              
              <div className="hero-cta-modern">
                <Button variant="hero" size="lg" onClick={goToLogin}>
                  Start Learning
                  <ArrowRightIcon />
                </Button>
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="hero-stats-modern">
                <div className="stat-item">
                  <div className="stat-number">50K+</div>
                  <div className="stat-label">Active Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Teachers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hero-image-modern">
              <div className="hero-image-container">
                <img
                  src={heroLearning}
                  alt="Children learning with Scribbie"
                  className="hero-img-modern"
                />
              </div>
              
              {/* Floating Elements */}
              <div className="floating-badge floating-badge-1">
                🎮 Fun Games!
              </div>
              <div className="floating-badge floating-badge-2">
                📚 Learn More!
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="hero-wave-modern">
          <svg viewBox="0 0 1440 120" className="wave-svg">
            <path 
              d="M0,64 C360,20 720,20 1080,64 C1440,108 1440,108 1440,108 L1440,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="features-modern">
        {/* Background Decoration */}
        <div className="features-bg-decoration">
          <div className="bg-decoration bg-decoration-1"></div>
          <div className="bg-decoration bg-decoration-2"></div>
        </div>
        
        <div className="container-modern features-container">
          <div className="features-header">
            <Badge className="features-badge">
              Why Choose Scribbie
            </Badge>
            <h2 className="features-title">
              Powerful Features for{" "}
              <span className="text-gradient-primary">Modern Learning</span>
            </h2>
            <p className="features-description">
              Everything you need to create an engaging, effective learning environment. 
              Built by educators, for educators.
            </p>
          </div>
          
          <div className="features-grid-modern">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card-modern"
                style={{ 
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Accent Bar */}
                <div 
                  className="feature-accent-bar"
                  style={{ backgroundColor: feature.color }}
                />
                
                {/* Icon */}
                <div 
                  className="feature-icon-wrapper-modern"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon style={{ color: feature.color }} />
                </div>

                {/* Content */}
                <h3 className="feature-title-modern">{feature.title}</h3>
                <p className="feature-description-modern">{feature.description}</p>

                {/* Progress Section */}
                <Separator className="my-4" />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', fontFamily: 'Montserrat, sans-serif' }}>Development</span>
                    <span style={{ fontSize: '0.875rem', fontFamily: 'Montserrat, sans-serif' }}>{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-2" />
                </div>

                {/* Hover Effect Gradient */}
                <div 
                  className="feature-hover-gradient"
                  style={{ background: `linear-gradient(135deg, ${feature.color}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-modern">
        <div className="container-modern">
          <div className="testimonials-header">
            <Badge className="testimonials-badge">
              What Our Users Say
            </Badge>
            <h2 className="testimonials-title">
              Loved by Teachers, <span className="text-gradient-primary">Parents & Students</span>
            </h2>
            <p className="testimonials-description">
              Join thousands of educators and families who have transformed learning with Scribbie.
            </p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card">
                <CardContent style={{ padding: '2rem' }}>
                  {/* Rating Stars */}
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="star">⭐</span>
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="testimonial-quote">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.avatar}
                    </div>
                    <div className="author-info">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-role">{testimonial.role}</div>
                      <div className="author-school">{testimonial.school}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="cta-modern">
        {/* Animated Background Elements */}
        <div className="cta-bg-elements">
          <div className="cta-bg-element cta-bg-element-1" />
          <div className="cta-bg-element cta-bg-element-2" />
        </div>

        <div className="container-modern cta-container">
          <div className="cta-content-modern">
            <h2 className="cta-title-modern">
              Ready to Transform Your{" "}
              <span className="text-gradient-warm">Classroom?</span>
            </h2>
            
            <p className="cta-text-modern">
              Join thousands of teachers who are making learning more engaging and effective with Scribbie.
            </p>

            {/* Benefits List */}
            <div className="cta-benefits">
              <div className="benefit-item">
                <CheckCircleIcon />
                <span>Free 30-day trial</span>
              </div>
              <div className="benefit-item">
                <CheckCircleIcon />
                <span>No credit card required</span>
              </div>
              <div className="benefit-item">
                <CheckCircleIcon />
                <span>Cancel anytime</span>
              </div>
            </div>

            <Button variant="cta" size="xl" onClick={goToLogin}>
              Get Started for Free
              <ArrowRightIcon />
            </Button>

            <p className="cta-disclaimer">
              Start your free trial today. No commitment, no hassle.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="footer-modern">
        <div className="container-modern footer-container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand-modern">
              <div className="footer-logo-modern">
                <img src={scribbieLogoV2} alt="Scribbie Logo" style={{ height: '40px', width: 'auto', borderRadius: '0.5rem' }} />
              </div>
              <p className="footer-about-modern">
                Making learning fun and engaging for students worldwide. Join the educational revolution.
              </p>
              <div className="social-links-modern">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <TwitterIcon />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">Product</h4>
              <ul className="footer-links-list">
                <li><a href="#features" className="footer-link-modern">Features</a></li>
                <li><a href="#" className="footer-link-modern">Pricing</a></li>
                <li><a href="#" className="footer-link-modern">Testimonials</a></li>
                <li><a href="#" className="footer-link-modern">FAQ</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">Company</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-modern">About Us</a></li>
                <li><a href="#" className="footer-link-modern">Careers</a></li>
                <li><a href="#" className="footer-link-modern">Contact</a></li>
                <li><a href="#" className="footer-link-modern">Blog</a></li>
              </ul>
            </div>
            
            {/* Resources Links */}
            <div className="footer-links-section">
              <h4 className="footer-section-title">Resources</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-modern">Help Center</a></li>
                <li><a href="#" className="footer-link-modern">Tutorials</a></li>
                <li><a href="#" className="footer-link-modern">Community</a></li>
                <li><a href="#" className="footer-link-modern">API Docs</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          {/* Bottom Bar */}
          <div className="footer-bottom-modern">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Scribbie. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <a href="#" className="footer-legal-link-modern">Privacy Policy</a>
              <span className="footer-separator">•</span>
              <a href="#" className="footer-legal-link-modern">Terms of Service</a>
              <span className="footer-separator">•</span>
              <a href="#" className="footer-legal-link-modern">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modern Back to Top Button */}
      <Button
        variant="primary"
        size="icon"
        className={`back-to-top-modern ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUpIcon />
      </Button>
    </div>
  );
};

export default LandingPage;
