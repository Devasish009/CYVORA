// src/pages/ApplyAndShine.jsx

const ApplyAndShine = ({ setPage }) => {
  return (
    <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Decorative shimmering ambient glows */}
      <div className="glow-bg-radial" style={{ top: '15%', left: '10%', width: '400px', height: '400px' }}></div>
      <div className="glow-bg-radial" style={{ bottom: '15%', right: '10%', width: '400px', height: '400px' }}></div>

      {/* Slide Watermark Background BE. THE. NEXT. STAR. */}
      <div className="watermark-unleash"></div>

      <section className="section-padding animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '1000px', marginInline: 'auto', zIndex: 5, paddingBottom: '60px' }}>
        
        {/* Double-Line Canva Styled Title Heading */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '2.8rem', 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            color: 'var(--text-primary)', 
            lineHeight: '1.1',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}>
            UNLEASH YOUR
          </h2>
          <h2 style={{ 
            fontSize: '2.8rem', 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            color: 'var(--accent-gold)', 
            lineHeight: '1.1',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em'
          }}>
            INNER STAR
          </h2>
        </div>

        {/* Verbatim Requested Introduction Text */}
        <p style={{ 
          fontSize: '1.05rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '780px', 
          margin: '0 auto 45px auto', 
          lineHeight: '1.7',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Thunder Thursday is your canvas. Whether you sing, dance, act, or innovate, this is your official gateway to lock your slot and showcase your talent to the entire campus crowd.
        </p>

        {/* Double Gold-bordered Cards Grid (Side-by-Side Flex) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px', 
          maxWidth: '920px', 
          margin: '0 auto 50px auto', 
          flexWrap: 'wrap',
          width: '100%'
        }}>
          
          {/* APPLY Card */}
          <div className="mockup-card" style={{ 
            flex: '1 1 420px', 
            minWidth: '280px',
            border: '2px solid var(--accent-gold)', 
            borderRadius: '20px', 
            padding: '28px 30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '25px', 
            background: 'var(--bg-card)', 
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <span style={{ 
              fontSize: '1.85rem', 
              fontWeight: '900', 
              color: 'var(--accent-gold)', 
              fontFamily: 'var(--font-display)', 
              letterSpacing: '0.05em',
              lineHeight: '1',
              flexShrink: 0
            }}>
              APPLY
            </span>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-primary)', 
              lineHeight: '1.5',
              margin: 0,
              fontWeight: '500'
            }}>
              Submit your talent via the form. Be as detailed as possible about your act.
            </p>
          </div>

          {/* SHINE Card */}
          <div className="mockup-card" style={{ 
            flex: '1 1 420px', 
            minWidth: '280px',
            border: '2px solid var(--accent-gold)', 
            borderRadius: '20px', 
            padding: '28px 30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '25px', 
            background: 'var(--bg-card)', 
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <span style={{ 
              fontSize: '1.85rem', 
              fontWeight: '900', 
              color: 'var(--accent-gold)', 
              fontFamily: 'var(--font-display)', 
              letterSpacing: '0.05em',
              lineHeight: '1',
              flexShrink: 0
            }}>
              SHINE
            </span>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--text-primary)', 
              lineHeight: '1.5',
              margin: 0,
              fontWeight: '500'
            }}>
              Walk on stage and unleash your inner star to the entire campus crowd.
            </p>
          </div>

        </div>

        {/* Centered Pill Gold Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setPage('register')} 
            className="btn-primary" 
            style={{ 
              padding: '14px 50px', 
              fontSize: '1.05rem', 
              borderRadius: '30px',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)',
              boxShadow: '0 6px 20px rgba(200, 150, 12, 0.35)',
              cursor: 'pointer',
              border: 'none',
              fontWeight: '800',
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0E0B00',
              transition: 'var(--transition-smooth)'
            }}
          >
            Register Now
          </button>
        </div>

      </section>
    </div>
  );
};

export default ApplyAndShine;
