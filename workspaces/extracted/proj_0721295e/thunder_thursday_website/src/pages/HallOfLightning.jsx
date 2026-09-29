// src/pages/HallOfLightning.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import api from '../api';
import { Play, Pause, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const HallOfLightning = ({ setPage, onBack }) => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [reels, setReels] = useState([]);
  

  
  const timerRef = useRef(null);

  // Sync images in real-time from Firebase (or mock engine) with Express backend attempt first
  useEffect(() => {
    let unsubscribeFirebase;
    const fetchGallery = async () => {
      try {
        const res = await api.getHighlights();
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(img => ({
            ...img,
            url: img.image_url || img.url || ''
          }));
          setImages(mapped);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.warn("Express highlights failed, falling back to Firebase subscription:", err);
        // Fallback to Firebase real-time subscription
        unsubscribeFirebase = db.subscribeGalleryImages((data) => {
          setImages(data);
        });
      }
    };

    fetchGallery();

    const fetchReels = async () => {
      try {
        const list = await db.getHighlightReels();
        setReels(list);
      } catch (e) {
        console.warn("Failed to load highlight reels:", e);
      }
    };
    fetchReels();

    return () => {
      if (typeof unsubscribeFirebase === 'function') unsubscribeFirebase();
    };
  }, []);

  // Auto-play slideshow timer
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 5000); // 5s slide transitions
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, images]);

  const handleNext = () => {
    if (images.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 'auto', overflowX: 'hidden' }}>
      
      {/* Decorative glows in background */}
      <div className="glow-bg-radial" style={{ top: '10%', left: '-5%', width: '450px', height: '450px', opacity: 0.15 }}></div>
      <div className="glow-bg-radial" style={{ bottom: '20%', right: '-5%', width: '450px', height: '450px', opacity: 0.15 }}></div>

      <section className="section-padding animate-fade-in-up" style={{ paddingTop: '0px', paddingBottom: '30px', maxWidth: '1200px', marginInline: 'auto' }}>
        
        {/* Back navigation option */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
          <button 
            onClick={onBack || (() => setPage('landing'))}
            style={{
              background: 'rgba(200, 150, 12, 0.08)',
              border: '1.5px solid var(--accent-gold)',
              borderRadius: '20px',
              padding: '6px 16px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
            className="back-btn"
          >
            ← Back to Home
          </button>
        </div>

        {/* Cinematic Header matching Slides 27/28 */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingInline: '10px' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.4rem, 6.2vw, 3rem)', 
            fontWeight: '900', 
            textTransform: 'uppercase', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            HALL OF <span style={{ color: 'var(--accent-gold)' }}>LIGHTNING</span> <Zap size={22} fill="var(--accent-gold)" style={{ color: 'var(--accent-gold)' }} />
          </h2>
          <p style={{ 
            fontFamily: 'var(--font-cursive)',
            fontSize: 'clamp(0.85rem, 3.8vw, 1.85rem)',
            color: 'var(--tagline-cursive-color)',
            fontWeight: '400',
            marginTop: '8px',
            lineHeight: '1',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            Archive of legendary performances for our community
          </p>
        </div>

        {/* ---------------- 1. DYNAMIC SLIDESHOW CAROUSEL ---------------- */}
        {images.length > 0 ? (
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              height: 'clamp(280px, 50vh, 480px)',
              margin: '0 auto 25px auto',
              borderRadius: 'var(--border-radius-lg)',
              border: '2px solid var(--accent-gold)',
              boxShadow: 'var(--glow-shadow)',
              overflow: 'hidden',
              background: '#050401'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Carousel Inner Track */}
            <div 
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  style={{
                    minWidth: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Cinematic blurred backdrop overlay to fill aspect-ratio gaps */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${img.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(20px) brightness(0.35)',
                      opacity: 0.75,
                      zIndex: 1,
                      transform: 'scale(1.15)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Sharp, centered foreground image (contain ensures zero cropping of performers/text) */}
                  <img 
                    src={img.url} 
                    alt={img.caption} 
                    style={{
                      position: 'relative',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      zIndex: 2,
                      opacity: 0.95,
                      transition: 'scale 6s ease-in-out',
                      boxShadow: '0 0 30px rgba(0,0,0,0.6)'
                    }}
                    className={currentIndex === idx ? 'carousel-zoom-effect' : ''}
                  />

                </div>
              ))}
            </div>

            {/* Carousel Navigation Chevrons */}
            <button 
              onClick={handlePrev}
              style={navArrowStyle('left')}
              className="carousel-arrow-btn"
              title="Previous Slide"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={handleNext}
              style={navArrowStyle('right')}
              className="carousel-arrow-btn"
              title="Next Slide"
            >
              <ChevronRight size={24} />
            </button>

            {/* Play/Pause Autoplay Overlay Indicator */}
            <button
              onClick={() => setIsPlaying(prev => !prev)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(14, 11, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(200, 150, 12, 0.4)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                zIndex: 20
              }}
              className="carousel-play-pause"
              title={isPlaying ? "Pause Autoplay" : "Play Autoplay"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
            </button>

            {/* Autoplay Active Progress Bar Overlay */}
            {isPlaying && !hovered && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                backgroundColor: 'var(--accent-gold)',
                width: '100%',
                animation: 'carousel-timer 3.5s linear infinite',
                transformOrigin: 'left',
                zIndex: 25
              }}></div>
            )}

            {/* Indicators Dots */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '40px',
              display: 'flex',
              gap: '8px',
              zIndex: 30
            }}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  style={{
                    background: currentIndex === idx ? 'var(--accent-gold)' : 'rgba(250, 245, 228, 0.35)',
                    border: 'none',
                    borderRadius: '4px',
                    width: currentIndex === idx ? '24px' : '8px',
                    height: '8px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '960px', height: '350px', margin: '0 auto 60px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(200, 150, 12, 0.05)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--accent-gold)' }}>
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              <Zap size={36} style={{ color: 'var(--accent-gold)', marginBottom: '10px', animation: 'spin 2s linear infinite' }} />
              <p style={{ fontWeight: '700' }}>Synchronizing image repository with Firebase database...</p>
            </div>
          </div>
        )}

        {/* ---------------- 2. HIGHLIGHT REELS SECTION ---------------- */}
        <div style={{ maxWidth: '960px', margin: '40px auto 0 auto', textAlign: 'left' }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '900',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold)',
            marginBottom: '20px',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Highlight Reels
          </h3>

          {reels.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reels.map((reel) => (
                <div 
                  key={reel.id}
                  className="highlight-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1.5px solid var(--glass-border)',
                    borderRadius: '20px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '800', 
                      letterSpacing: '0.08em', 
                      color: 'var(--text-secondary)'
                    }}>
                      THUNDERCLAPS OF
                    </span>
                    <span style={{ 
                      fontSize: '1.05rem', 
                      fontWeight: '800', 
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {reel.date}
                    </span>
                  </div>

                  <a 
                    href={reel.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--accent-gold)',
                      textDecoration: 'none',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      background: 'rgba(200, 150, 12, 0.08)',
                      border: '1px solid rgba(200, 150, 12, 0.3)',
                      borderRadius: '15px',
                      padding: '8px 18px',
                      transition: 'var(--transition-smooth)'
                    }}
                    className="watch-reel-btn"
                  >
                    <span>Highlight Reel</span>
                    <Play size={14} fill="currentColor" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: '30px', 
              textAlign: 'center', 
              background: 'rgba(255, 255, 255, 0.01)', 
              borderRadius: '20px', 
              border: '1px dashed var(--glass-border)',
              color: 'var(--text-muted)' 
            }}>
              No highlight reels posted yet.
            </div>
          )}
        </div>

      </section>

      {/* Page Inline CSS for interactive elements, hover dimensions, and wave animations */}
      <style>{`
        /* Carousel chevrons transition glow */
        .carousel-arrow-btn {
          opacity: 0.65;
        }
        .carousel-arrow-btn:hover {
          opacity: 1 !important;
          background: rgba(14, 11, 0, 0.85) !important;
          color: var(--accent-gold) !important;
          box-shadow: 0 0 15px rgba(200, 150, 12, 0.3) !important;
        }
        .carousel-play-pause:hover {
          transform: scale(1.08);
          color: var(--accent-gold) !important;
          border-color: var(--accent-gold) !important;
        }

        /* Carousel zoom effect on active frame */
        .carousel-zoom-effect {
          scale: 1.05;
          transition: scale 7s cubic-bezier(0.1, 0.8, 0.2, 1) !important;
        }

        /* Hover dimensions for highlight cards */
        .highlight-card {
          transition: var(--transition-smooth) !important;
        }
        .highlight-card:hover {
          border-color: var(--accent-gold) !important;
          background: rgba(200, 150, 12, 0.04) !important;
          box-shadow: var(--glow-shadow) !important;
        }
        .watch-reel-btn {
          transition: var(--transition-smooth);
        }
        .watch-reel-btn:hover {
          background: var(--accent-gold) !important;
          color: #0E0B00 !important;
          box-shadow: 0 4px 12px rgba(200, 150, 12, 0.25) !important;
          transform: translateY(-1px);
        }
        .watch-reel-btn:active {
          transform: translateY(0);
        }

        /* Back to Home Button interactions */
        .back-btn:hover {
          background: var(--accent-gold) !important;
          color: #0E0B00 !important;
          box-shadow: 0 4px 12px rgba(200, 150, 12, 0.25) !important;
          transform: translateX(-2px);
        }
        .back-btn:active {
          transform: translateX(0);
        }

        /* Wave dance simulation for playing video */
        @keyframes wave-dance {
          0% {
            height: 10px;
            transform: scaleY(1);
          }
          100% {
            height: 80px;
            transform: scaleY(1.2);
          }
        }

        /* Autoplay timer bar animation matching 3.5s cycle */
        @keyframes carousel-timer {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* Spin animation */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .watch-reel-btn {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }
        }

        /* Close Button Modal Interaction */
        .close-modal-btn:hover {
          background: rgba(230, 50, 50, 0.1) !important;
          color: #e63232 !important;
          border-color: rgba(230, 50, 50, 0.3) !important;
          transform: rotate(90deg);
        }
      `}</style>
    </div>
  );
};

// Helper style builder for arrows
const navArrowStyle = (direction) => ({
  position: 'absolute',
  top: '50%',
  [direction]: '20px',
  transform: 'translateY(-50%)',
  background: 'rgba(14, 11, 0, 0.55)',
  backdropFilter: 'blur(6px)',
  border: '1.5px solid rgba(250, 245, 228, 0.15)',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FAF5E4',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  zIndex: 10
});

export default HallOfLightning;
