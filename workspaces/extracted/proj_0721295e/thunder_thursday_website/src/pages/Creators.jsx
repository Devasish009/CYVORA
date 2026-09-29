// src/pages/Creators.jsx
import { useState } from 'react';
import { Zap } from 'lucide-react';

// Custom inline SVG icons matching mockups perfectly
const GithubIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ color: 'var(--text-primary)' }}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="url(#insta-grad)" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="insta-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#0A66C2" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="#0A66C2" />
    <rect width="4" height="12" x="2" y="9" rx="1" fill="#0A66C2" />
    <circle cx="4" cy="4" r="2" fill="#0A66C2" />
  </svg>
);

const PortfolioIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="var(--accent-gold)" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

const Creators = () => {
  const [thunderMode, setThunderMode] = useState(false);

  const developers = [
    {
      firstName: "Sriram",
      lastName: "Pinninti",
      rollNo: "24B11AI348",
      role: "Second-year undergraduate specializing in Artificial Intelligence and Machine Learning.",
      bio: "A second-year undergraduate specializing in Artificial Intelligence and Machine Learning. I'm focused on building strong skills in programming, data, designing, and real-world projects to grow as a tech professional.",
      github: "https://github.com/SP-1512",
      linkedin: "https://www.linkedin.com/in/sriram-pinninti/",
      instagram: "https://www.instagram.com/sriram.pinninti/",
      portfolio: "https://sriram-portfolio-gamma.vercel.app/",
      avatar: "/sriram_profile.png"
    },
    {
      firstName: "Devasish",
      lastName: "Jajimoggala",
      rollNo: "24B11CS159",
      role: "Second-year Computer Science Engineering student.",
      bio: "Second-year Computer Science Engineering student driven by curiosity and real-world development. Actively improving programming and software development skills through practical projects and continuous learning.",
      github: "https://github.com/Devasish009",
      linkedin: "https://www.linkedin.com/in/devasishjajimoggala/",
      instagram: "https://www.instagram.com/_devasish_009/",
      portfolio: "https://devaverse.netlify.app/",
      avatar: "/devasish_profile.jpeg"
    },
    {
      firstName: "Charan",
      lastName: "Kondavaripalli",
      rollNo: "24B11AI195",
      role: "Second-year undergraduate specializing in Artificial Intelligence and Machine Learning.",
      bio: "A second-year undergraduate in Artificial Intelligence and Machine Learning with a strong interest in practical problem-solving. Actively developing skills in programming, data analysis, and hands-on projects to prepare for real-world tech challenges.",
      github: "https://github.com/kumarcharanreddy",
      linkedin: "https://www.linkedin.com/in/charan-kumar-reddy-kondavaripalli-a824a0336/",
      instagram: "https://www.instagram.com/charan.3665?igsh=ZzlhaDNpMnliNDN4",
      portfolio: "https://charanportfoliocomplete.vercel.app/",
      avatar: "/charan_profile.jpeg"
    }
  ];

  const triggerThunder = () => {
    setThunderMode(true);
    setTimeout(() => {
      setThunderMode(false);
    }, 1500);
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      <div className="glow-bg-radial" style={{ top: '25%', left: '-10%' }}></div>
      <div className="glow-bg-radial" style={{ bottom: '15%', right: '-15%' }}></div>

      {/* Screen Lightning Flash Overlay for Easter Egg */}
      {thunderMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minWidth: '100vw',
          minHeight: '100vh',
          backgroundColor: '#FAF5E4',
          zIndex: 9999,
          opacity: 0.85,
          pointerEvents: 'none',
          animation: 'flash 0.4s ease-out 3'
        }}>
          <style>{`
            @keyframes flash {
              0%, 100% { opacity: 0; }
              50% { opacity: 0.9; }
            }
          `}</style>
        </div>
      )}

      <section className="section-padding animate-fade-in-up" style={{ textAlign: 'center', paddingTop: '40px' }}>
        
        {/* Mockup Title Header exact to Slides 27/28 */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.85rem', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-gold)' }}>CREATORS</span> <Zap size={28} fill="var(--accent-gold)" style={{ color: 'var(--accent-gold)' }} />
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '8px' }}>
            People Behind the Thunder Thursday App and Website
          </p>
        </div>

        {/* Easter Egg Trigger */}
        <div style={{ marginBottom: '50px' }}>
          <button 
            onClick={triggerThunder} 
            className="btn-primary animate-pulse-glow"
            style={{
              padding: '10px 24px',
              borderRadius: '30px',
              fontFamily: 'var(--font-display)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderColor: 'var(--accent-gold)',
              fontSize: '0.9rem',
              fontWeight: '800'
            }}
          >
            <Zap size={16} fill="currentColor" /> Activate Thunder Mode!
          </button>
        </div>

        {/* Profiles Grid - Highly responsive 3-column stack */}
        <div className="grid-3" style={{ maxWidth: '1100px', margin: '0 auto', gap: '30px', alignItems: 'stretch' }}>
          {developers.map((dev, idx) => (
            <div 
              key={idx} 
              className="mockup-card" 
              style={{ 
                padding: '35px 25px', 
                background: 'var(--bg-card)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'space-between',
                borderColor: 'var(--accent-gold)',
                borderWidth: '2px'
              }}
            >
              {/* Profile Header */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {dev.avatar && (
                  <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '20px' }}>
                    <img 
                      src={dev.avatar} 
                      alt={`${dev.firstName} ${dev.lastName}`} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        border: '3px solid var(--accent-gold)', 
                        objectFit: 'cover', 
                        boxShadow: 'var(--glow-shadow)',
                        background: 'var(--bg-secondary)'
                      }} 
                    />
                  </div>
                )}

                <h3 style={{ fontSize: '1.65rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: '1.25' }}>
                  {dev.firstName}
                  <br />
                  <span style={{ color: 'var(--accent-gold)' }}>{dev.lastName}</span>
                </h3>
                {dev.rollNo && (
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '15px', letterSpacing: '0.05em' }}>
                    Roll Number: <span style={{ color: 'var(--accent-gold)' }}>{dev.rollNo}</span>
                  </div>
                )}

                <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px', textAlign: 'left', fontWeight: '500' }}>
                  {dev.bio}
                </p>
              </div>

              {/* Mockup Social Links Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 25px', width: '100%', maxWidth: '270px', marginTop: '10px', padding: '10px 0' }}>
                
                <a href={dev.github} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left' }}>
                  <GithubIcon size={18} /> <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent-gold)' }}>Github</span>
                </a>

                <a href={dev.instagram} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left' }}>
                  <InstagramIcon size={18} /> <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent-gold)' }}>Instagram</span>
                </a>

                <a href={dev.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left', gridColumn: dev.portfolio ? 'span 1' : 'span 2' }}>
                  <LinkedinIcon size={18} /> <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent-gold)' }}>LinkedIn</span>
                </a>

                {dev.portfolio && (
                  <a href={dev.portfolio} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', textAlign: 'left' }}>
                    <PortfolioIcon size={18} /> <span style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent-gold)' }}>Portfolio</span>
                  </a>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* Special Mention Section */}
        <div style={{ marginTop: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="glass-card" style={{
            maxWidth: '650px',
            width: '90%',
            padding: '25px 35px',
            borderColor: 'var(--accent-gold)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--card-shadow)'
          }}>
            <h4 style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              fontFamily: 'var(--font-display)',
              marginBottom: '10px',
              letterSpacing: '0.05em'
            }}>
              Special Mention
            </h4>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: '500',
              lineHeight: '1.6',
              marginBottom: '15px'
            }}>
              Special thanks to <strong style={{ color: 'var(--accent-gold)', fontWeight: '800' }}>Jyothiesh Kasala</strong> for creating the demo prototype that laid the foundation for this website.
            </p>
            <a 
              href="https://www.linkedin.com/in/jyothiesh-kasala" 
              target="_blank" 
              rel="noreferrer" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-primary)', 
                textDecoration: 'none', 
                fontWeight: '700', 
                fontSize: '0.9rem',
                backgroundColor: 'rgba(200, 150, 12, 0.15)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(200, 150, 12, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <LinkedinIcon size={16} /> 
              <span>LinkedIn Profile</span>
            </a>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Creators;
