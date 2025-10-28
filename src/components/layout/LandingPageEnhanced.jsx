import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/landing.css";
import scribbieLogoV2 from "../../assets/ScribbieLogoV2.png";
import heroLearning from "../../assets/hero-learning.png";

// Import UI components
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Separator,
  Progress,
  Skeleton
} from '../ui';

// Enhanced Landing Page with UI Components
const LandingPageEnhanced = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: "🎮",
      title: "Interactive Games",
      description: "Engaging educational games that make learning fun and memorable for Grade 1 students.",
      color: "#36B8E4",
      progress: 85
    },
    {
      icon: "✨",
      title: "AI-Powered Learning",
      description: "Personalized learning experiences adapted to each child's pace and learning style.",
      color: "#FDB10D",
      progress: 92
    },
    {
      icon: "📚",
      title: "Comprehensive Curriculum",
      description: "Complete Grade 1 curriculum covering reading, writing, math, and critical thinking.",
      color: "#F13A50",
      progress: 78
    }
  ];

  const plans = [
    { value: 'basic', label: 'Basic Plan - $9.99/month', features: ['5 Games', 'Basic Support'] },
    { value: 'premium', label: 'Premium Plan - $19.99/month', features: ['Unlimited Games', 'Priority Support', 'Progress Reports'] },
    { value: 'family', label: 'Family Plan - $29.99/month', features: ['Up to 4 Children', 'All Features', 'Family Dashboard'] }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container-modern py-20">
          <div className="text-center mb-8">
            <Skeleton className="skeleton-text-lg mx-auto mb-4" style={{ width: '300px' }} />
            <Skeleton className="skeleton-text mx-auto" style={{ width: '500px' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="skeleton-avatar mb-4" />
                <Skeleton className="skeleton-text mb-2" />
                <Skeleton className="skeleton-text" style={{ width: '80%' }} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Navbar */}
      <nav className={`navbar-modern ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="#" className="nav-logo-modern">
              <img src={scribbieLogoV2} alt="Scribbie" style={{ width: '40px', height: '40px' }} />
              <span className="logo-text">Scribbie</span>
            </a>
            
            <div className="nav-actions-modern" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem' }}>Dark Mode</span>
                <Switch 
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                  size="sm"
                />
              </div>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="hero-modern">
        <div className="hero-bg-elements">
          <div className="bg-element bg-element-1"></div>
          <div className="bg-element bg-element-2"></div>
          <div className="bg-element bg-element-3"></div>
          <div className="bg-element bg-element-4"></div>
        </div>
        
        <div className="container-modern hero-container">
          <div className="hero-grid">
            <div className="hero-text-modern">
              <Badge variant="secondary" className="hero-badge">
                🎉 New AI Features Available!
              </Badge>
              
              <h1 className="hero-title-modern">
                Make Learning <span className="text-gradient-warm">Fun</span> for Grade 1
              </h1>
              
              <p className="hero-subtitle-modern">
                Transform your child's education with interactive games, AI-powered personalization, 
                and a comprehensive curriculum designed specifically for Grade 1 students.
              </p>
              
              <div className="hero-cta-modern">
                <Button variant="hero" size="lg" onClick={() => navigate('/register')}>
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </div>

              {/* Plan Selection */}
              <div style={{ marginTop: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Choose Your Plan:
                </label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger style={{ maxWidth: '300px' }}>
                    <SelectValue placeholder="Select a plan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hero-stats-modern">
                <div className="stat-item">
                  <div className="stat-number">10K+</div>
                  <div className="stat-label">Happy Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Schools</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>
            
            <div className="hero-image-modern">
              <div className="hero-image-container">
                <img 
                  src={heroLearning} 
                  alt="Children Learning" 
                  className="hero-img-modern"
                />
                <div className="floating-badge floating-badge-1">🏆 Award Winning</div>
                <div className="floating-badge floating-badge-2">⭐ 4.9/5 Rating</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-wave-modern">
          <svg className="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </section>

      {/* Enhanced Features Section with Tabs */}
      <section className="features-modern">
        <div className="features-bg-decoration">
          <div className="bg-decoration bg-decoration-1"></div>
          <div className="bg-decoration bg-decoration-2"></div>
        </div>
        
        <div className="container-modern features-container">
          <div className="features-header">
            <Badge className="features-badge">Features</Badge>
            <h2 className="features-title">Everything Your Child Needs</h2>
            <p className="features-description">
              Comprehensive learning tools designed to engage, educate, and inspire Grade 1 students.
            </p>
          </div>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="features-grid-modern">
                {features.map((feature, index) => (
                  <Card key={index} className="feature-card-modern">
                    <div 
                      className="feature-accent-bar"
                      style={{ background: feature.color }}
                    ></div>
                    
                    <CardContent style={{ padding: '2rem' }}>
                      <div 
                        className="feature-icon-wrapper-modern"
                        style={{ 
                          background: `${feature.color}20`,
                          color: feature.color 
                        }}
                      >
                        {feature.icon}
                      </div>
                      
                      <CardTitle className="feature-title-modern">
                        {feature.title}
                      </CardTitle>
                      
                      <p className="feature-description-modern">
                        {feature.description}
                      </p>

                      <Separator className="my-4" />
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Completion</span>
                          <span style={{ fontSize: '0.875rem' }}>{feature.progress}%</span>
                        </div>
                        <Progress value={feature.progress} className="h-2" />
                      </div>
                    </CardContent>
                    
                    <div 
                      className="feature-hover-gradient"
                      style={{ background: feature.color }}
                    ></div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="games">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Interactive Learning Games</h3>
                <p className="text-gray-600 mb-6">Discover our collection of educational games designed for Grade 1 students.</p>
                <Button variant="cta">Explore Games</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="progress">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Track Learning Progress</h3>
                <p className="text-gray-600 mb-6">Monitor your child's learning journey with detailed progress reports.</p>
                <Button variant="cta">View Reports</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="cta-modern">
        <div className="cta-bg-elements">
          <div className="cta-bg-element cta-bg-element-1"></div>
          <div className="cta-bg-element cta-bg-element-2"></div>
        </div>
        
        <div className="container-modern cta-container">
          <Card className="cta-content-modern">
            <CardContent style={{ padding: '4rem 2rem' }}>
              <h2 className="cta-title-modern">Ready to Transform Learning?</h2>
              <p className="cta-text-modern">
                Join thousands of families who have already discovered the joy of learning with Scribbie.
              </p>
              
              <div className="cta-benefits">
                <div className="benefit-item">
                  <span>✅</span>
                  <span>Free 14-day trial</span>
                </div>
                <div className="benefit-item">
                  <span>✅</span>
                  <span>No credit card required</span>
                </div>
                <div className="benefit-item">
                  <span>✅</span>
                  <span>Cancel anytime</span>
                </div>
                <div className="benefit-item">
                  <span>✅</span>
                  <span>24/7 support</span>
                </div>
              </div>
              
              <Button 
                variant="cta" 
                size="xl" 
                onClick={() => navigate('/register')}
                className="btn-cta"
              >
                Start Your Free Trial
              </Button>
              
              <p className="cta-disclaimer">
                Start your journey today. No commitment required.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="footer-modern">
        <div className="container-modern footer-container">
          <div className="footer-grid">
            <div className="footer-brand-modern">
              <div className="footer-logo-modern">
                <img src={scribbieLogoV2} alt="Scribbie" style={{ width: '40px', height: '40px' }} />
                <span className="footer-logo-text">Scribbie</span>
              </div>
              <p className="footer-about-modern">
                Making learning fun and accessible for Grade 1 students worldwide through innovative educational technology.
              </p>
              <div className="social-links-modern">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>
            
            <div>
              <h3 className="footer-section-title">Product</h3>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-modern">Features</a></li>
                <li><a href="#" className="footer-link-modern">Pricing</a></li>
                <li><a href="#" className="footer-link-modern">Games</a></li>
                <li><a href="#" className="footer-link-modern">Curriculum</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="footer-section-title">Support</h3>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-modern">Help Center</a></li>
                <li><a href="#" className="footer-link-modern">Contact Us</a></li>
                <li><a href="#" className="footer-link-modern">Community</a></li>
                <li><a href="#" className="footer-link-modern">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="footer-section-title">Company</h3>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link-modern">About Us</a></li>
                <li><a href="#" className="footer-link-modern">Careers</a></li>
                <li><a href="#" className="footer-link-modern">Blog</a></li>
                <li><a href="#" className="footer-link-modern">Press</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="footer-bottom-modern">
            <p className="footer-copyright">
              © 2024 Scribbie. All rights reserved.
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

      {/* Back to Top Button */}
      <Button
        variant="primary"
        size="icon"
        className={`back-to-top-modern ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
      >
        ↑
      </Button>
    </div>
  );
};

export default LandingPageEnhanced;
