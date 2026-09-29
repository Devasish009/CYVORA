import { ChevronRight } from 'lucide-react';

const Landing = ({ setPage }) => {

  return (
    <div style={{ position: 'relative' }}>
      
      {/* ---------------- SECTION 1: Main Landing (Slides 2 / 6) ---------------- */}
      <section className="section-padding animate-fade-in-up" style={{ paddingTop: '0px', minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        
        {/* Massive central logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '-10px' }}>
          <img 
            src="/TT logo.png" 
            alt="Thunder Thursday Logo" 
            style={{ width: '100%', maxWidth: '480px', height: 'auto', aspectRatio: '3/2', objectFit: 'contain' }} 
          />
          {/* Cursive Tagline exact to mockups */}
          <div className="cursive-tagline" style={{ marginTop: '10px', fontSize: 'clamp(1.4rem, 4.5vw, 2.1rem)', whiteSpace: 'nowrap', position: 'relative', zIndex: 5 }}>
            Unleash your Inner Star
          </div>
        </div>

        {/* Double Gold-bordered Cards Grid */}
        <div className="grid-2" style={{ width: '100%', maxWidth: '900px', gap: '20px' }}>
          
          {/* Left Card: The Legacy */}
          <div className="mockup-card" style={{ padding: '25px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.38rem', color: 'var(--accent-gold)', marginBottom: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
                The Legacy
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '18px', textAlign: 'justify' }}>
                Thunder Thursday is the heartbeat of student creativity. Every week, the campus lights up as performers take the stage in a tradition of raw talent and electric energy.
              </p>
            </div>
            <div>
              <button onClick={() => setPage('apply_and_shine')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: '0.85rem' }}>
                Join the Legacy
              </button>
            </div>
          </div>

          {/* Right Card: Event Intel */}
          <div className="mockup-card" style={{ padding: '25px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.38rem', color: 'var(--accent-gold)', marginBottom: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
                Event Intel
              </h3>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '18px', textAlign: 'justify' }}>
                Join us at the Campus Hub every Thursday afternoon. The showcase brings together the entire student body. No tickets required–just bring your talent and energy.
              </p>
            </div>
            <div>
              <button onClick={() => setPage('hall_of_lightning')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: '0.85rem' }}>
                VIEW GALLERY
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* Gold Divider Line */}
      <div style={{ width: '84%', height: '2px', backgroundColor: 'rgba(200, 150, 12, 0.25)', margin: '30px auto' }}></div>

      {/* ---------------- SECTION 2: Powering The Stage (Slides 3 / 7) ---------------- */}
      <section className="section-padding" style={{ paddingTop: '10px', paddingBottom: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '0.78rem', letterSpacing: '0.15em', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
            POWERING THE STAGE
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '900', textTransform: 'uppercase' }}>
            THE CREATIVE FORCE
          </h2>
        </div>

        {/* Wide Horizontal Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', margin: '0 auto' }}>
          
          {/* Card 1: Student Activity Council */}
          <div className="mockup-card" style={{ padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
            <div style={{ width: '130px', display: 'flex', justifyContent: 'center', flexShrink: 0 }} className="sac-logo-container">
              {/* Load SAC Logo */}
              <img src="/sac_logo_light.png" alt="SAC Logo" style={{ height: '120px', width: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} />
            </div>
            <div style={{ flex: 1, minWidth: '220px', textAlign: 'left' }} className="sac-card-text">
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.6', textAlign: 'justify' }}>
                The central nervous system of campus life, ensuring every event reaches its peak potential. We bridge the gap between creative student ambition and flawless execution. By providing robust operational support, strategic funding, and leadership mentorship, we transform raw concepts into landmark campus traditions.
              </p>
            </div>
          </div>


        </div>

      </section>

      {/* ---------------- SECTION 4: Live Video / Instagram Reels Teaser ---------------- */}
      <section id="highlight-player" style={{ padding: '60px 8% 80px 8%', textAlign: 'center' }}>
        <h2 className="section-title">Feel the Thunder</h2>
        <p className="section-subtitle">Catch a glimpse of the electric atmosphere, the thunderous cheers, and the sheer talent of last week's show.</p>
        
        <div style={{ maxWidth: '850px', margin: '0 auto', position: 'relative' }} className="mockup-card animate-pulse-glow">
          <div 
            style={{ 
              width: '100%', 
              minHeight: '340px',
              height: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 30px',
              borderRadius: 'var(--border-radius-lg)',
              position: 'relative',
              overflow: 'hidden'
            }} 
          >
            {/* Instagram Reels Glow Accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
            }}></div>

            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#FAF5E4', 
              marginBottom: '18px', 
              boxShadow: '0 0 25px rgba(220, 39, 67, 0.4)' 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </div>
            
            <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Watch Highlights on Instagram Reels
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', maxWidth: '600px', marginBottom: '22px', lineHeight: '1.6', textAlign: 'justify' }}>
              Our official weekly event highlights, crowd reactions, and top talent showcases are now uploaded exclusively on Instagram Reels! Tune in and feel the stage vibes.
            </p>
            
            <a 
              href="https://www.instagram.com/sac_aditya_university/" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-primary" 
              style={{ 
                textDecoration: 'none', 
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', 
                borderColor: 'transparent',
                fontWeight: '800',
                padding: '10px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(220, 39, 67, 0.3)',
                color: '#FAF5E4',
                fontSize: '0.88rem'
              }}
            >
              Visit SAC Instagram Page <ChevronRight size={15} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
