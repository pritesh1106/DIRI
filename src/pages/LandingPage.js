import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const dashboards = [
    { 
      title: 'District Rankings', 
      icon: '🏆', 
      description: 'Top 668 districts by DIRI score with advanced filtering', 
      color: '#3b82f6', 
      path: '/districts',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    },
    { 
      title: 'Analytics Hub', 
      icon: '📈', 
      description: 'Correlation analysis & scatter plots with insights', 
      color: '#8b5cf6', 
      path: '/analytics',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    { 
      title: 'Factor Analysis', 
      icon: '🔬', 
      description: 'ML factor weights & Ridge Regression breakdown', 
      color: '#10b981', 
      path: '/factors',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    { 
      title: 'Cluster Insights', 
      icon: '🎯', 
      description: 'K-means clustering with 5 investment profiles', 
      color: '#f59e0b', 
      path: '/clusters',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    { 
      title: 'State Performance', 
      icon: '🗺️', 
      description: 'State-level aggregation & regional analysis', 
      color: '#ec4899', 
      path: '/states',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    },
    { 
      title: 'Early Movers', 
      icon: '🚀', 
      description: 'High-potential opportunities with low FDI saturation', 
      color: '#06b6d4', 
      path: '/earlymovers',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    { 
      title: 'Maps Visualization', 
      icon: '🌍', 
      description: 'Interactive geospatial analysis with bubble maps', 
      color: '#f43f5e', 
      path: '/maps',
      gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)'
    }
  ];

  return (
    <div className="landing">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="glow glow-1" style={{ transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)` }}></div>
        <div className="glow glow-2" style={{ transform: `translate(${-mousePos.x * 0.015}px, ${-mousePos.y * 0.015}px)` }}></div>
        <div className="glow glow-3" style={{ transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)` }}></div>
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>
      
      <div className="landing-container">
        {/* Hero Section */}
        <div className="hero-section" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            ML-Powered Investment Intelligence
          </div>
          
          <div className="title-wrapper">
            <h1 className="main-title">
              <span className="title-letter" style={{ animationDelay: '0s' }}>D</span>
              <span className="title-letter" style={{ animationDelay: '0.1s' }}>I</span>
              <span className="title-letter" style={{ animationDelay: '0.2s' }}>R</span>
              <span className="title-letter" style={{ animationDelay: '0.3s' }}>I</span>
            </h1>
            <div className="title-line"></div>
            <p className="main-subtitle">District Investment Readiness Index</p>
            <p className="main-description">
              Machine learning-powered framework for identifying optimal FDI destinations across Indian districts
            </p>
          </div>
          
          {/* Animated Stats Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-icon">📍</div>
              <div className="stat-content">
                <div className="stat-value">668</div>
                <div className="stat-label">Districts Analyzed</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon">🗺️</div>
              <div className="stat-content">
                <div className="stat-value">32</div>
                <div className="stat-label">States & UTs</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">R² 0.82</div>
                <div className="stat-label">ML Accuracy</div>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-icon">🚀</div>
              <div className="stat-content">
                <div className="stat-value">162</div>
                <div className="stat-label">Early Movers</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/districts')}>
              <span>Explore Districts</span>
              <span className="cta-arrow">→</span>
            </button>
            <button className="cta-secondary" onClick={() => navigate('/analytics')}>
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="cards-section">
          <div className="section-header">
            <span className="section-badge">📊</span>
            <h2 className="section-heading">Explore Dashboards</h2>
            <p className="section-subheading">Comprehensive visualization tools for investment decision-making</p>
          </div>
          <div className="cards-grid">
            {dashboards.map((dash, idx) => (
              <div 
                key={idx} 
                className="dash-card"
                onClick={() => navigate(dash.path)}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="card-glow" style={{ background: dash.gradient }}></div>
                <div className="card-shine"></div>
                <div className="card-content">
                  <div className="card-icon-wrapper" style={{ background: dash.gradient }}>
                    <span className="card-icon">{dash.icon}</span>
                  </div>
                  <h3 className="card-title">{dash.title}</h3>
                  <p className="card-desc">{dash.description}</p>
                  <div className="card-btn" style={{ color: dash.color }}>
                    Explore <span className="arrow">→</span>
                  </div>
                </div>
                <div className="card-corner card-corner-tl"></div>
                <div className="card-corner card-corner-tr"></div>
                <div className="card-corner card-corner-bl"></div>
                <div className="card-corner card-corner-br"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="team-section">
          <div className="section-header">
            <span className="section-badge">👥</span>
            <h2 className="section-heading">Project Team</h2>
            <p className="section-subheading">MBA Business Analytics | NMIMS Mumbai</p>
          </div>
          <div className="team-info">
            <div className="team-badge-large">
              <span className="team-icon">🎓</span>
              <span>Group 10</span>
            </div>
            <div className="team-meta">
              <div className="team-meta-item">
                <span className="meta-icon">📚</span>
                <span>MBA Business Analytics</span>
              </div>
              <div className="dot">•</div>
              <div className="team-meta-item">
                <span className="meta-icon">🏛️</span>
                <span>Division B</span>
              </div>
              <div className="dot">•</div>
              <div className="team-meta-item">
                <span className="meta-icon">📅</span>
                <span>February 2026</span>
              </div>
            </div>
            <div className="team-description">
              <p>Analytics Project | Predictive Analytics for Foreign Direct Investment</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <div className="footer-content">
            <div className="footer-logo">
              <h3>DIRI</h3>
              <p>District Investment Readiness Index</p>
            </div>
            <div className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/districts'); }}>Districts</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/analytics'); }}>Analytics</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/factors'); }}>Factors</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/maps'); }}>Maps</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 DIRI Project | NMIMS Mumbai | All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
