// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { auth, db, isMock } from '../firebase';
import api from '../api';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ setPage, user }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('tt_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('tt_remembered_email'));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user logs in successfully (only if verified)
  useEffect(() => {
    if (user) {
      const isVerified = localStorage.getItem(`tt_verified_${user.email}`) !== "false";
      if (isVerified) {
        setPage('register'); // Go directly to performer registration once verified & logged in!
      }
    }
  }, [user, setPage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and Password are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. ALWAYS authenticate against Firebase Auth first
      console.log("Checking credentials with Firebase Auth...");
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const currentUser = userCred?.user;
      
      // Enforce Firebase / Local Mock verification checks
      const isVerifiedLocal = localStorage.getItem(`tt_verified_${email}`) !== "false";

      // A. Real Firebase unverified block
      if (currentUser && !currentUser.emailVerified && !isMock && localStorage.getItem(`tt_verified_${email}`) !== "true") {
        setErrorMsg(
          <span>
            Email not verified. Please check your inbox and click the verification link sent to your registered email address.
            {import.meta.env.DEV && (
              <>
                <br />
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`tt_verified_${email}`, "true");
                    setErrorMsg('');
                    alert(`[DEMO MODE] Simulated verification link clicked! Email ${email} is now verified. Click LOG IN again to sign in!`);
                  }}
                  style={{
                    marginTop: '10px',
                    background: 'rgba(200, 150, 12, 0.15)',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Simulate Email Link Click (Demo)
                </button>
              </>
            )}
          </span>
        );
        await auth.signOut();
        localStorage.removeItem("tt_mock_user");
        setLoading(false);
        return;
      }

      // B. Mock Auth unverified block
      if (!isVerifiedLocal) {
        setErrorMsg(
          <span>
            Email not verified. Please check your inbox and click the verification link.
            {import.meta.env.DEV && (
              <>
                <br />
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`tt_verified_${email}`, "true");
                    setErrorMsg('');
                    alert(`[DEMO MODE] Simulated verification link clicked! Email ${email} is now verified. Click LOG IN again to sign in!`);
                  }}
                  style={{
                    marginTop: '10px',
                    background: 'rgba(200, 150, 12, 0.15)',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Simulate Email Link Click (Demo)
                </button>
              </>
            )}
          </span>
        );
        await auth.signOut();
        localStorage.removeItem("tt_mock_user");
        setLoading(false);
        return;
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('tt_remembered_email', email);
      } else {
        localStorage.removeItem('tt_remembered_email');
      }

      // 2. Credentials matched and verified. Now attempt to log into Express backend for compatibility
      const cachedProfile = localStorage.getItem(`tt_profile_${email}`);
      let profileData = null;
      if (cachedProfile) {
        try {
          profileData = JSON.parse(cachedProfile);
        } catch { /* ignore */ }
      }

      if (profileData && currentUser) {
        db.saveUserProfile(currentUser.uid, profileData).catch(err => console.warn(err));
        if (profileData.name) {
          auth.updateProfileDisplayName(profileData.name).catch(err => console.warn(err));
        }
      }

      try {
        console.log("Attempting Express backend sync login...");
        const loginRes = await api.login(email, password);
        
        // Force local storage auth sync so App handles SQL session
        const mockUser = {
          uid: (isMock || !currentUser) ? "sql_" + email.replace(/[^a-zA-Z0-9]/g, "") : currentUser.uid,
          email: email,
          displayName: loginRes.data?.user?.full_name || profileData?.name || email.split("@")[0].toUpperCase()
        };
        localStorage.setItem("tt_mock_user", JSON.stringify(mockUser));
        window.dispatchEvent(new Event('storage'));
      } catch (apiErr) {
        console.warn("Express backend login failed, falling back to Firebase session:", apiErr.message);
        // Force local storage auth sync so App handles Firebase session
        if (currentUser) {
          const mockUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || profileData?.name || email.split("@")[0].toUpperCase()
          };
          localStorage.setItem("tt_mock_user", JSON.stringify(mockUser));
          window.dispatchEvent(new Event('storage'));
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await auth.signInWithPopup();
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div 
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)'
      }}
      className="auth-centered-container"
    >
      {/* 🌌 High-end Glowing Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(var(--accent-gold-rgb), 0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(var(--accent-gold-rgb), 0.12) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* ⚡️ Brand Logo Header above card */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 10, marginBottom: '24px' }}>
        <img 
          src="/TT logo.png" 
          alt="Thunder Logo" 
          style={{ height: '70px', aspectRatio: '3/2', objectFit: 'contain' }} 
          className="animate-float" 
        />
        <span style={{ fontFamily: 'var(--font-cursive)', color: 'var(--accent-gold)', fontSize: '1.75rem', textShadow: '0 0 10px rgba(200, 150, 12, 0.3)' }}>
          Unleash your Inner Star
        </span>
      </div>

      {/* Centered Glassmorphic Card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(200, 150, 12, 0.3)',
          borderRadius: '24px',
          padding: '40px 35px 35px 35px',
          boxShadow: 'var(--glow-shadow), 0 30px 60px rgba(0,0,0,0.7)',
          zIndex: 10,
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        className="auth-box-overlay"
      >
        {user && localStorage.getItem(`tt_verified_${user.email}`) === "false" ? (
          <div className="animate-fade-in-up" style={{ padding: '10px 0', textAlign: 'center' }}>
            <div style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              margin: '0 auto 24px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(200, 150, 12, 0.12)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(200, 150, 12, 0.25)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce" style={{ marginTop: '3px' }}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>

            <h3 
              style={{ 
                fontSize: '1.45rem', 
                fontWeight: '900', 
                color: 'var(--accent-gold)', 
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.06em',
                marginBottom: '12px',
                textTransform: 'uppercase'
              }}
            >
              Verification Required
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '600', lineHeight: '1.6' }}>
              Your account is registered but email verification is pending:
              <br />
              <strong style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', display: 'inline-block', margin: '6px 0' }}>{user.email}</strong>
            </p>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5', maxWidth: '360px', marginInline: 'auto' }}>
              Please check your inbox and click the verification link{import.meta.env.DEV ? ", or use the simulation button below to bypass this step for the demo." : "."}
            </p>

            {import.meta.env.DEV && (
              <div style={{ marginBottom: '25px' }}>
                <button 
                  onClick={() => {
                    localStorage.setItem(`tt_verified_${user.email}`, "true");
                    alert(`[DEMO MODE] Simulated verification link clicked! Email ${user.email} is now verified. Reloading page to sign in...`);
                    window.location.reload();
                  }}
                  style={{
                    background: 'rgba(200, 150, 12, 0.15)',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Simulate Email Link Click (Demo)
                </button>
              </div>
            )}

            <button 
              onClick={async () => {
                await auth.signOut();
                localStorage.removeItem("tt_mock_user");
                window.location.reload();
              }}
              style={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)', 
                color: '#0E0B00', 
                border: 'none', 
                borderRadius: '30px', 
                padding: '12px 0',
                fontSize: '0.9rem',
                fontWeight: '800',
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(200, 150, 12, 0.25)',
                transition: 'var(--transition-smooth)',
                textTransform: 'uppercase'
              }}
              className="btn-glow-gold"
            >
              Sign Out / Back
            </button>
          </div>
        ) : (
          <>
            <h3 
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: '900', 
                color: 'var(--accent-gold)', 
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              Sign In Portal
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '28px', fontWeight: '500', textAlign: 'center' }}>
              Welcome back! Log in with your profile to vote on stage performances.
            </p>

            {errorMsg && (
              <div style={{ padding: '10px 14px', background: 'rgba(230, 50, 50, 0.08)', border: '1px solid #e63232', color: '#e63232', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'center', lineHeight: '1.4' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin}>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input 
                  type="email" 
                  placeholder="Student Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ 
                    width: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid rgba(200, 150, 12, 0.25)', 
                    borderRadius: '30px', 
                    padding: '12px 20px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    textAlign: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                  required
                  className="auth-input-field"
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      width: '100%', 
                      backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(200, 150, 12, 0.25)', 
                      borderRadius: '30px', 
                      padding: '12px 45px 12px 20px',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      textAlign: 'center',
                      transition: 'var(--transition-smooth)'
                    }}
                    required
                    className="auth-input-field"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '18px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-gold)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      zIndex: 10
                    }}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '0 8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--accent-gold)' }}
                  />
                  Remember me
                </label>
                
                <span 
                  onClick={() => alert('Feature simulated: A password reset link has been dispatched to your email address!')}
                  style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot Password?
                </span>
              </div>

              {/* Golden Sign In Button */}
              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)', 
                  color: '#0E0B00', 
                  border: 'none', 
                  borderRadius: '30px', 
                  padding: '12px 0',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(200, 150, 12, 0.25)',
                  transition: 'var(--transition-smooth)',
                  marginBottom: '18px',
                  textTransform: 'uppercase'
                }}
                disabled={loading}
                className="btn-glow-gold"
              >
                {loading ? 'Authenticating...' : 'LOG IN'}
              </button>

            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0 12px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(200, 150, 12, 0.15)' }}></div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.08em' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(200, 150, 12, 0.15)' }}></div>
            </div>

            {/* Google Student Login */}
            <button 
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(200, 150, 12, 0.25)',
                borderRadius: '30px',
                padding: '11px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'var(--transition-smooth)',
                marginBottom: '22px',
                textAlign: 'center'
              }}
              className="google-btn"
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '2px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              GOOGLE STUDENT LOGIN
            </button>

            {/* Link to Dedicated Sign Up */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', marginBottom: '15px' }}>
              Don't have an account?{' '}
              <span 
                onClick={() => setPage('signup')}
                style={{ color: 'var(--accent-gold)', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register Now
              </span>
            </div>
          </>
        )}

        {/* Presenter Footer Row inside Card */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(200, 150, 12, 0.15)', margin: '20px 0 15px 0' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase' }}>
            Presented By
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Student Activity Council
          </span>
        </div>
      </div>

      <style>{`
        .btn-glow-gold:hover {
          background: linear-gradient(135deg, var(--accent-gold-hover) 0%, var(--accent-gold) 100%) !important;
          box-shadow: 0 0 20px rgba(200, 150, 12, 0.45) !important;
          transform: translateY(-1px);
        }
        .btn-glow-gold:active {
          transform: translateY(0);
        }
        .google-btn:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 15px rgba(200, 150, 12, 0.15);
          transform: translateY(-1px);
        }
        .google-btn:active {
          transform: translateY(0);
        }
        .auth-input-field:focus {
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 12px rgba(200, 150, 12, 0.2) !important;
        }
        .auth-box-overlay {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
