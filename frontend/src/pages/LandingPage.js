import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ScanLine, Target, Activity, Zap, Shield, Star } from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">S</div>
          SORA
        </Link>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Testimonials</a>
        </nav>
        <div className="landing-actions">
          <Link to="/login" className="btn-secondary btn-sm" style={{ border: "none" }}>Sign In</Link>
          <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge">
          <Sparkles size={16} /> AI-Powered Career Platform
        </div>
        <h1 className="hero-title">SORA</h1>
        <h2 className="hero-subtitle">Where your future begins</h2>
        <p className="hero-desc">
          The intelligent platform that matches top talent with perfect opportunities. AI-powered resume screening, smart job matching, and career insights — all in one place.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            Get Started as Candidate <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary">
            Recruiter Portal <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-value">50K+</div>
          <div className="stat-label">Jobs Posted</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">100K+</div>
          <div className="stat-label">Candidates</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">95%</div>
          <div className="stat-label">Match Accuracy</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <div className="section-header">
          <div className="badge"><Sparkles size={16}/> Powerful Features</div>
          <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>Everything you need to succeed</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
            From AI resume parsing to intelligent job matching, SORA provides all the tools for your career success.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><ScanLine size={24} /></div>
            <h3 className="feature-title">AI-Powered Analysis</h3>
            <p className="feature-desc">Advanced machine learning algorithms parse resumes and match candidates to jobs with 95%+ accuracy.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Activity size={24} /></div>
            <h3 className="feature-title">Smart Resume Parsing</h3>
            <p className="feature-desc">Extract skills, experience, and qualifications automatically from any resume format.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Target size={24} /></div>
            <h3 className="feature-title">Precision Matching</h3>
            <p className="feature-desc">Get matched to the perfect opportunities based on your unique skills and career goals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Sparkles size={24} /></div>
            <h3 className="feature-title">ATS Score Optimization</h3>
            <p className="feature-desc">Improve your resume's visibility with our detailed ATS compatibility scoring.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Zap size={24} /></div>
            <h3 className="feature-title">Instant Applications</h3>
            <p className="feature-desc">Apply to multiple jobs with a single click using your optimized profile.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield size={24} /></div>
            <h3 className="feature-title">Privacy First</h3>
            <p className="feature-desc">Your data is encrypted and never shared without your explicit consent.</p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <div className="badge">Simple Process</div>
          <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>How it works</h2>
          <p style={{ color: "var(--text-muted)" }}>
            Get started in minutes and let our AI do the heavy lifting.
          </p>
        </div>
        
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">01</div>
            <h3 className="step-title">Upload Resume</h3>
            <p className="step-desc">Simply drag and drop your resume in PDF format. Our system handles the rest.</p>
          </div>
          <div className="step-item">
            <div className="step-number">02</div>
            <h3 className="step-title">AI Extraction</h3>
            <p className="step-desc">Our AI instantly extracts your skills, experience, and qualifications.</p>
          </div>
          <div className="step-item">
            <div className="step-number">03</div>
            <h3 className="step-title">Get Matched</h3>
            <p className="step-desc">Receive personalized job recommendations ranked by compatibility.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-header">
           <div className="badge"><Star size={16}/> Testimonials</div>
           <h2 style={{ fontSize: "36px", marginBottom: "16px" }}>Loved by thousands</h2>
           <p style={{ color: "var(--text-muted)" }}>See what our users have to say about their experience with SORA.</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="rating">
               {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="testimonial-text">"SORA helped me land my dream job in just 2 weeks. The AI matching is incredibly accurate!"</p>
            <div className="testimonial-author">
               <div className="author-avatar">KC</div>
               <div className="author-info">
                  <h4>Sarah Chen</h4>
                  <p>Software Engineer at Google</p>
               </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="rating">
               {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="testimonial-text">"As a recruiter, SORA has cut our time-to-hire by 60%. The candidate quality is exceptional."</p>
            <div className="testimonial-author">
               <div className="author-avatar">MJ</div>
               <div className="author-info">
                  <h4>Marcus Johnson</h4>
                  <p>HR Director at Microsoft</p>
               </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="rating">
               {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="testimonial-text">"The ATS optimization feature alone is worth it. My resume score went from 45 to 92!"</p>
            <div className="testimonial-author">
               <div className="author-avatar">ER</div>
               <div className="author-info">
                  <h4>Emily Rodriguez</h4>
                  <p>Product Manager at Meta</p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
