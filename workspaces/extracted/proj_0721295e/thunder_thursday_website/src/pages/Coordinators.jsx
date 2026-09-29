// src/pages/Coordinators.jsx
import { useState } from 'react';
import { 
  Users, Calendar, ShieldCheck, 
  Trophy, Building, Search, Sparkles, User
} from 'lucide-react';

const LinkedinIcon = ({ size = 20 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#0A66C2" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="#0A66C2" />
    <rect width="4" height="12" x="2" y="9" rx="1" fill="#0A66C2" />
    <circle cx="4" cy="4" r="2" fill="#0A66C2" />
  </svg>
);

const Coordinators = () => {
  const [activeTab, setActiveTab] = useState('core'); // 'core', 'events', 'buildings'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBhavan, setSelectedBhavan] = useState('ALL');

  const facultyCoordinators = [
    {
      name: "Dr. D. Kishore",
      role: "Dean SA",
      linkedin: "https://www.linkedin.com/in/dr-kishore-dannina-43769b21/",
      photo: "https://old.adityauniversity.in/adtppu/staff_photos/Photo-1748078512022.jpeg"
    },
    {
      name: "Dr. N. Ram Babu",
      role: "SAC Convener",
      linkedin: "https://www.linkedin.com/in/dr-naladi-ram-babu-6593621aa/?skipRedirect=true",
      photo: "https://old.adityauniversity.in/adtppu/staff_photos/Photo-1752827564590.jpeg"
    },
    {
      name: "Abdul Arif",
      role: "SAC CO-Convener",
      linkedin: "https://www.linkedin.com/in/arif-abdul-80911b112?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      photo: "/abdul_arif.png"
    }
  ];

  const studentCoordinators = [
    {
      name: "P. Manikumar",
      role: "Head",
      dept: "James Watt Bhavan (JB)"
    },
    {
      name: "R. Prem Durga Sai",
      role: "Manager",
      dept: "Vishwesvaraya Bhavan (VB)"
    },
    {
      name: "P. Chandra Sekhar",
      role: "Secretary",
      dept: "CV Raman Bhavan (CV)"
    },
    {
      name: "Chaitanya Sri Balaji Putra",
      role: "Joint Secretary",
      dept: "Bill Gates Bhavan (BGB)"
    },
    {
      name: "K. Charan Kumar Reddy",
      role: "Treasurer",
      dept: "Bhaskara Bhavan (BB)"
    }
  ];

  const eventCoordinators = [
    {
      name: "K. Phani Sai",
      bhavan: "KLB (KL RAO Bhavan)"
    },
    {
      name: "K. Meghana",
      bhavan: "CV (CV Raman Bhavan)"
    },
    {
      name: "P. Manmadha Rao",
      bhavan: "APC (Aditya Pharamacy College)"
    },
    {
      name: "S. Pavani",
      bhavan: "CB (Cotton Bhavan)"
    }
  ];

  const buildingCoordinators = [
    { bhavan: "KLB (KL RAO Bhavan)", lead: "Sivakumar Tharun", supervision: "Media & Publicity" },
    { bhavan: "CB (Cotton Bhavan)", lead: "V. Rakesh", supervision: "Media & Publicity" },
    { bhavan: "BGB (Bill Gates Bhavan)", lead: "S. Sri Anjan Kumar", supervision: "Media & Publicity" },
    { bhavan: "BB (Bhaskara Bhavan)", lead: "K. Laxman Aditya Sri Santosh Reddy", supervision: "Logistics" },
    { bhavan: "BGB (Bill Gates Bhavan)", lead: "P. Ram Karthik", supervision: "Logistics" },
    { bhavan: "BB (Bhaskara Bhavan)", lead: "M. Dhakshinya", supervision: "Creative Team" },
    { bhavan: "BB (Bhaskara Bhavan)", lead: "J. Venkata Sai", supervision: "Creative Team" },
    { bhavan: "FB (Flemming Bhavan)", lead: "K. Bhavitha", supervision: "Member" },
    { bhavan: "PB (Pasteur Bhavan)", lead: "D. Madhuri", supervision: "Member" },
    { bhavan: "PB (Pasteur Bhavan)", lead: "K. Bhagya", supervision: "Member" },
    { bhavan: "BGB (Bill Gates Bhavan)", lead: "Kaki Suneela Srivarsha", supervision: "Member" },
    { bhavan: "CB (Cotton Bhavan)", lead: "CH. Mohith Vardhan", supervision: "Member" },
    { bhavan: "CB (Cotton Bhavan)", lead: "K. Harshitha", supervision: "Member" },
    { bhavan: "CV (CV Raman Bhavan)", lead: "K. Durga Prasad", supervision: "Member" },
    { bhavan: "EB (Einstein Bhavan)", lead: "CH. Rohith Sai", supervision: "Member" },
    { bhavan: "EB (Einstein Bhavan)", lead: "M. Kavya Sri", supervision: "Member" },
    { bhavan: "JB (James Watt Bhavan)", lead: "K. Ananya Chowdary", supervision: "Member" },
    { bhavan: "JB (James Watt Bhavan)", lead: "P. Sriya", supervision: "Member" },
    { bhavan: "KLB (KL RAO Bhavan)", lead: "V. Durga Lakshmi", supervision: "Member" },
    { bhavan: "NB (Newton Bhavan)", lead: "V. SRG Midhilesh", supervision: "Member" },
    { bhavan: "NB (Newton Bhavan)", lead: "B. Geetha", supervision: "Member" },
    { bhavan: "RB (Ramanujan Bhavan)", lead: "M. Valli", supervision: "Member" },
    { bhavan: "RB (Ramanujan Bhavan)", lead: "B. Siddhardh", supervision: "Member" },
    { bhavan: "SOB (School Of Business)", lead: "Bhavana Kothalanka", supervision: "Member" },
    { bhavan: "SOB (School Of Business)", lead: "R. Madhurya", supervision: "Member" },
    { bhavan: "VB (Vishwesvaraya Bhavan)", lead: "K. Neeraja", supervision: "Member" },
    { bhavan: "VB (Vishwesvaraya Bhavan)", lead: "G. Vijay Shankar Pani", supervision: "Member" },
    { bhavan: "RTB (Ratan Tata Bhavan)", lead: "M. Rahul", supervision: "Member" },
    { bhavan: "RTB (Ratan Tata Bhavan)", lead: "B. Sagar", supervision: "Member" }
  ];

  const filteredBuildings = buildingCoordinators.filter(row => {
    const matchesSearch = row.lead.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.supervision.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBhavan = selectedBhavan === 'ALL' || row.bhavan.includes(`(${selectedBhavan})`) || row.bhavan.startsWith(selectedBhavan);
    return matchesSearch && matchesBhavan;
  });

  return (
    <div style={{ position: 'relative' }}>
      <div className="glow-bg-radial" style={{ top: '15%', right: '-10%' }}></div>
      <div className="glow-bg-radial" style={{ bottom: '25%', left: '-15%' }}></div>

      <section className="section-padding animate-fade-in-up" style={{ paddingTop: '48px' }}>
        <h2 className="section-title">Co-ordinators</h2>
        <p className="section-subtitle">Meet the team dedicated to bringing the storm of Thunder Thursday alive every week at Aditya University.</p>

        {/* Tabbed Selector */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '40px',
            maxWidth: '850px',
            marginInline: 'auto'
          }}
          className="coordinators-tabs-container"
        >
          <button 
            onClick={() => setActiveTab('core')}
            style={{
              flex: 1, padding: '15px 10px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition-smooth)',
              backgroundColor: activeTab === 'core' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'core' ? '#0E0B00' : 'var(--text-primary)',
              boxShadow: activeTab === 'core' ? '0 5px 15px rgba(200, 150, 12, 0.25)' : 'none'
            }}
          >
            <Users size={18} /> Core Thunder Team
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            style={{
              flex: 1, padding: '15px 10px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition-smooth)',
              backgroundColor: activeTab === 'events' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'events' ? '#0E0B00' : 'var(--text-primary)',
              boxShadow: activeTab === 'events' ? '0 5px 15px rgba(200, 150, 12, 0.25)' : 'none'
            }}
          >
            <Calendar size={18} /> Event Representatives
          </button>
          <button 
            onClick={() => setActiveTab('buildings')}
            style={{
              flex: 1, padding: '15px 10px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'var(--transition-smooth)',
              backgroundColor: activeTab === 'buildings' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
              color: activeTab === 'buildings' ? '#0E0B00' : 'var(--text-primary)',
              boxShadow: activeTab === 'buildings' ? '0 5px 15px rgba(200, 150, 12, 0.25)' : 'none'
            }}
          >
            <Building size={18} /> Program Representatives
          </button>
        </div>

        {/* ---------------- 1. CORE THUNDER TEAM TAB ---------------- */}
        {activeTab === 'core' && (
          <div className="animate-fade-in-up">
            {/* Section A: Faculty Advisors */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '10px', textAlign: 'center', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-gold)' }}>
                <ShieldCheck size={24} /> Faculty Co-ordinators
              </h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '20px', fontWeight: '500', fontStyle: 'italic' }}>
                "The Architects of Thunder Thursday"
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {facultyCoordinators.map((coordinator, idx) => (
                  <div 
                    key={idx} 
                    className="glass-card faculty-card animate-pulse-glow" 
                    style={{ 
                      padding: '24px 30px', 
                      width: '100%', 
                      maxWidth: '430px', 
                      borderColor: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '24px',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      {coordinator.photo ? (
                        <img 
                          src={coordinator.photo} 
                          alt={coordinator.name} 
                          style={{ 
                            width: '90px', 
                            height: '90px', 
                            borderRadius: '50%', 
                            objectFit: 'cover', 
                            border: '2px solid var(--accent-gold)',
                            boxShadow: '0 4px 10px rgba(200, 150, 12, 0.2)'
                          }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '90px', 
                            height: '90px', 
                            borderRadius: '50%', 
                            background: 'var(--bg-secondary)', 
                            border: '2px solid var(--glass-border)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <User size={34} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '2px', lineHeight: '1.2' }}>{coordinator.name}</h4>
                      <p style={{ color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{coordinator.role}</p>
                      
                      {coordinator.linkedin && (
                        <a 
                          href={coordinator.linkedin} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            color: '#0A66C2', 
                            textDecoration: 'none', 
                            fontWeight: '700', 
                            fontSize: '0.88rem',
                            padding: '6px 14px',
                            background: 'rgba(10, 102, 194, 0.1)',
                            borderRadius: '15px',
                            border: '1px solid rgba(10, 102, 194, 0.2)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <LinkedinIcon size={12} />
                          <span>Connect</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Student Leads */}
            <div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '10px', textAlign: 'center', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-gold)' }}>
                <Sparkles size={24} /> Student Co-ordinators
              </h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '20px', fontWeight: '500', fontStyle: 'italic' }}>
                "The Core Team Behind the Energy"
              </p>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '40px' }}>
                Core Thunder - Team
              </p>
              
              <div className="grid-2" style={{ maxWidth: '850px', margin: '0 auto', gap: '30px' }}>
                {studentCoordinators.map((coordinator, idx) => (
                  <div 
                    key={idx} 
                    className="glass-card" 
                    style={{ 
                      padding: '25px', 
                      background: 'var(--bg-secondary)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>{coordinator.name}</h4>
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: 'rgba(200, 150, 12, 0.1)', color: 'var(--accent-gold)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {coordinator.role}
                      </span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0px' }}>
                        Bhavan Stationed: <strong>{coordinator.dept}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. EVENT CO-ORDINATORS TAB ---------------- */}
        {activeTab === 'events' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '950px', marginInline: 'auto' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '15px', textAlign: 'center', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-gold)' }}>
              <Trophy size={24} /> Event Representatives
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '35px', maxWidth: '600px', marginInline: 'auto' }}>
              Responsible for reviewing talent portfolios, stage auditions, backstage queue alignment, and approving live acts.
            </p>

            {/* Desktop Table View */}
            <div className="coordinators-table-view mockup-card" style={{ overflowX: 'auto', border: '2px solid var(--accent-gold)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--accent-gold)', color: '#0E0B00', fontWeight: '800', borderBottom: '2px solid var(--accent-gold)' }}>
                    <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Event Representative</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Bhavan Block</th>
                  </tr>
                </thead>
                <tbody>
                  {eventCoordinators.map((row, index) => (
                    <tr 
                      key={index} 
                      style={{ 
                        borderBottom: '1px solid var(--glass-border)',
                        background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.04)',
                        transition: 'var(--transition-smooth)'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '18px 20px', fontSize: '0.92rem', fontWeight: '700', color: 'var(--accent-gold)' }}>{row.name}</td>
                      <td style={{ padding: '18px 20px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{row.bhavan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="coordinators-cards-view" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
              {eventCoordinators.map((row, index) => (
                <div 
                  key={index} 
                  className="glass-card" 
                  style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px', 
                    textAlign: 'left',
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{row.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Bhavan: <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{row.bhavan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 3. BUILDING CO-ORDINATORS TAB ---------------- */}
        {activeTab === 'buildings' && (
          <div className="animate-fade-in-up" style={{ maxWidth: '950px', marginInline: 'auto' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '15px', textAlign: 'center', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--accent-gold)' }}>
              <Building size={24} /> Program Representatives
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '35px', maxWidth: '600px', marginInline: 'auto' }}>
              Representatives stationed at specific campus bhavans to verify performer credentials, manage physical setups, and handle dynamic lineup adjustments.
            </p>

            {/* Premium Search and Filter Bar */}
            <div 
              style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '25px',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              className="search-filter-container"
            >
              {/* Search Field */}
              <div style={{ position: 'relative', flex: '1 1 300px' }} className="search-field-container">
                <input 
                  type="text"
                  placeholder="Search by coordinator name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 20px 12px 42px',
                    borderRadius: '30px',
                    border: '1.8px solid var(--glass-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                  className="search-input-field"
                />
                <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 10 }} />
              </div>

              {/* Bhavan Filter Dropdown */}
              <select
                value={selectedBhavan}
                onChange={(e) => setSelectedBhavan(e.target.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '30px',
                  border: '1.8px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className="bhavan-select-field"
              >
                <option value="ALL">All Bhavan Blocks</option>
                <option value="AKB">AKB (Abdul Kalaam Bhavan)</option>
                <option value="APC">APC (Aditya Pharamacy College)</option>
                <option value="BB">BB (Bhaskara Bhavan)</option>
                <option value="BGB">BGB (Bill Gates Bhavan)</option>
                <option value="CB">CB (Cotton Bhavan)</option>
                <option value="CV">CV (CV Raman Bhavan)</option>
                <option value="EB">EB (Einstein Bhavan)</option>
                <option value="FB">FB (Flemming Bhavan)</option>
                <option value="JB">JB (James Watt Bhavan)</option>
                <option value="KLB">KLB (KL RAO Bhavan)</option>
                <option value="NB">NB (Newton Bhavan)</option>
                <option value="PB">PB (Pasteur Bhavan)</option>
                <option value="RB">RB (Ramanujan Bhavan)</option>
                <option value="RTB">RTB (Ratan Tata Bhavan)</option>
                <option value="SOB">SOB (School Of Business)</option>
                <option value="VB">VB (Vishwesvaraya Bhavan)</option>
              </select>
            </div>

            {/* Desktop Table View */}
            <div className="coordinators-table-view mockup-card" style={{ overflowX: 'auto', border: '2px solid var(--accent-gold)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--accent-gold)', color: '#0E0B00', fontWeight: '800', borderBottom: '2px solid var(--accent-gold)' }}>
                    <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Bhavan Block</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Representative Name</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>Official Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuildings.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No representatives found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBuildings.map((row, index) => (
                      <tr 
                        key={index} 
                        style={{ 
                          borderBottom: '1px solid var(--glass-border)',
                          background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.04)',
                          transition: 'var(--transition-smooth)'
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '18px 20px', fontSize: '0.92rem', fontWeight: '700', color: 'var(--accent-gold)' }}>{row.bhavan}</td>
                        <td style={{ padding: '18px 20px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{row.lead}</td>
                        <td style={{ padding: '18px 20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '15px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {row.supervision}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="coordinators-cards-view" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
              {filteredBuildings.length === 0 ? (
                <div 
                  className="glass-card" 
                  style={{ 
                    padding: '30px', 
                    textAlign: 'center', 
                    color: 'var(--text-muted)', 
                    fontSize: '0.9rem',
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  No representatives found matching the filter criteria.
                </div>
              ) : (
                filteredBuildings.map((row, index) => (
                  <div 
                    key={index} 
                    className="glass-card" 
                    style={{ 
                      padding: '16px 20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px', 
                      textAlign: 'left',
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--glass-border)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{row.bhavan}</div>
                      <span style={{ display: 'inline-block', padding: '3px 8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {row.supervision}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Representative: <span style={{ color: 'var(--text-primary)', fontWeight: '800' }}>{row.lead}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* Internal Coordinators Style */}
      <style>{`
        .table-row-hover:hover {
          background-color: rgba(200, 150, 12, 0.06) !important;
        }
        .search-input-field:focus {
          border-color: var(--accent-gold) !important;
          box-shadow: 0 0 10px rgba(200, 150, 12, 0.15) !important;
        }
        .bhavan-select-field:focus {
          border-color: var(--accent-gold) !important;
        }
        @media (max-width: 768px) {
          .coordinators-tabs-container {
            flex-direction: column !important;
            gap: 8px !important;
            padding: 0 10px !important;
          }
          .search-filter-container {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-field-container {
            flex: none !important;
            width: 100% !important;
          }
          .bhavan-select-field {
            width: 100% !important;
          }
        }
        @media (max-width: 600px) {
          .coordinators-table-view {
            display: none !important;
          }
          .coordinators-cards-view {
            display: flex !important;
          }
        }
        @media (max-width: 480px) {
          .faculty-card {
            flex-direction: column !important;
            text-align: center !important;
            align-items: center !important;
            padding: 20px !important;
          }
          .faculty-card div {
            align-items: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Coordinators;
