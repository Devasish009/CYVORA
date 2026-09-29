// src/pages/Voting.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { Star, Vote, Check, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

const Voting = ({ user, setPage }) => {
  const [performers, setPerformers] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [voteLoading, setVoteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredStars, setHoveredStars] = useState({});
  const [selectedStars, setSelectedStars] = useState({});


  const fetchRef = useRef(null);

  // 1. Fetch Live Performers directly and exclusively from Cloud Firestore
  useEffect(() => {
    const unsubscribe = db.subscribePerformers((data) => {
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category ? p.category.toLowerCase() : 'music',
        genre: p.genre || p.type || p.category || 'General',
        title: p.description || p.title || p.performance_title || 'Showcase Performance',
        rating: parseFloat(p.rating !== undefined ? p.rating : 0),
        voteCount: parseInt(p.voteCount !== undefined ? p.voteCount : p.vote_count !== undefined ? p.vote_count : 0),
        collegeId: p.college_id || p.collegeId || 'AU'
      }));
      const sorted = [...mapped].sort((a, b) => b.rating - a.rating || b.voteCount - a.voteCount);
      setPerformers(sorted);
    });

    fetchRef.current = (showLoading = false) => {
      if (showLoading) {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
      }
    };

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);


  // 2. Fetch User's existing votes directly and exclusively from Cloud Firestore
  useEffect(() => {
    if (!user) {
      setUserVotes([]);
      return;
    }

    console.log("[Voting] Subscribing to live user votes for uid:", user.uid, "email:", user.email);
    const unsubscribe = db.subscribeUserVotes(user.uid, user.email, (votes) => {
      console.log("[Voting] Received live votes snapshot:", votes);
      const mappedVotes = votes.map(v => ({
        id: v.id,
        category: v.category ? v.category.toLowerCase() : null,
        performerId: v.performerId || v.performance_id || v.performanceId,
        starsRating: v.stars_rating || v.starsRating || v.stars || 5
      }));
      console.log("[Voting] Live mapped votes:", mappedVotes);
      setUserVotes(mappedVotes);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // 3. Handle casting a live vote
  const handleVote = async (performerId, starsCount = 5) => {
    if (!user) {
      setErrorMsg('You must be logged in to cast a vote!');
      return;
    }

    setVoteLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const performer = performers.find(p => p.id === performerId);
      const category = performer ? performer.category : 'general';

      // Cast vote directly and exclusively to Firebase
      await db.castVote(user.uid, performerId, category, starsCount, user.email);
      
      // Optimistically lock UI immediately
      setUserVotes(prev => {
        if (prev.some(v => v.performerId === performerId)) return prev;
        return [...prev, {
          id: `${user.uid || user.id}_${performerId}`,
          category: category,
          performerId: performerId,
          starsRating: starsCount
        }];
      });

      setSuccessMsg(`Vote Locked: You have successfully voted! Thank you for participating. Your selection is permanently locked on the ledger.`);
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cast vote.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setVoteLoading(false);
    }
  };

  // Show all active performers since categories are removed from live voting
  const filteredPerformers = performers;

  useEffect(() => {
    console.log("=== VOTING PAGE DIAGNOSTICS ===");
    console.log("Current user:", user);
    console.log("Current userVotes:", userVotes);
  }, [user, userVotes]);

  const handleManualRefresh = () => {
    if (fetchRef.current) {
      fetchRef.current(true);
    }
  };

  if (performers.length === 0) {
    return (
      <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glow-bg-radial" style={{ top: '20%', left: '15%', width: '400px', height: '400px' }}></div>
        <div className="glow-bg-radial" style={{ bottom: '20%', right: '15%', width: '400px', height: '400px' }}></div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse-ring {
            0% { transform: scale(0.95); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.6; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 15px rgba(200, 150, 12, 0.4)); }
            50% { filter: drop-shadow(0 0 30px rgba(200, 150, 12, 0.8)); }
          }
          @keyframes spin-refresh {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />

        <div className="glass-card standby-panel animate-fade-in-up" style={{ 
          maxWidth: '460px', 
          width: '90%', 
          padding: '30px 24px', 
          textAlign: 'center', 
          border: '2px solid var(--accent-gold)', 
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--card-shadow), var(--glow-shadow)',
          zIndex: 2,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}>
          {/* Visual Graphics Container */}
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px dashed rgba(200, 150, 12, 0.3)',
              animation: 'spin-slow 20s linear infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              border: '1.5px solid rgba(200, 150, 12, 0.15)',
              animation: 'pulse-ring 3s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              width: '110%',
              height: '110%',
              borderRadius: '50%',
              border: '1px solid rgba(200, 150, 12, 0.08)',
              animation: 'pulse-ring 3s cubic-bezier(0.215, 0.610, 0.355, 1) infinite',
              animationDelay: '1.5s'
            }}></div>

            <div 
              className="vote-graphic-circle"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '2px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse-glow 3s ease-in-out infinite',
                boxShadow: 'inset 0 0 10px rgba(200, 150, 12, 0.3)'
              }}
            >
              <Vote size={26} style={{ color: 'var(--accent-gold)', animation: 'animate-float 4s ease-in-out infinite' }} />
            </div>
          </div>

          {/* Texts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-gold) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              No Live Performances Yet
            </h3>
            <p className="cursive-tagline" style={{ 
              fontSize: '1.8rem', 
              color: 'var(--accent-gold)',
              margin: '6px 0 0 0',
              fontStyle: 'normal'
            }}>
              Vote Here After the Performance!
            </p>
          </div>

          {/* Interactive Refresh Trigger */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.85rem',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)',
              boxShadow: '0 4px 15px rgba(200, 150, 12, 0.25)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'var(--transition-smooth)',
              border: 'none'
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin-refresh 0.8s linear infinite' : 'none' }}>
              <RefreshCw size={15} strokeWidth={2.5} />
            </span>
            {refreshing ? 'Checking Live Panel...' : 'Refresh Standby'}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div style={{ position: 'relative' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-refresh {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin-refresh 1s linear infinite;
        }
      `}} />
      <div className="glow-bg-radial" style={{ top: '15%', left: '-10%' }}></div>
      <div className="glow-bg-radial" style={{ bottom: '15%', right: '-10%' }}></div>

      <section className="section-padding animate-fade-in-up">
        <h2 className="section-title">Live Voting</h2>
        <p className="section-subtitle">Real-time crowd decision panel. Watch live vote tallies shift.</p>

        {/* Real-time sync badge */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-20px auto 20px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(75, 180, 75, 0.1)', border: '1px solid #4bb44b', borderRadius: '20px', color: '#4bb44b', fontWeight: '600', fontSize: '0.72rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4bb44b' }} className="animate-ping"></span>
            LIVE VOTE STREAM ONLINE
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div style={{ maxWidth: '750px', margin: '0 auto 20px auto', padding: '12px 18px', background: 'rgba(230, 50, 50, 0.1)', border: '1px solid #e63232', color: '#e63232', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ShieldAlert size={18} /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ maxWidth: '750px', margin: '0 auto 20px auto', padding: '12px 18px', background: 'rgba(75, 180, 75, 0.1)', border: '1px solid #4bb44b', color: '#4bb44b', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Check size={18} /> {successMsg}
          </div>
        )}

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Guest User Warning Banner */}
          {!user && (
            <div className="glass-card" style={{ padding: '12px 18px', marginBottom: '24px', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(var(--accent-gold-rgb), 0.05)', border: '1px dashed var(--accent-gold)', flexWrap: 'wrap' }}>
              <ShieldAlert style={{ color: 'var(--accent-gold)', flexShrink: 0 }} size={20} />
              <div style={{ flex: 1, textAlign: 'left', minWidth: '220px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Authentication Required to Vote</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  To guarantee absolute fairness, Aditya University requires all voters to log in with a valid profile. Guest logs are read-only.
                </p>
              </div>
              <button onClick={() => setPage('login')} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                Sign In & Vote
              </button>
            </div>
          )}

          {/* Note: User Voted Banner and Selector Tabs removed per category removal request */}

          {/* Performers List Dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredPerformers.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
                <Clock size={40} style={{ color: 'var(--accent-gold)', marginBottom: '15px', marginInline: 'auto' }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Lineup Under Preparation</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '350px', margin: '0 auto 20px auto' }}>
                  Performers for this category are registering. Be the first to claim a spot on the stage!
                </p>
                <button onClick={() => setPage('register')} className="btn-primary">
                  Register as Performer
                </button>
              </div>
            ) : (
              filteredPerformers.map((performer, index) => {
                const userVoteForThis = userVotes.find(v => v.performerId === performer.id);
                const isVotedThis = !!userVoteForThis;
                const hasSelection = !!selectedStars[performer.id];

                return (
                  <div 
                    key={performer.id} 
                    className="glass-card animate-fade-in-up" 
                    style={{ 
                      padding: '16px 20px', 
                      background: isVotedThis 
                        ? 'rgba(75, 180, 75, 0.08)' 
                        : 'var(--bg-card)',
                      borderColor: isVotedThis 
                        ? '#4bb44b' 
                        : 'var(--glass-border)',
                      transition: 'var(--transition-smooth)',
                      marginBottom: '12px',
                      boxShadow: 'var(--card-shadow)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ textAlign: 'left', flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                            #{index + 1}
                          </span>
                          <h3 style={{ fontSize: '1.18rem', fontWeight: '800' }}>{performer.name}</h3>

                          {isVotedThis && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: 'rgba(75, 180, 75, 0.15)', color: '#4bb44b', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '700' }}>
                              <Check size={9} /> RATED
                            </span>
                          )}
                        </div>
                        {performer.title && performer.title.toLowerCase() !== performer.genre?.toLowerCase() && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>
                            {performer.title}
                          </p>
                        )}
                        
                        {/* Dynamic Genre Badge Tag */}
                        {performer.genre && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px', fontWeight: '600' }}>
                            Genre: <span style={{ textTransform: 'capitalize', color: 'var(--accent-gold)', fontWeight: '800' }}>{performer.genre}</span>
                          </p>
                        )}

                        {performer.collegeId && performer.collegeId !== 'AU' && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '4px' }}>
                            Roll No: {performer.collegeId}
                          </p>
                        )}


                      </div>

                      {/* 5-Star Interactive Rating Panel */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>


                        {/* Star Rating Interactive Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const starValue = isVotedThis
                              ? (userVoteForThis.starsRating || 5)
                              : (hoveredStars[performer.id] || selectedStars[performer.id] || 0);
                            const isHighlighted = star <= starValue;
                            return (
                              <Star
                                key={star}
                                size={18}
                                style={{
                                  cursor: isVotedThis || voteLoading || !user ? 'not-allowed' : 'pointer',
                                  color: isHighlighted ? 'var(--accent-gold)' : 'var(--text-muted)',
                                  fill: isHighlighted ? 'var(--accent-gold)' : 'none',
                                  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                                onMouseEnter={() => {
                                  if (!isVotedThis && !voteLoading && user) {
                                    setHoveredStars(prev => ({ ...prev, [performer.id]: star }));
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (!isVotedThis && !voteLoading && user) {
                                    setHoveredStars(prev => ({ ...prev, [performer.id]: 0 }));
                                  }
                                }}
                                onClick={() => {
                                  if (!isVotedThis && !voteLoading) {
                                    if (!user) {
                                      setErrorMsg('You must be logged in to cast a vote!');
                                      setTimeout(() => setErrorMsg(''), 5000);
                                    } else {
                                      setSelectedStars(prev => ({ ...prev, [performer.id]: star }));
                                    }
                                  }
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Interactive Lock Rating capsule button */}
                        <div style={{ marginTop: '4px' }}>
                          {isVotedThis ? (
                            <button 
                              disabled 
                              className="btn-primary" 
                              style={{ 
                                padding: '5px 12px', 
                                fontSize: '0.72rem', 
                                borderRadius: '20px', 
                                background: 'rgba(75, 180, 75, 0.1)', 
                                border: '1px solid #4bb44b', 
                                color: '#4bb44b',
                                cursor: 'not-allowed',
                                boxShadow: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Check size={10} /> Rating Locked ({userVoteForThis.starsRating} ★)
                            </button>
                          ) : !user ? (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                              Sign in to rate
                            </span>
                          ) : hasSelection ? (
                            <button 
                              onClick={() => handleVote(performer.id, selectedStars[performer.id])}
                              disabled={voteLoading}
                              className="btn-primary" 
                              style={{ 
                                padding: '6px 14px', 
                                fontSize: '0.75rem', 
                                borderRadius: '20px', 
                                background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(200, 150, 12, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: 'none'
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                              Lock Rating ({selectedStars[performer.id]} ★)
                            </button>
                          ) : (
                            <button 
                              disabled 
                              className="btn-secondary" 
                              style={{ 
                                padding: '5px 12px', 
                                fontSize: '0.72rem', 
                                borderRadius: '20px', 
                                color: 'var(--text-muted)',
                                border: '1.5px dashed var(--glass-border)',
                                background: 'transparent',
                                cursor: 'not-allowed',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              Select Stars to Lock
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
      </div>
        </div>
      </section>
    </div>
  );
};

export default Voting;
