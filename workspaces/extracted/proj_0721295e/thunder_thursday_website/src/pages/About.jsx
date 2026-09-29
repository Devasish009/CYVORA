// src/pages/About.jsx

const About = () => {
  return (
    <div style={{ position: 'relative' }}>
      
      {/* ---------------- SECTION 1: Slide 4 / 8 About Text Mockup ---------------- */}
      <section className="section-padding animate-fade-in-up" style={{ textAlign: 'center', maxWidth: '800px', marginInline: 'auto', paddingTop: '30px' }}>
        
        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>
          ABOUT
        </h2>
        <h4 style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', fontWeight: '700', fontFamily: 'var(--font-display)', marginBottom: '30px', textTransform: 'capitalize' }}>
          About the Thunder Thursday Event
        </h4>

        {/* Content Paragraphs - exactly matching Slide 4/8 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'justify', lineHeight: '1.7', fontSize: '0.98rem', color: 'var(--text-primary)' }}>
          <p>
            Thunder Thursday is a high-energy cultural celebration focused on community, rhythm, and shared experience. It’s an event where music, movement, and spirit come together to transform a normal weekday into something memorable.
          </p>
          <p>
            This fest isn’t just performances. It brings people together in a wave of energy – voices, smiles, and enthusiasm that light up the space. The atmosphere is lively and expressive, with students and attendees competing, dancing, cheering, and engaging in creative displays.
          </p>
          <p style={{ marginBottom: '20px' }}>
            Over time, Thunder Thursday has grown into a signature moment for communities like college campuses, where it celebrates unity and vibrancy, sometimes with an international twist and cultural diversity woven into the experience
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
