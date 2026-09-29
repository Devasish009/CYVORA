// src/pages/Feedback.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { Star, Check, RefreshCw, MessageSquare, Send, ShieldAlert, Clock } from 'lucide-react';

const Feedback = ({ user, setPage, sessionId, lastEnabledAt, feedbackEnabled }) => {
  const [feedbackRating, setFeedbackRating] = useState(0);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [hoveredFeedbackStars, setHoveredFeedbackStars] = useState(0);
  const [feedbackLocked, setFeedbackLocked] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setCheckingStatus(false);
        return;
      }
      
      // Reset local submission state when a new session or enablement occurs
      setFeedbackSubmitted(false);
      
      const lastEnabledTime = lastEnabledAt ? (lastEnabledAt.seconds ? lastEnabledAt.seconds * 1000 : new Date(lastEnabledAt).getTime()) : 0;
      const lockKey = `${sessionId}_${lastEnabledTime}`;

      // Check local cache first
      const localLock = localStorage.getItem(`tt_feedback_locked_${user.email}`);
      if (localLock === lockKey) {
        setFeedbackLocked(true);
        setCheckingStatus(false);
        return;
      } else {
        setFeedbackLocked(false);
      }

      try {
        const hasSubmitted = await db.checkUserFeedbackStatus(user.email, user.uid, sessionId, lastEnabledAt);
        if (hasSubmitted) {
          setFeedbackLocked(true);
          localStorage.setItem(`tt_feedback_locked_${user.email}`, lockKey);
        }
      } catch (err) {
        console.warn("Could not check user feedback status from database:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, [user, sessionId, lastEnabledAt]);




  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    setFeedbackError('');
    
    // Resolve actual student name and roll number from localStorage cache
    let studentName = 'Anonymous Student';
    let studentRoll = '';
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.name) studentName = profile.name;
          if (profile.rollNo) studentRoll = profile.rollNo;
          else if (profile.roll_number) studentRoll = profile.roll_number;
        } catch { /* ignore */ }
      }
      if (studentName === 'Anonymous Student' && user.displayName) {
        studentName = user.displayName;
      }
    }
    try {
      const feedbackData = {
        rating: feedbackRating,
        comments: feedbackText,
        email: user?.email || 'Anonymous',
        name: studentName,
        rollNo: studentRoll,
        userId: user?.uid || 'guest',
        sessionId: sessionId || 'event_feedback_session'
      };
      await db.submitEventFeedback(feedbackData);
      setFeedbackSubmitted(true);
      setFeedbackLocked(true);
      if (user) {
        const lastEnabledTime = lastEnabledAt ? (lastEnabledAt.seconds ? lastEnabledAt.seconds * 1000 : new Date(lastEnabledAt).getTime()) : 0;
        const lockKey = `${sessionId}_${lastEnabledTime}`;
        localStorage.setItem(`tt_feedback_locked_${user.email}`, lockKey);
      }
      setFeedbackRating(0);
      setFeedbackText('');
    } catch (err) {
      setFeedbackError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: 'auto', overflowX: 'hidden' }}>
      
      {/* storm glows background */}
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', top: '10%', left: '-5%', width: '400px', height: '400px', opacity: 0.12 }}></div>
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', bottom: '15%', right: '-5%', width: '400px', height: '400px', opacity: 0.12 }}></div>

      <section className="animate-fade-in-up feedback-section" style={{ padding: '0px 8% 40px 8%', marginTop: '20px' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', paddingTop: '0px', marginTop: '0px' }}>
          
          {/* Header section matching Slides 27/28 */}
          <div style={{ textAlign: 'center', marginBottom: '25px', paddingInline: '10px' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.4rem, 6.2vw, 2.5rem)', 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              whiteSpace: 'nowrap'
            }}>
              EVENT <span style={{ color: 'var(--accent-gold)' }}>FEEDBACK</span> <MessageSquare size={20} style={{ color: 'var(--accent-gold)' }} />
            </h2>
            <p style={{ 
              fontFamily: 'var(--font-cursive)',
              fontSize: 'clamp(0.8rem, 3.6vw, 1.65rem)',
              color: 'var(--tagline-cursive-color)',
              fontWeight: '400',
              marginTop: '6px',
              lineHeight: '1',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>
              Let us know how your Thunder Thursday experience was
            </p>
          </div>

          <div className="mockup-card" style={{ padding: '20px 25px 25px 25px', background: 'var(--bg-card)', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            
            {!feedbackEnabled ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 150, 12, 0.1)', border: '2px solid var(--accent-gold)', color: 'var(--accent-gold)', marginBottom: '20px' }}>
                  <Clock size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>Feedback Portal Closed</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                  The event feedback portal is currently inactive. It will be enabled dynamically by the admin during active showcase segments.
                </p>
              </div>
            ) : !user ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(230, 50, 50, 0.1)', border: '2px solid #e63232', color: '#e63232', marginBottom: '20px' }}>
                  <ShieldAlert size={28} style={{ transform: 'none' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>Authentication Required</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                  To guarantee feedback integrity, you must be logged in with a valid student account to submit event reviews.
                </p>
                <button 
                  onClick={() => setPage('login')} 
                  className="btn-primary" 
                  style={{
                    padding: '8px 24px',
                    fontSize: '0.82rem',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(200, 150, 12, 0.2)'
                  }}
                >
                  Sign In to Provide Feedback
                </button>
              </div>
            ) : checkingStatus ? (
              <div style={{ textAlign: 'center', padding: '50px 10px' }}>
                <RefreshCw size={36} className="animate-spin-custom" style={{ color: 'var(--accent-gold)', marginInline: 'auto' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '12px' }}>Verifying feedback status...</p>
              </div>
            ) : feedbackLocked || feedbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(75, 180, 75, 0.1)', border: '2px solid #4bb44b', color: '#4bb44b', marginBottom: '20px' }}>
                  <Check size={28} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>Feedback Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 10px auto', lineHeight: '1.5' }}>
                  Thank you! Your feedback has been recorded and locked on the ledger. You can only submit one response per student account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
                
                {feedbackError && (
                  <div style={{ padding: '10px 14px', background: 'rgba(230, 50, 50, 0.1)', border: '1px solid #e63232', color: '#e63232', borderRadius: '8px', fontSize: '0.8rem' }}>
                    {feedbackError}
                  </div>
                )}

                {/* Rating Stars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    How would you rate the overall event? *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = star <= (hoveredFeedbackStars || feedbackRating);
                      return (
                        <Star
                          key={star}
                          size={26}
                          style={{
                            cursor: 'pointer',
                            color: isHighlighted ? 'var(--accent-gold)' : 'var(--text-muted)',
                            fill: isHighlighted ? 'var(--accent-gold)' : 'none',
                            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}
                          onMouseEnter={() => setHoveredFeedbackStars(star)}
                          onMouseLeave={() => setHoveredFeedbackStars(0)}
                          onClick={() => setFeedbackRating(star)}
                        />
                      );
                    })}
                    {feedbackRating > 0 && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: '800', marginLeft: '6px' }}>
                        {feedbackRating} / 5 Stars
                      </span>
                    )}
                  </div>
                </div>


                {/* Comments & Suggestions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="feedback-text" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Comments, suggestions or improvements? *
                  </label>
                  <textarea
                    id="feedback-text"
                    rows={4}
                    required
                    placeholder="Share your thoughts on the event (sound quality, lighting, organization, scheduling, etc.)..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1.5px solid var(--glass-border)',
                      color: '#FAF5E4',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                  <button
                    type="submit"
                    disabled={feedbackLoading || feedbackRating === 0}
                    className="btn-primary"
                    style={{
                      padding: '8px 24px',
                      fontSize: '0.82rem',
                      borderRadius: '20px',
                      background: feedbackRating === 0 ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)',
                      border: 'none',
                      cursor: (feedbackLoading || feedbackRating === 0) ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: feedbackRating === 0 ? 'none' : '0 4px 12px rgba(200, 150, 12, 0.2)'
                    }}
                  >
                    {feedbackLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin-custom" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={14} /> Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>



        </div>
      </section>
    </div>
  );
};

export default Feedback;
