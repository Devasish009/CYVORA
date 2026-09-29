// src/pages/SignUp.jsx
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import api from '../api';
import { academicStructure } from '../academicStructure';
import { Eye, EyeOff } from 'lucide-react';

const SignUp = ({ setPage, user }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [campus, setCampus] = useState('');
  const [branch, setBranch] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Dynamic cascading logic for Sign Up branch dropdown
  // Managed directly in select onChange handlers to comply with modern render principles

  // Redirect if user logs in successfully (only if verified)
  useEffect(() => {
    if (user) {
      // Check if email is verified
      const isVerified = localStorage.getItem(`tt_verified_${user.email}`) !== "false";
      if (isVerified) {
        setPage('register'); // Go directly to performer registration once verified & logged in!
      }
    }
  }, [user, setPage]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password || !displayName || !phone || !rollNo || !campus || !branch || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }
    if (rollNo.length < 5) {
      setErrorMsg('Please enter a valid student roll number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      try {
        // 1. Attempt PostgreSQL Node.js Express API Signup
        await api.signup(email, password, displayName, phone);
        
        // Store student extra parameters inside local profiles sync
        const profileData = {
          name: displayName,
          email: email,
          phone: phone,
          rollNo: rollNo,
          campus: campus,
          branch: branch
        };
        localStorage.setItem(`tt_profile_${email}`, JSON.stringify(profileData));
        localStorage.setItem(`tt_verified_${email}`, "false"); // Verification required!
        
        // Always trigger Firebase user registration to send verification email
        try {
          const userCred = await auth.createUserWithEmailAndPassword(email, password, displayName);
          if (userCred && userCred.user) {
            await db.saveUserProfile(userCred.user.uid, profileData);
          }
          await auth.signOut();
          localStorage.removeItem("tt_mock_user");
        } catch (fbCreateErr) {
          console.warn("Express signup succeeded, but Firebase registration failed/already exists:", fbCreateErr);
        }

        setRegisteredEmail(email);
      } catch (apiErr) {
        // If it's a validation error or user-already-exists error, don't fallback, propagate!
        if (apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('NetworkError')) {
          throw apiErr;
        }
        
        // 2. Unreachable Node.js server fallback: Use Firebase/Mock Auth Engine
        console.warn("Express backend server offline. Falling back to Firebase/Mock Auth.");
        const userCred = await auth.createUserWithEmailAndPassword(email, password, displayName);
        
        const profileData = {
          name: displayName,
          email: email,
          phone: phone,
          rollNo: rollNo,
          campus: campus,
          branch: branch
        };
        localStorage.setItem(`tt_profile_${email}`, JSON.stringify(profileData));
        localStorage.setItem(`tt_verified_${email}`, "false"); // Verification required!
        
        if (userCred && userCred.user) {
          await db.saveUserProfile(userCred.user.uid, profileData);
        }

        // Sign out right away since Firebase/Mock engine automatically logs in a newly registered user
        await auth.signOut();
        localStorage.removeItem("tt_mock_user");
        
        setRegisteredEmail(email);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
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

  // Centered input styles
  const inputStyle = {
    width: '100%', 
    backgroundColor: 'var(--bg-primary)', 
    border: '1.8px solid var(--accent-gold)', 
    borderRadius: '30px', 
    padding: '12px 20px',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    textAlign: 'center',
    transition: 'var(--transition-smooth)'
  };

  return (
    <div 
      style={{ 
        display: 'grid',
        gridTemplateColumns: 'minmax(450px, 1.25fr) 1fr',
        minHeight: 'auto',
        padding: '0px',
        marginTop: '0px',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        overflowX: 'hidden',
        position: 'relative'
      }}
      className="auth-split-container"
    >
      
      {/* 🎨 VISUAL LEFT COLUMN (Pure CSS Gold Storm Arena) */}
      <div 
        style={{
          position: 'relative',
          background: 'radial-gradient(circle at 30% 30%, rgba(var(--accent-gold-rgb), 0.25) 0%, var(--bg-primary) 80%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px',
          borderRight: '3px solid var(--accent-gold)'
        }}
        className="auth-left-visual"
      >
        {/* Dynamic Storm Shimmer Glows */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '20%',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: 'rgba(200, 150, 12, 0.15)',
          filter: 'blur(60px)',
          zIndex: 1
        }} />

        {/* Header Logo Row with Link */}
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 5 }}>
          <a href="https://www.adityauniversity.in/" target="_blank" rel="noreferrer" style={{ display: 'inline-flex' }}>
            <img src="https://www.adityauniversity.in/public/frontend/assets/images/site-logo.svg" alt="Aditya University" style={{ height: '50px', objectFit: 'contain', cursor: 'pointer' }} />
          </a>
        </div>

        {/* Center Banner card */}
        <div style={{ zIndex: 5, padding: '30px 40px', backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--accent-gold)', borderRadius: '24px', backdropFilter: 'blur(8px)', maxWidth: '420px', alignSelf: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          <img src="/TT logo.png" alt="Thunder Logo" style={{ width: '100%', maxWidth: '280px', margin: '0 auto 15px auto', display: 'block', aspectRatio: '3/2', objectFit: 'contain' }} className="animate-float" />
          <p style={{ fontFamily: 'var(--font-cursive)', color: 'var(--accent-gold)', fontSize: '2.5rem', margin: 0, textAlign: 'center' }}>
            Unleash your Inner Star
          </p>
        </div>

        {/* Presenter Footer Row */}
        <div style={{ zIndex: 5, textAlign: 'left' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color: 'var(--accent-gold)', fontWeight: '900', marginBottom: '4px' }}>
            PRESENTED BY
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: '900', color: 'var(--text-primary)', fontSize: '1.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Student Activity Council
          </h4>
        </div>
      </div>

      {/* 🌌 INTERACTIVE RIGHT COLUMN (Frosted registration grid panel) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px 20px 30px 20px',
          position: 'relative'
        }}
        className="auth-form-wrapper"
      >
        <div className="glow-bg-radial" style={{ top: '15%', left: '15%', zIndex: 1 }}></div>
        <div className="glow-bg-radial" style={{ bottom: '15%', right: '15%', zIndex: 1 }}></div>

        {/* ⚡️ Brand Logo Header above card (Mobile Only) */}
        <div className="auth-mobile-header">
          <img 
            src="/TT logo.png" 
            alt="Thunder Logo" 
            style={{ height: '60px', aspectRatio: '3/2', objectFit: 'contain' }} 
            className="animate-float" 
          />
          <span style={{ fontFamily: 'var(--font-cursive)', color: 'var(--accent-gold)', fontSize: '1.5rem', textShadow: '0 0 10px rgba(200, 150, 12, 0.3)' }}>
            Unleash your Inner Star
          </span>
        </div>

        {/* Large Glassmorphic Form Card (Wider for two-column grid) */}
        <div 
          style={{
            width: '100%',
            maxWidth: '620px',
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '2px solid var(--accent-gold)',
            borderRadius: '32px',
            padding: '25px 30px 35px 30px',
            boxShadow: 'var(--glow-shadow), 0 20px 50px rgba(0,0,0,0.6)',
            textAlign: 'center',
            zIndex: 10,
            position: 'relative'
          }}
          className="auth-box-overlay"
        >
          {registeredEmail ? (
            <div className="animate-fade-in-up" style={{ padding: '10px 0' }}>
              {/* Floating mail graphic icon wrapper */}
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
                  fontSize: '1.65rem', 
                  fontWeight: '900', 
                  color: 'var(--accent-gold)', 
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.06em',
                  marginBottom: '12px',
                  textTransform: 'uppercase'
                }}
              >
                VERIFICATION MAIL SENT
              </h3>
              
              <p style={{ fontSize: '0.9rem', color: '#FAF5E4', marginBottom: '16px', fontWeight: '600', lineHeight: '1.6' }}>
                A secure activation link has been dispatched to:
                <br />
                <strong style={{ color: 'var(--accent-gold)', fontSize: '1rem', display: 'inline-block', margin: '6px 0' }}>{registeredEmail}</strong>
              </p>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5', maxWidth: '360px', marginInline: 'auto' }}>
                Please check your student inbox (including spam/junk folder) and click the verification link to activate your voter profile.
              </p>

              {/* Demo Mode Override */}
              {import.meta.env.DEV && (
                <div style={{ marginBottom: '25px' }}>
                  <button 
                    onClick={() => {
                      localStorage.setItem(`tt_verified_${registeredEmail}`, "true");
                      alert(`[DEMO MODE] Simulated verification link clicked! Email ${registeredEmail} is now verified. You can now click PROCEED TO LOGIN to sign in!`);
                    }}
                    style={{
                      background: 'rgba(200, 150, 12, 0.15)',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      padding: '8px 18px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
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
                onClick={() => setPage('login')}
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)', 
                  color: '#0E0B00', 
                  border: 'none', 
                  borderRadius: '30px', 
                  padding: '13px 0',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(200, 150, 12, 0.25)',
                  transition: 'var(--transition-smooth)',
                  marginBottom: '20px',
                  textTransform: 'uppercase'
                }}
                className="btn-glow-gold"
              >
                PROCEED TO LOGIN
              </button>

              {/* Developer Demo simulation banner */}
              {import.meta.env.DEV && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1.2px dashed var(--glass-border)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  marginTop: '15px'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Demo Environment Action
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                    Since you are in local sandbox sync, click below to instantly verify the account and log in.
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem(`tt_verified_${registeredEmail}`, "true");
                      alert(`[DEMO MODE] Simulated verification link clicked! Email ${registeredEmail} is now verified. You can now log in successfully!`);
                      setPage('login');
                    }}
                    style={{
                      background: 'rgba(200, 150, 12, 0.15)',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    Simulate Verification Link Click
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h3 
                style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '900', 
                  color: 'var(--accent-gold)', 
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}
              >
                CREATE PROFILE
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '22px', fontWeight: '500', textAlign: 'center' }}>
                Register your student voter profile to participate in crowd polls.
              </p>

              {errorMsg && (
                <div style={{ padding: '10px 14px', background: 'rgba(230, 50, 50, 0.08)', border: '1px solid #e63232', color: '#e63232', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'center', lineHeight: '1.4' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSignUp}>
                <div className="signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: '24px' }}>
                  
                  {/* Full Name */}
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={inputStyle}
                      required
                      className="auth-input-field"
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Student Email *</label>
                    <input 
                      type="email" 
                      placeholder="e.g. john@aditya.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                      required
                      className="auth-input-field"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={inputStyle}
                      required
                      className="auth-input-field"
                    />
                  </div>

                  {/* Roll Number */}
                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Roll Number *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 22A91A0501"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                      style={inputStyle}
                      required
                      className="auth-input-field"
                    />
                  </div>

                  {/* School/College Select Dropdown */}
                  <div className="form-group animate-fade-in-up" style={{ textAlign: 'center', gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Select School / College *</label>
                    <select 
                      value={selectedParent}
                      onChange={(e) => {
                        const parentKey = e.target.value;
                        setSelectedParent(parentKey);
                        setSelectedLevel('');
                        
                        const parentObj = academicStructure[parentKey];
                        if (parentObj) {
                          if (!parentObj.levels) {
                            setCampus(parentObj.label);
                            setBranch(parentObj.defaultBranch || '');
                          } else {
                            setCampus('');
                            setBranch('');
                          }
                        }
                      }}
                      style={{ ...inputStyle, height: '48px', paddingBlock: '10px' }}
                      required
                      className="auth-input-field"
                    >
                      <option value="" disabled>-- Choose Your School --</option>
                      {Object.keys(academicStructure).map(key => (
                        <option key={key} value={key} style={{ background: '#0E0B00', color: '#FAF5E4' }}>{academicStructure[key].label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Program Level Select Dropdown */}
                  {selectedParent && academicStructure[selectedParent]?.levels && (
                    <div className="form-group animate-fade-in-up" style={{ textAlign: 'center', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Select Program Level *</label>
                      <select 
                        value={selectedLevel}
                        onChange={(e) => {
                          const lvlKey = e.target.value;
                          setSelectedLevel(lvlKey);
                          
                          const parentObj = academicStructure[selectedParent];
                          if (parentObj && parentObj.levels) {
                            const lvlObj = parentObj.levels[lvlKey];
                            if (lvlObj) {
                              setCampus(`${parentObj.label} - ${lvlObj.label}`);
                              setBranch(lvlObj.defaultBranch || '');
                            }
                          }
                        }}
                        style={{ ...inputStyle, height: '48px', paddingBlock: '10px' }}
                        required
                        className="auth-input-field"
                      >
                        <option value="" disabled>-- Choose Level --</option>
                        {Object.keys(academicStructure[selectedParent].levels).map(lvl => (
                          <option key={lvl} value={lvl} style={{ background: '#0E0B00', color: '#FAF5E4' }}>{academicStructure[selectedParent].levels[lvl].label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Specific Branch Select Dropdown */}
                  {selectedParent && (!academicStructure[selectedParent]?.levels || selectedLevel) && (
                    <div className="form-group animate-fade-in-up" style={{ textAlign: 'center', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Select Branch *</label>
                      <select 
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        style={{ ...inputStyle, height: '48px', paddingBlock: '10px' }}
                        required
                        className="auth-input-field"
                      >
                        {(() => {
                          const parentObj = academicStructure[selectedParent];
                          const branches = parentObj.levels ? parentObj.levels[selectedLevel]?.branches : parentObj.branches;
                          return (branches || []).map(b => (
                            <option key={b} value={b} style={{ background: '#0E0B00', color: '#FAF5E4' }}>{b}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  )}

                  {/* Password */}
                  <div className="form-group" style={{ textAlign: 'center', position: 'relative' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ ...inputStyle, paddingRight: '45px' }}
                        required
                        className="auth-input-field"
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
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group" style={{ textAlign: 'center', position: 'relative' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '4px', textAlign: 'center' }}>Confirm Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ ...inputStyle, paddingRight: '45px' }}
                        required
                        className="auth-input-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
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
                        title={showConfirmPassword ? "Hide Password" : "Show Password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Golden Register Button */}
                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B0820A 100%)', 
                    color: '#0E0B00', 
                    border: 'none', 
                    borderRadius: '30px', 
                    padding: '13px 0',
                    fontSize: '0.95rem',
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
                  {loading ? 'Creating Account...' : 'REGISTER'}
                </button>

              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0 12px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(200, 150, 12, 0.25)' }}></div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.08em' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(200, 150, 12, 0.25)' }}></div>
              </div>

              {/* Google Student Login */}
              <button 
                onClick={handleGoogleSignIn}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1.8px solid var(--accent-gold)',
                  borderRadius: '30px',
                  padding: '12px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'var(--transition-smooth)',
                  marginBottom: '20px',
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
                GOOGLE STUDENT SIGN UP
              </button>

              {/* Link to Dedicated Sign In */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>
                Already have an account?{' '}
                <span 
                  onClick={() => setPage('login')}
                  style={{ color: 'var(--accent-gold)', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Login
                </span>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .auth-split-container {
            grid-template-columns: 1fr !important;
          }
          .auth-left-visual {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .signup-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        .btn-glow-gold:hover {
          background: linear-gradient(135deg, var(--accent-gold-hover) 0%, var(--accent-gold) 100%) !important;
          box-shadow: 0 0 20px rgba(200, 150, 12, 0.45) !important;
          transform: translateY(-1px);
        }
        .btn-glow-gold:active {
          transform: translateY(0);
        }
        .google-btn:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 0 15px rgba(200, 150, 12, 0.3);
          transform: translateY(-1px);
        }
        .google-btn:active {
          transform: translateY(0);
        }
        .auth-input-field:focus {
          border-color: #FAF5E4 !important;
          box-shadow: 0 0 15px rgba(250, 245, 228, 0.25) !important;
        }
        .auth-box-overlay {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SignUp;
