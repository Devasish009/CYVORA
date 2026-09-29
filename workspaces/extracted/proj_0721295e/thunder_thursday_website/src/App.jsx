// src/App.jsx
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { auth, db } from './firebase';
import api from './api';
import { Sun, Moon, Bell, User, ArrowLeft } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Register from './pages/Register';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Voting from './pages/Voting';
import Coordinators from './pages/Coordinators';
import Creators from './pages/Creators';
import HallOfLightning from './pages/HallOfLightning';
import Profile from './pages/Profile';
import ApplyAndShine from './pages/ApplyAndShine';
import Feedback from './pages/Feedback';

function App() {
  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 480;
  const [page, setPage] = useState('landing');
  const [pageHistory, setPageHistory] = useState([]);

  const navigateToPage = (newPage) => {
    if (page !== newPage) {
      setPageHistory(prev => [...prev, page]);
      setPage(newPage);
    }
  };

  const registerBackRef = useRef(null);

  const navigateBack = () => {
    if (page === 'register' && registerBackRef.current) {
      const handled = registerBackRef.current();
      if (handled) return;
    }

    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setPage(prevPage);
    } else {
      setPage('landing');
    }
  };
  const [theme, setTheme] = useState(localStorage.getItem('tt_theme') || 'dark');
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState('event_feedback_session');
  const [feedbackLastEnabledAt, setFeedbackLastEnabledAt] = useState(null);

  useEffect(() => {
    const unsubscribe = db.subscribeFeedbackStatus((data) => {
      setFeedbackEnabled(!!(data && data.enabled));
      if (data && data.session_id) {
        setFeedbackSessionId(data.session_id);
      }
      if (data && data.last_enabled_at) {
        setFeedbackLastEnabledAt(data.last_enabled_at);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [showIntro, setShowIntro] = useState(() => {
    // Show only once per browser session for optimal UX
    return !sessionStorage.getItem('tt_intro_shown');
  });
  const [introFade, setIntroFade] = useState(false);

  useEffect(() => {
    if (showIntro) {
      const fadeTimeout = setTimeout(() => {
        setIntroFade(true);
      }, 4500);

      const completeTimeout = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('tt_intro_shown', 'true');
      }, 5300);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [showIntro]);



  // Live Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tt_read_notification_ids') || '[]');
    } catch {
      return [];
    }
  });

  // Listen to Cloud Firestore real-time notifications
  useEffect(() => {
    const unsubscribeNotifications = db.subscribeNotifications((list) => {
      setNotifications(list);
    });
    return () => {
      if (typeof unsubscribeNotifications === 'function') {
        unsubscribeNotifications();
      }
    };
  }, []);

  // Compute unread count
  const unreadNotifications = notifications.filter(n => !readNotificationIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
    localStorage.setItem('tt_read_notification_ids', JSON.stringify(allIds));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("tt_mock_notifications", JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tt_mock_update_notifications', { detail: [] }));
  };

  const dismissNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("tt_mock_notifications", JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tt_mock_update_notifications', { detail: updated }));
  };

  // 1. Listen for auth changes (Firebase, Custom JWT, and Mock storage events)
  useEffect(() => {
    // A. Firebase Auth listener
    const unsubscribeFirebase = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If Firebase says no user, check if we have a valid Custom SQL JWT login active
        const localMock = localStorage.getItem("tt_mock_user");
        if (localMock) {
          try {
            setUser(JSON.parse(localMock));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    });

    // B. JWT Session verification on initial load
    const verifyJWTSession = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.data?.user) {
            const localMock = localStorage.getItem("tt_mock_user");
            let cachedUid = null;
            if (localMock) {
              try {
                cachedUid = JSON.parse(localMock).uid;
              } catch { /* ignore */ }
            }

            const sqlUser = {
              uid: (isMock)
                ? "sql_" + res.data.user.email.replace(/[^a-zA-Z0-9]/g, "")
                : (auth.currentUser ? auth.currentUser.uid : cachedUid || "sql_" + res.data.user.email.replace(/[^a-zA-Z0-9]/g, "")),
              email: res.data.user.email,
              displayName: res.data.user.full_name || res.data.user.email.split("@")[0].toUpperCase(),
              phone: res.data.user.phone
            };
            setUser(sqlUser);
            localStorage.setItem("tt_mock_user", JSON.stringify(sqlUser));
          }
        } catch (err) {
          console.warn("Express session validation failed or offline, checking local cache.", err);
          // If network is offline but cached credentials exist, keep them (fail-safe)
          const localMock = localStorage.getItem("tt_mock_user");
          if (localMock) {
            try {
              setUser(JSON.parse(localMock));
            } catch {
              setUser(null);
            }
          }
        }
      }
    };

    // C. Event listener for storage events (e.g. login/signup components updating mock user cache)
    const handleStorageChange = () => {
      const localMock = localStorage.getItem("tt_mock_user");
      if (localMock) {
        try {
          setUser(JSON.parse(localMock));
        } catch {
          setUser(null);
        }
      } else if (!auth.currentUser) {
        setUser(null);
      }
    };

    verifyJWTSession();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribeFirebase();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  // 2. Set theme on document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tt_theme', theme);
  }, [theme]);

  // 3. Scroll to top on page change - useLayoutEffect prevents visual flash/jump before browser paint
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error("Firebase Sign out error", err);
    }
    // Clear JWT and local cache
    api.removeToken();
    localStorage.removeItem("tt_mock_user");
    setUser(null);
    setPageHistory([]);
    setPage('landing');
    setMobileMenuOpen(false);
  };

  // Page renderer router helper
  const renderPage = () => {
    switch (page) {
      case 'landing':
        return <Landing setPage={navigateToPage} />;
      case 'about':
        return <About />;
      case 'apply_and_shine':
        return <ApplyAndShine setPage={navigateToPage} />;
      case 'register':
        return <Register user={user} setPage={navigateToPage} backRef={registerBackRef} />;
      case 'profile':
        return <Profile user={user} setPage={navigateToPage} onBack={navigateBack} />;
      case 'login':
        return <Login setPage={navigateToPage} user={user} />;
      case 'signup':
        return <SignUp setPage={navigateToPage} user={user} />;
      case 'voting':
        return <Voting user={user} setPage={navigateToPage} />;
      case 'feedback':
        return <Feedback user={user} setPage={navigateToPage} sessionId={feedbackSessionId} lastEnabledAt={feedbackLastEnabledAt} feedbackEnabled={feedbackEnabled} />;
      case 'coordinators':
        return <Coordinators />;
      case 'creators':
        return <Creators />;
      case 'hall_of_lightning':
        return <HallOfLightning setPage={navigateToPage} onBack={navigateBack} />;
      default:
        return <Landing setPage={navigateToPage} />;
    }
  };

  return (
    <div className="app-container">
      
      {/* Decorative Gold lightning bolt backgrounds floating in the corners of the page */}
      <div className="lightning-bg-topright"></div>
      <div className="lightning-bg-bottomleft"></div>

      {/* Solid Gold Header matching Slides 2-9 - Bulletproof 3-Column Grid */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          width: '100%',
          height: '60px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '0 5%',
          background: 'var(--header-bg)',
          boxShadow: '0 4px 15px rgba(200, 150, 12, 0.12)',
          transition: 'var(--transition-smooth)'
        }}
      >
        {/* Brand Logo & Back Button - Align Left */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', justifySelf: 'start' }}
        >
          {page !== 'landing' && (
            <button
              onClick={navigateBack}
              style={{
                background: 'rgba(250, 245, 228, 0.12)',
                border: '1.5px solid rgba(250, 245, 228, 0.25)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF5E4',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(250, 245, 228, 0.25)';
                e.currentTarget.style.borderColor = '#FAF5E4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(250, 245, 228, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(250, 245, 228, 0.25)';
              }}
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div 
            onClick={() => { navigateToPage('landing'); setMobileMenuOpen(false); }} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <img src="/IMG-20260529-WA0025.jpg.png" alt="Thunder Logo" style={{ height: '42px', aspectRatio: '1121/1024', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Center Navigation links - Mathematically Centered */}
        <nav 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            justifySelf: 'center'
          }} 
          className="nav-desktop"
        >
          {(() => {
            const items = [
              { id: 'about', label: 'About' },
              { id: 'voting', label: 'Live Voting' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'register', label: 'Register' },
              { id: 'coordinators', label: 'Co-ordinators' },
              { id: 'creators', label: 'Creators' }
            ];
            return items.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPage(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  color: page === item.id ? '#0E0B00' : '#FAF5E4', // Contrast color for active links
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  position: 'relative',
                  padding: '6px 0'
                }}
              >
                {item.label}
                {page === item.id && (
                  <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: '#0E0B00', borderRadius: '2px' }} />
                )}
              </button>
            ));
          })()}
        </nav>

        {/* Right Side: Capsule Switcher Toggle & Premium Auth Buttons - Align Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifySelf: 'end' }}>
          
          {/* Capsule Auth Button */}
          <div style={{ display: 'flex', alignItems: 'center' }} className="nav-desktop">
            {!user ? (
              <button
                onClick={() => navigateToPage('login')}
                style={{
                  background: '#FAF5E4',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  color: '#0E0B00',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  boxShadow: '0 4px 12px rgba(250, 245, 228, 0.15)'
                }}
                className="signup-capsule-btn"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                style={{
                  background: 'rgba(5, 4, 1, 0.3)',
                  border: '1.5px solid rgba(250, 245, 228, 0.3)',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  color: '#FAF5E4',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className="signout-capsule-btn"
              >
                Sign Out
              </button>
            )}
          </div>

          {user && (
            <button
              onClick={() => navigateToPage('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: page === 'profile' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.05)',
                border: page === 'profile' ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                color: page === 'profile' ? '#0E0B00' : '#FAF5E4',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: page === 'profile' ? '0 0 12px rgba(200, 150, 12, 0.3)' : 'none'
              }}
              className="profile-header-btn"
              title="View Your Performer Profile"
            >
              <User size={15} />
            </button>
          )}

          {/* Notifications Bell Icon Button & Glassmorphic Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              style={{
                background: showNotifications ? 'rgba(255, 255, 255, 0.08)' : 'none',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF5E4',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
              title="Live Event Notifications"
              className="bell-notification-btn"
            >
              <Bell size={18} style={{ color: showNotifications ? '#0E0B00' : 'inherit' }} />
              {unreadCount > 0 && (
                <>
                  <span 
                    style={{
                      position: 'absolute',
                      top: '9px',
                      right: '9px',
                      width: '7px',
                      height: '7px',
                      backgroundColor: '#0E0B00',
                      borderRadius: '50%',
                      zIndex: 10
                    }}
                    className="bell-unread-dot"
                  />
                  <span 
                    style={{
                      position: 'absolute',
                      top: '9px',
                      right: '9px',
                      width: '7px',
                      height: '7px',
                      backgroundColor: '#0E0B00',
                      borderRadius: '50%',
                      zIndex: 9
                    }}
                    className="animate-ping"
                  />
                </>
              )}
            </button>

            {/* Dropdown Panel */}
            {showNotifications && (
              <div 
                style={{
                  position: 'absolute',
                  top: '55px',
                  right: '0',
                  width: '320px',
                  backgroundColor: 'rgba(14, 11, 0, 0.96)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1.8px solid #0E0B00',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: 'var(--glow-shadow), 0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
                className="notifications-dropdown-panel animate-fade-in-up"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(250, 245, 228, 0.1)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#FAF5E4', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Notifications</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(250, 245, 228, 0.6)',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Read All
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearAllNotifications}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e63232',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }} className="notifications-list-container">
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'rgba(250, 245, 228, 0.4)', textAlign: 'center', padding: '20px 0' }}>
                      No new live updates.
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isUnread = !readNotificationIds.includes(n.id);
                      return (
                        <div 
                          key={n.id} 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            padding: '8px 10px',
                            borderRadius: '12px',
                            background: isUnread ? 'rgba(250, 245, 228, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            borderLeft: isUnread ? '3px solid #FAF5E4' : 'none',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginRight: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#FAF5E4' }}>{n.title}</span>
                              <span style={{ fontSize: '0.62rem', color: 'rgba(250, 245, 228, 0.5)' }}>
                                {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(n.id);
                              }}
                              style={{ background: 'none', border: 'none', color: 'rgba(250, 245, 228, 0.4)', fontSize: '0.85rem', cursor: 'pointer', padding: '0 2px', fontWeight: '700' }}
                              title="Dismiss notification"
                            >
                              ×
                            </button>
                          </div>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(250, 245, 228, 0.7)', margin: 0, lineHeight: '1.4' }}>{n.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div 
            className="theme-switch-pill" 
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {/* Sliding circular toggle knob */}
            <div className="toggle-knob">
              {theme === 'dark' ? (
                <Moon size={14} style={{ color: '#0E0B00' }} />
              ) : (
                <Sun size={14} style={{ color: '#C8960C' }} />
              )}
            </div>
            {/* Background elements */}
            <Sun size={14} style={{ color: '#C8960C', marginLeft: '8px', opacity: theme === 'dark' ? 0.3 : 1 }} />
            <Moon size={14} style={{ color: '#FAF5E4', marginRight: '8px', opacity: theme === 'dark' ? 1 : 0.3 }} />
          </div>

          {/* Hamburger Menu (Mobile Toggle) */}
          <button 
            onClick={() => { setMobileMenuOpen(prev => !prev); }}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#FAF5E4',
              cursor: 'pointer',
              padding: '5px'
            }}
            className="menu-hamburger"
          >
            <div style={{ width: '22px', height: '2.5px', backgroundColor: 'currentColor', marginBottom: '5px' }}></div>
            <div style={{ width: '22px', height: '2.5px', backgroundColor: 'currentColor', marginBottom: '5px' }}></div>
            <div style={{ width: '22px', height: '2.5px', backgroundColor: 'currentColor' }}></div>
          </button>
        </div>
      </header>

      {/* CSS for responsive hamburger display & capsule hover states */}
      <style>{`
        @media (max-width: 1200px) {
          .nav-desktop {
            display: none !important;
          }
          .menu-hamburger {
            display: block !important;
          }
        }
        .signin-capsule-btn:hover {
          border-color: #FAF5E4 !important;
          background: rgba(250, 245, 228, 0.08);
          transform: translateY(-1px);
        }
        .signin-capsule-btn:active {
          transform: translateY(0);
        }
        .signup-capsule-btn:hover {
          background: #FAF5E4 !important;
          box-shadow: 0 4px 18px rgba(250, 245, 228, 0.45) !important;
          transform: translateY(-1px);
        }
        .signup-capsule-btn:active {
          transform: translateY(0);
        }
        .signout-capsule-btn:hover {
          border-color: #e63232 !important;
          color: #e63232 !important;
          background: rgba(230, 50, 50, 0.05);
          transform: translateY(-1px);
        }
        .signout-capsule-btn:active {
          transform: translateY(0);
        }
        .profile-header-btn:hover {
          border-color: var(--accent-gold) !important;
          background: rgba(200, 150, 12, 0.1) !important;
          transform: translateY(-1px);
        }
        .profile-header-btn:active {
          transform: translateY(0);
        }
        
        /* ==================== PREMIUM STORM INTRO ANIMATIONS ==================== */
        @keyframes skyFlash {
          0%, 100% { background-color: #000000; }
          8%, 10%, 28%, 30% { background-color: #0d0a02; }
          16%, 18%, 38%, 40% { background-color: #120e03; }
          45%, 47%, 62%, 64% { background-color: #1c1505; }
        }
        .sky-glow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: transparent;
          pointer-events: none;
          z-index: 1;
          animation: skyFlash 5.5s ease-in-out infinite;
        }
        
        @keyframes drawStrokeLeft {
          0% { stroke-dashoffset: 1500; }
          9% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes strikeLeft {
          0%, 8% { opacity: 0; }
          9%, 13%, 20% { opacity: 1; }
          11%, 17% { opacity: 0.3; }
          23% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        @keyframes drawStrokeRight {
          0%, 11% { stroke-dashoffset: 1500; }
          20% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes strikeRight {
          0%, 19% { opacity: 0; }
          20%, 24%, 32% { opacity: 1; }
          22%, 28% { opacity: 0.3; }
          35% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        @keyframes drawStrokeCenter {
          0%, 24% { stroke-dashoffset: 1500; }
          35% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes strikeCenter {
          0%, 33% { opacity: 0; }
          35%, 39%, 46%, 52% { opacity: 1; }
          37%, 43%, 48% { opacity: 0.2; }
          56% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        .lightning-strike {
          filter: url(#epic-lightning-glow);
          transform-origin: top center;
        }
        .bolt-left {
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: drawStrokeLeft 5.5s cubic-bezier(0.19, 1, 0.22, 1) forwards, strikeLeft 5.5s ease-out forwards;
        }
        .bolt-right {
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: drawStrokeRight 5.5s cubic-bezier(0.19, 1, 0.22, 1) forwards, strikeRight 5.5s ease-out forwards;
        }
        .bolt-center {
          stroke-dasharray: 1500;
          stroke-dashoffset: 1500;
          animation: drawStrokeCenter 5.5s cubic-bezier(0.19, 1, 0.22, 1) forwards, strikeCenter 5.5s ease-out forwards;
        }
        
        @keyframes shockwaveExpand {
          0%, 33% { transform: scale(0); opacity: 0; }
          35% { opacity: 0.85; }
          52% { transform: scale(3.5); opacity: 0; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        .shockwave-ring {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          border: 3.5px solid var(--accent-gold);
          pointer-events: none;
          z-index: 3;
          animation: shockwaveExpand 5.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
          box-shadow: inset 0 0 30px rgba(200, 150, 12, 0.2), 0 0 30px rgba(200, 150, 12, 0.2);
        }
        
        @keyframes logoReveal {
          0%, 39% { transform: scale(0.65); opacity: 0; filter: drop-shadow(0 0 0 rgba(200, 150, 12, 0)); }
          44% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 45px rgba(200, 150, 12, 0.8)); }
          47% { transform: scale(1); filter: drop-shadow(0 0 30px rgba(200, 150, 12, 0.65)); }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 30px rgba(200, 150, 12, 0.65)); }
        }
        .logo-appear-container {
          animation: logoReveal 5.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        @keyframes taglineReveal {
          0%, 46% { opacity: 0; transform: translateY(15px); }
          54% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-intro-tagline {
          animation: taglineReveal 5.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .intro-splash-container {
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .intro-fade-out {
          opacity: 0 !important;
          transform: scale(1.05);
          pointer-events: none !important;
        }
        .intro-skip-btn:hover {
          background: rgba(200, 150, 12, 0.1) !important;
          border-color: var(--accent-gold) !important;
          color: var(--accent-gold) !important;
          transform: translateY(-1px);
        }
      `}</style>


      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          width: '100%',
          backgroundColor: '#C8960C',
          borderBottom: '2px solid #FAF5E4',
          zIndex: 499,
          padding: '20px 8%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {(() => {
            const items = [
              { id: 'landing', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'voting', label: 'Live Voting' },
              { id: 'feedback', label: 'Feedback' },
              { id: 'register', label: 'Register' },
              { id: 'coordinators', label: 'Co-ordinators' },
              { id: 'creators', label: 'Creators' }
            ];
            if (!user) {
              items.push({ id: 'login', label: 'Sign In' });
            } else {
              items.push({ id: 'profile', label: 'My Profile' });
            }
            return (
              <>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { navigateToPage(item.id); setMobileMenuOpen(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      padding: '8px 0',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: page === item.id ? '#0E0B00' : '#FAF5E4',
                      fontFamily: 'var(--font-display)',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
                {user && (
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: 'rgba(230, 50, 50, 0.15)',
                      border: '1.5px solid #FAF5E4',
                      borderRadius: '20px',
                      textAlign: 'center',
                      padding: '10px 0',
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: '#FAF5E4',
                      fontFamily: 'var(--font-display)',
                      cursor: 'pointer',
                      marginTop: '10px',
                      width: '100%'
                    }}
                  >
                    Sign Out
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Content wrapper with global zoom scaling for everything except golden bar and background */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, zoom: '0.92' }}>
        {/* Brand logos in top of page body, as in Slide 2 & 3 */}
        {page === 'landing' && (
          <div style={{ 
            padding: '30px 8% 0 8%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'relative', 
            zIndex: 10 
          }}>
            <a href="https://www.adityauniversity.in/" target="_blank" rel="noreferrer">
              <img 
                src="https://www.adityauniversity.in/public/frontend/assets/images/site-logo.svg" 
                alt="Aditya University" 
                style={{ height: '70px', objectFit: 'contain', cursor: 'pointer' }} 
              />
            </a>
            <a href="https://www.instagram.com/sac_aditya_university/" target="_blank" rel="noreferrer">
              <img 
                src="/sac_logo_light.png" 
                alt="SAC Logo" 
                style={{ 
                  height: '75px', 
                  width: '75px', 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '2px solid var(--accent-gold)',
                  boxShadow: '0 0 15px rgba(200, 150, 12, 0.2)'
                }} 
              />
            </a>
          </div>
        )}

        {/* Main App Page Context */}
        <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingTop: '0px', marginTop: '0px' }}>
          {renderPage()}
        </main>

        {/* Premium Event Footer */}
        <footer 
          style={{
            borderTop: '2px solid var(--accent-gold)',
            background: '#0E0B00', /* Black Footer as in mockup */
            padding: '60px 8% 40px 8%',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Footer Logo Row */}
            <div className="footer-logo-row" style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="https://www.adityauniversity.in/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex' }}>
                <img src="https://www.adityauniversity.in/public/frontend/assets/images/site-logo.svg" alt="Aditya Logo" className="footer-aditya-img" style={{ height: '50px', objectFit: 'contain', cursor: 'pointer' }} />
              </a>
              <img src="/TT logo.png" alt="Thunder Logo" className="footer-tt-img" style={{ height: '75px', objectFit: 'contain' }} />
              <a href="https://www.instagram.com/sac_aditya_university/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex' }}>
                <img 
                  src="/sac_logo_light.png" 
                  alt="SAC Logo" 
                  className="footer-sac-img"
                  style={{ 
                    height: '55px', 
                    width: '55px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '1.5px solid var(--accent-gold)' 
                  }} 
                />
              </a>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#A39E8F', lineHeight: '1.6', maxWidth: '600px' }}>
              Aditya University's premium weekly talent showcase, providing an open stage for music, singing, and choreography excellence. Located at Surampalem, Andhra Pradesh.
            </p>

            {/* Quick Footer Links */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
              <span onClick={() => navigateToPage('landing')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Home</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('hall_of_lightning')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Gallery</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('about')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>About</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('register')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Register</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('voting')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Live Voting</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('feedback')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Feedback</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('coordinators')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Co-ordinators</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span onClick={() => navigateToPage('creators')} style={{ color: '#FAF5E4', cursor: 'pointer' }}>Creators</span>
              <span style={{ color: 'var(--accent-gold)' }}>•</span>
              <span 
                onClick={() => {
                  setIntroFade(false);
                  setShowIntro(true);
                }} 
                style={{ color: '#FAF5E4', cursor: 'pointer' }}
              >
                Replay Intro
              </span>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(200, 150, 12, 0.2)', margin: '10px 0' }}></div>

            <p style={{ fontSize: '0.75rem', color: '#6E6A5B' }}>
              © {new Date().getFullYear()} Student Activity Council, Aditya University. All rights reserved. Developed by Creators Team.
            </p>
          </div>
        </footer>
      </div>

      {/* ⚡️ FULL SCREEN GOLDEN THUNDER & BRAND INTRO SPLASH OVERLAY */}
      {showIntro && (
        <div 
          className={`intro-splash-container ${introFade ? 'intro-fade-out' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            minWidth: '100vw',
            minHeight: '100vh',
            backgroundColor: '#000000',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'all'
          }}
        >
          {/* Decorative ambient gold sky flash representing clouds in storm */}
          <div className="sky-glow-overlay" />

          <svg 
            viewBox={isMobileViewport ? "0 0 400 1000" : "0 0 1000 1000"} 
            preserveAspectRatio="xMidYMid slice" 
            width="100%" 
            height="100%" 
            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, margin: 0, padding: 0, pointerEvents: 'none', zIndex: 2 }}
          >
            <defs>
              <filter id="epic-lightning-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Left jag thunder bolt - strikes down at 0.5s */}
            <path 
              d={isMobileViewport 
                ? "M 80 0 L 60 200 L 110 180 L 40 450 L 90 420 L 30 700 L 70 680 L 10 1000" 
                : "M 150 0 L 120 200 L 180 180 L 80 450 L 150 420 L 50 700 L 100 680 L 20 1000"} 
              stroke="var(--accent-gold)" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
              className="lightning-strike bolt-left"
            />

            {/* Right jag thunder bolt - strikes down at 1.1s */}
            <path 
              d={isMobileViewport 
                ? "M 320 0 L 340 180 L 300 160 L 360 420 L 320 390 L 370 700 L 340 670 L 390 1000" 
                : "M 850 0 L 880 180 L 820 160 L 920 420 L 860 390 L 950 700 L 890 670 L 980 1000"} 
              stroke="var(--accent-gold)" 
              strokeWidth="4.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
              className="lightning-strike bolt-right"
            />

            {/* Huge Epic Center thunder bolt - strikes down at 1.8s */}
            <path 
              d={isMobileViewport 
                ? "M 200 0 L 180 200 L 230 170 L 160 420 L 210 380 L 140 680 L 190 650 L 120 1000" 
                : "M 500 0 L 480 200 L 530 170 L 460 420 L 510 380 L 440 680 L 490 650 L 420 1000"} 
              stroke="var(--accent-gold)" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none" 
              className="lightning-strike bolt-center"
            />
          </svg>

          {/* Golden energy circular shockwave - expands at 2.4s */}
          <div className="shockwave-ring" />

          {/* Centered Brand Curation Panel - scales up at 2.5s */}
          <div className="logo-appear-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
            <img 
              src="/TT logo.png" 
              alt="Thunder Thursday Logo" 
              style={{ width: '380px', maxWidth: '85vw', height: 'auto', objectFit: 'contain', display: 'block' }}
              className="intro-logo-glow"
            />
            <p className="cursive-tagline text-glow-cursive animate-intro-tagline" style={{ fontSize: '3rem', color: 'var(--accent-gold)', marginTop: '20px' }}>
              Unleash your Inner Star
            </p>
          </div>

          {/* Premium skip overlay button */}
          <button 
            onClick={() => {
              setIntroFade(true);
              setTimeout(() => {
                setShowIntro(false);
                sessionStorage.setItem('tt_intro_shown', 'true');
              }, 500);
            }}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '45px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1.5px solid rgba(200, 150, 12, 0.3)',
              borderRadius: '24px',
              padding: '8px 20px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-display)',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
              zIndex: 100,
              letterSpacing: '0.08em',
              transition: 'var(--transition-smooth)'
            }}
            className="intro-skip-btn"
          >
            SKIP INTRO
          </button>
        </div>
      )}

    </div>
  );
}

export default App;
