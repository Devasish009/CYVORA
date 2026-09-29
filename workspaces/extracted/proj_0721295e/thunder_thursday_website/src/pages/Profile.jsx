// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import api from '../api';
import { 
  User, Mail, Phone, Layers, ShieldCheck, 
  ArrowLeft, Music, Sparkles, LogOut,
  MapPin, Hash, PlusCircle
} from 'lucide-react';

const Profile = ({ user, setPage, onBack }) => {
  const getInitials = (name) => {
    if (!name) return 'AU';
    const cleanName = name.trim();
    if (!cleanName) return 'AU';
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile Fields with initializers from localStorage
  const [studentName, setStudentName] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.name) return profile.name;
        } catch { /* ignore */ }
      }
      return user.displayName || '';
    }
    return '';
  });
  const studentEmail = user?.email || '';
  const [studentPhone, setStudentPhone] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.phone) return profile.phone;
        } catch { /* ignore */ }
      }
    }
    return '';
  });
  const [studentRollNo, setStudentRollNo] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.rollNo) return profile.rollNo;
        } catch { /* ignore */ }
      }
    }
    return '';
  });
  const [studentBranch, setStudentBranch] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.branch) return profile.branch.toUpperCase();
        } catch { /* ignore */ }
      }
    }
    return 'CSE';
  });
  const [studentCampus, setStudentCampus] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.campus) return profile.campus;
        } catch { /* ignore */ }
      }
    }
    return 'AEC Campus';
  });

  // Load user data & performance bookings in real-time
  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }

    setLoading(true);

    // 1. Subscribe to real-time User Profile updates
    const unsubscribeProfile = db.subscribeUserProfile(user.email, user.uid, (profile) => {
      if (profile) {
        if (profile.name) setStudentName(profile.name);
        if (profile.phone) setStudentPhone(profile.phone);
        if (profile.rollNo) setStudentRollNo(profile.rollNo);
        if (profile.branch) setStudentBranch(profile.branch.toUpperCase());
        if (profile.campus) setStudentCampus(profile.campus);
        
        localStorage.setItem(`tt_profile_${user.email}`, JSON.stringify(profile));
      }
    });

    // 2. Subscribe to real-time User Registrations updates
    const unsubscribeRegistrations = db.subscribeUserRegistrations(user.email, (fbRegistrations) => {
      setRegistrations(fbRegistrations);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribeProfile === 'function') unsubscribeProfile();
      if (typeof unsubscribeRegistrations === 'function') unsubscribeRegistrations();
    };
  }, [user, setPage]);

  // Handle Log out cleanly
  const handleSignOut = async () => {
    try {
      api.removeToken();
      localStorage.removeItem("tt_mock_user");
      window.dispatchEvent(new Event('storage'));
      await auth.signOut();
      setPage('landing');
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 'auto', overflowX: 'hidden' }}>
      
      {/* Background shimmers */}
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', top: '15%', left: '-5%', width: '450px', height: '450px', opacity: 0.1 }}></div>
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', bottom: '20%', right: '-5%', width: '450px', height: '450px', opacity: 0.1 }}></div>

      <section className="animate-fade-in-up profile-section" style={{ padding: '0px 8% 45px 8%', marginTop: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '0px', marginTop: '0px' }}>
          
          {/* Header navigation bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '15px' }}>
            <button 
              onClick={onBack || (() => setPage('landing'))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setPage('register')}
                className="btn-primary" 
                style={{ 
                  padding: '10px 18px', 
                  fontSize: '0.82rem', 
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(200, 150, 12, 0.2)' 
                }}
              >
                <PlusCircle size={15} /> Book Performance Slot
              </button>

              <button 
                onClick={handleSignOut} 
                className="btn-secondary" 
                style={{ padding: '10px 16px', fontSize: '0.82rem', gap: '8px' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }} className="profile-layout-grid">
            
            {/* LEFT PANEL: Student Profile Details card */}
            <div className="mockup-card" style={{ padding: '25px 30px 40px 30px', background: 'var(--bg-card)', position: 'sticky', top: '100px' }}>
              <div style={{ textAlign: 'center' }}>
                
                {/* Profile Initials DP with Verified Seal */}
                <div style={{ position: 'relative', width: '105px', height: '105px', margin: '0 auto 25px auto' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      borderRadius: '50%', 
                      border: '3.5px solid var(--accent-gold)', 
                      background: 'var(--bg-secondary)', 
                      color: 'var(--accent-gold)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontFamily: 'var(--font-display)', 
                      fontSize: '2rem', 
                      fontWeight: '900', 
                      textTransform: 'uppercase', 
                      boxShadow: 'inset 0 0 15px rgba(200, 150, 12, 0.15)' 
                    }}
                  >
                    {getInitials(studentName)}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '2px', 
                    right: '2px', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-gold)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#FAF5E4', 
                    border: '2.5px solid var(--bg-primary)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <ShieldCheck size={16} />
                  </div>
                </div>

                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '5px' }}>
                  {studentName || 'Aditya Student'}
                </h2>
                <p style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '30px' }}>
                  Student Performer Profile
                </p>

                {/* Info Fields Ledger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '24px 20px', borderRadius: 'var(--border-radius-md)' }}>
                  
                  {/* Name field */}
                  <div style={infoFieldWrapperStyle}>
                    <User size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={infoLabelStyle}>Full Name</span>
                      <span style={infoValueStyle}>{studentName || 'Not Provided'}</span>
                    </div>
                  </div>

                  {/* Email ID */}
                  <div style={infoFieldWrapperStyle}>
                    <Mail size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={infoLabelStyle}>Email ID</span>
                      <span style={{ ...infoValueStyle, textTransform: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={studentEmail}>
                        {studentEmail || 'Not Provided'}
                      </span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div style={infoFieldWrapperStyle}>
                    <Phone size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={infoLabelStyle}>Phone Number</span>
                      <span style={infoValueStyle}>{studentPhone || 'Not Provided'}</span>
                    </div>
                  </div>

                  {/* Campus Block */}
                  <div style={infoFieldWrapperStyle}>
                    <MapPin size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={infoLabelStyle}>Campus / College</span>
                      <span style={infoValueStyle}>{studentCampus || 'AEC Campus'}</span>
                    </div>
                  </div>

                  {/* Branch / Dept */}
                  <div style={infoFieldWrapperStyle}>
                    <Layers size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={infoLabelStyle}>Branch / Department</span>
                      <span style={infoValueStyle}>{studentBranch || 'CSE'}</span>
                    </div>
                  </div>

                  {/* Roll Number */}
                  {studentRollNo && (
                    <div style={infoFieldWrapperStyle}>
                      <Hash size={16} style={{ color: 'var(--accent-gold)', marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={infoLabelStyle}>Academic Roll No</span>
                        <span style={infoValueStyle}>{studentRollNo}</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* RIGHT PANEL: Slot application records count card */}
            <div className="mockup-card" style={{ padding: '25px 40px 40px 40px', background: 'var(--bg-card)', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Stage Ledger
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                Your Performance Bookings
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '30px' }}>
                Total count of your registered performers slots for Thunder Thursday.
              </p>

              {/* COUNT LOGIC */}
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px', gap: '15px' }}>
                  <div className="animate-spin" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3.5px solid rgba(200, 150, 12, 0.1)', borderTopColor: 'var(--accent-gold)' }}></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Retrieving stage registries...</p>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '40px 20px', 
                  border: '1.5px solid var(--glass-border)', 
                  borderRadius: 'var(--border-radius-lg)', 
                  background: 'var(--bg-secondary)',
                  textAlign: 'center',
                  gap: '20px'
                }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 150, 12, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                    <Music size={26} />
                  </div>

                  <div style={{ 
                    fontSize: '4.5rem', 
                    fontWeight: '900', 
                    color: 'var(--accent-gold)', 
                    fontFamily: 'var(--font-display)',
                    textShadow: '0 0 30px rgba(200, 150, 12, 0.3)',
                    lineHeight: '1'
                  }}>
                    {registrations.length}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      Performance Slot{registrations.length === 1 ? '' : 's'} Booked
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '350px', lineHeight: '1.4' }}>
                      {registrations.length === 0 
                        ? "You haven't locked in any stage showtimes for the upcoming week yet." 
                        : `You have successfully locked in ${registrations.length} showtime${registrations.length === 1 ? '' : 's'} for the upcoming Thunder Thursday!`}
                    </p>
                  </div>

                  <button onClick={() => setPage('register')} className="btn-primary" style={{ gap: '8px', marginTop: '10px' }}>
                    <Sparkles size={16} /> Showcase Your Talent
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Styled markup hover variables */}
      <style>{`
        .slot-card:hover {
          border-color: var(--accent-gold) !important;
          background: rgba(200, 150, 12, 0.03) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }
        @media (max-width: 992px) {
          .profile-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .mockup-card {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

    </div>
  );
};

// Internal Styling Subtokens
const infoFieldWrapperStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  paddingBottom: '12px'
};

const infoLabelStyle = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '2px'
};

const infoValueStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  fontWeight: '700',
  textTransform: 'capitalize'
};

export default Profile;
