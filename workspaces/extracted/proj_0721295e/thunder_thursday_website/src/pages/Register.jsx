// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import api from '../api';
import { 
  School, CheckCircle, Phone, 
  Building, User, Music, Globe, Layers, BookOpen,
  ChevronRight, ArrowLeft, GraduationCap, FlaskConical, Award,
  Mail, Users, Lock, Clock
} from 'lucide-react';
import { academicStructure } from '../academicStructure';

// Unified helper constants & utility functions outside component to avoid recreation & simplify useEffect
const categoriesList = [
  { id: "acting_stage", label: "Acting & Stage" },
  { id: "dance", label: "Dance" },
  { id: "music", label: "Music" },
  { id: "fine_arts", label: "Fine Arts & Creative Expression" },
  { id: "literary_comm", label: "Literary & Communication" },
  { id: "mind_games", label: "Mind Games & Brain Challenges" }
];

const eventsByCategory = {
  "acting_stage": ["Mono Action", "Drama / Play", "Mime", "Mimicry", "Standup Comedy", "Skit", "Martial Arts", "Others"],
  "dance": ["Solo Dance (Classical)", "Solo Dance (Western/Folk)", "Duet Dance", "Group Choreography (Folk/Classical)", "Group Choreography (Western/Hip-hop)", "Flash Mob", "Others"],
  "music": ["Solo Singing (Classical)", "Solo Singing (Light/Pop)", "Duet Singing", "Instrumental Solo (Acoustic)", "Instrumental Solo (Percussion)", "Band Showcase", "Others"],
  "fine_arts": ["Rangoli", "Craft / Origami", "Others"],
  "literary_comm": ["Elocution (English/Telugu/Hindi)", "Debate & Panel Discussion", "Poetry Recitation", "Creative Writing", "Spelling Bee", "Others"],
  "mind_games": ["General Trivia Quiz", "Puzzle / Riddle Solving", "Others"]
};

const getAllBranches = () => {
  const flatList = [];
  Object.keys(academicStructure).forEach(key => {
    const schoolObj = academicStructure[key];
    if (schoolObj.branches) {
      flatList.push(...schoolObj.branches);
    } else if (schoolObj.levels) {
      Object.keys(schoolObj.levels).forEach(lvl => {
        flatList.push(...schoolObj.levels[lvl].branches);
      });
    }
  });
  return flatList;
};

const resolveBranch = (input) => {
  if (!input) return "B.Tech. - Computer Science and Engineering";
  const cleaned = input.trim().toUpperCase();
  const flatBranches = getAllBranches();
  
  // Exact match (case insensitive)
  const exact = flatBranches.find(b => b.toUpperCase() === cleaned);
  if (exact) return exact;

  // Fuzzy cleanups
  if (cleaned === 'CSE' || cleaned.includes('COMPUTER SCIENCE')) {
    return "B.Tech. - Computer Science and Engineering";
  }
  if (cleaned === 'CIVIL' || cleaned.includes('CIVIL')) return "B.Tech. - Civil Engineering";
  if (cleaned === 'AIML' || cleaned === 'AI & ML' || cleaned.includes('ARTIFICIAL INTELLIGENCE')) return "B.Tech. - Artificial Intelligence & Machine Learning (AI & ML)";
  if (cleaned === 'ECE' || cleaned.includes('ELECTRONICS')) return "B.Tech. - Electronics and Communication Engineering";
  if (cleaned === 'EEE' || cleaned.includes('ELECTRICAL')) return "B.Tech. - Electrical and Electronics Engineering";
  if (cleaned === 'MECH' || cleaned.includes('MECHANICAL')) return "B.Tech. - Mechanical Engineering";
  if (cleaned === 'MINING' || cleaned.includes('MINING')) return "B.Tech. - Mining Engineering";
  if (cleaned === 'PETROLEUM' || cleaned.includes('PETROLEUM')) return "B.Tech. - Petroleum Technology";
  if (cleaned === 'AGRICULTURE' || cleaned.includes('AGRICULTURAL')) return "B.Tech. - Agricultural Engineering";
  if (cleaned === 'BCA' || cleaned.includes('BCA')) return "Bachelor of Computer Applications (BCA)";
  if (cleaned === 'MCA' || cleaned.includes('MCA')) return "Master of Computer Applications (MCA)";
  
  // School of Business mappings
  if (cleaned === 'BBA' || cleaned.includes('BUSINESS ADMINISTRATION') || cleaned.includes('BBA')) return "Bachelor of Business Administration";
  if (cleaned === 'MBA' || cleaned.includes('MASTER OF BUSINESS') || cleaned.includes('MBA')) return "Master of Business Administration";
  
  // School of Science mappings
  if (cleaned === 'BSC' || cleaned === 'B.SC' || cleaned.includes('BACHELOR OF SCIENCE')) return "B.Sc. Forensic Science";
  if (cleaned === 'MSC' || cleaned === 'M.SC' || cleaned.includes('MASTER OF SCIENCE')) return "M.Sc - Forensic Science";
  
  // School of Pharmacy mappings
  if (cleaned === 'BPHARM' || cleaned === 'B.PHARM' || cleaned === 'B.PHARMACY' || cleaned === 'BPHARMACY' || cleaned.includes('PHARMACY') || cleaned.includes('BACHELOR OF PHARMACY')) return "Bachelor of Pharmacy (B.Pharm)";
  if (cleaned === 'PHARMD' || cleaned === 'PHARM.D' || cleaned.includes('DOCTOR OF PHARMACY')) return "Doctor of Philosophy (Ph.D) - Pharmacy";
  if (cleaned === 'MPHARM' || cleaned === 'M.PHARM' || cleaned === 'M.PHARMACY' || cleaned === 'MPHARMACY' || cleaned.includes('MASTER OF PHARMACY')) return "M.Pharm - Pharmaceutics";

  // Polytechnic / Diploma mappings
  if (cleaned.startsWith('DIPLOMA') || cleaned.startsWith('POLY') || cleaned.includes('POLYTECHNIC')) {
    if (cleaned.includes('CIVIL')) return "Diploma - Civil Engineering";
    if (cleaned.includes('EEE') || cleaned.includes('ELECTRICAL')) return "Diploma - Electrical and Electronics Engineering";
    if (cleaned.includes('MECH') || cleaned.includes('MECHANICAL')) return "Diploma - Mechanical Engineering";
    if (cleaned.includes('ECE') || cleaned.includes('ELECTRONICS')) return "Diploma - Electronics and Communication Engineering";
    if (cleaned.includes('CSE') || cleaned.includes('COMPUTER')) return "Diploma - Computer Science and Engineering";
    if (cleaned.includes('COMMUNICATION') || cleaned.includes('NETWORKING')) return "Diploma - Communication & Computer Networking";
  }

  // ACET mappings
  if (cleaned.startsWith('ACET')) {
    if (cleaned.includes('CIVIL')) return "ACET - Civil Engineering";
    if (cleaned.includes('EEE') || cleaned.includes('ELECTRICAL')) return "ACET - Electrical and Electronics Engineering";
    if (cleaned.includes('MECH') || cleaned.includes('MECHANICAL')) return "ACET - Mechanical Engineering";
    if (cleaned.includes('ECE') || cleaned.includes('ELECTRONICS')) return "ACET - Electronics and Communication Engineering";
    if (cleaned.includes('AIML') || cleaned.includes('AI & ML') || cleaned.includes('AI&ML')) return "ACET - Computer Science and Engineering (AI&ML)";
    if (cleaned.includes('IOT')) return "ACET - Computer Science and Engineering (IOT)";
    if (cleaned.includes('CSE') || cleaned.includes('COMPUTER')) return "ACET - Computer Science and Engineering";
    if (cleaned.includes('DS') || cleaned.includes('DATA SCIENCE')) return "ACET - Computer Science and Engineering (DS)";
    if (cleaned.includes('MBA') || cleaned.includes('BUSINESS')) return "ACET - Master of Business Administration";
  }

  if (cleaned === 'PHD' || cleaned.includes('PH.D')) {
    if (cleaned.includes('BUSINESS')) return "Doctor of Philosophy (Ph.D) - Business";
    if (cleaned.includes('SCIENCE')) return "Doctor of Philosophy (Ph.D) - Science";
    if (cleaned.includes('PHARM') || cleaned.includes('PHARMACY')) return "Doctor of Philosophy (Ph.D) - Pharmacy";
    return "Doctor of Philosophy (Ph.D) - Engineering";
  }
  
  const match = flatBranches.find(b => b.toUpperCase().includes(cleaned));
  return match || "B.Tech. - Computer Science and Engineering";
};

const getFilteredBranches = (parent, level) => {
  if (!parent) return [];
  const parentObj = academicStructure[parent];
  if (!parentObj) return [];
  if (parentObj.levels) {
    if (!level) return [];
    const lvlObj = parentObj.levels[level];
    return lvlObj ? lvlObj.branches : [];
  }
  return parentObj.branches || [];
};

// Year of Study drop-down options
const yearsList = [
  "1st Year", "2nd Year", "3rd Year", "4th Year", "PG",
  "Diploma-1st", "Diploma-2nd", "Diploma-3rd"
];

// Helper to get dynamically filtered years list based on school, program level, and Ph.D Type
const getYearsForProgram = (schoolKey, levelKey, phdType = 'Full-Time', branchName = '') => {
  if (branchName && (branchName.includes("Pharm.D") || branchName.includes("Doctor of Pharmacy"))) {
    return ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"];
  }
  if (branchName && (branchName.includes("BCA") || branchName.includes("Bachelor of Computer Applications"))) {
    return ["1st Year", "2nd Year", "3rd Year"];
  }
  if (schoolKey === 'poly') {
    return ["1st Year", "2nd Year", "3rd Year"];
  }
  if (levelKey === 'phd') {
    if (phdType === 'Part-Time') {
      return [
        "1st Year", "2nd Year", "3rd Year", "4th Year", 
        "5th Year", "6th Year", "7th Year", "8th Year", "9th Year"
      ];
    } else {
      return [
        "1st Year", "2nd Year", "3rd Year", "4th Year", 
        "5th Year", "6th Year", "7th Year"
      ];
    }
  }
  if (schoolKey === 'sciences' && levelKey === 'ug') {
    return ["1st Year", "2nd Year", "3rd Year"];
  }
  if (schoolKey === 'business' && levelKey === 'ug') {
    return ["1st Year", "2nd Year", "3rd Year"];
  }
  if (levelKey === 'ug') {
    return ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  }
  if (levelKey === 'pg') {
    return ["1st Year", "2nd Year"];
  }
  return ["1st Year", "2nd Year", "3rd Year", "4th Year"];
};

// Bhavan drop-down options
const bhavansList = [
  "Cotton Bhavan",
  "Ratan Tata Bhavan",
  "KL RAO Bhavan",
  "Bill Gates Bhavan",
  "Vishwesvaraya Bhavan",
  "Bhaskara Bhavan",
  "CV Raman Bhavan",
  "Ramanujan Bhavan",
  "James Watt Bhavan",
  "Newton Bhavan",
  "Abdul Kalaam Bhavan",
  "Flemming Bhavan",
  "Einstein Bhavan",
  "Pasteur Bhavan",
  "School Of Business",
  "Aditya Pharamacy College"
];

const Register = ({ user, setPage, backRef }) => {
  const [regSuccess, setRegSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Wizard Curation Steps State
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedParent, setSelectedParent] = useState(''); 
  const [selectedLevel, setSelectedLevel] = useState(''); 

  // 1. Personal Details State with initializers from local storage
  const [perfName, setPerfName] = useState(() => {
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
  const [perfEmail, setPerfEmail] = useState(() => user?.email || '');
  const [perfPhone, setPerfPhone] = useState(() => {
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
  const [perfRollNo, setPerfRollNo] = useState(() => {
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

  const [perfRegion, setPerfRegion] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.region) return profile.region;
        } catch { /* ignore */ }
      }
    }
    return 'AP';
  });

  // 2. Academic Details State
  const [perfSchool, setPerfSchool] = useState(''); // Dynamically mapped from selection
  const [perfDept, setPerfDept] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`tt_profile_${user.email}`);
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.branch) return resolveBranch(profile.branch);
        } catch { /* ignore */ }
      }
    }
    return 'B.Tech. - Computer Science and Engineering';
  });
  const [perfYear, setPerfYear] = useState('2nd Year');
  const [perfPhdType, setPerfPhdType] = useState('Full-Time');
  const [perfBhavan, setPerfBhavan] = useState('Bill Gates Bhavan');

  // 3. Event Details State
  const [perfCategory, setPerfCategory] = useState('');
  const [perfSpecificEvent, setPerfSpecificEvent] = useState('');
  const [otherEventText, setOtherEventText] = useState('');
  const [perfTeamSize, setPerfTeamSize] = useState('1'); // Default Solo
  const [perfDescription, setPerfDescription] = useState('');

  const [teamMembers, setTeamMembers] = useState([]);

  // Sync team members array length when team size changes
  const handleTeamSizeChange = (sizeStr, overrideEvent) => {
    const size = parseInt(sizeStr) || 1;
    const lowerEvent = (overrideEvent || perfSpecificEvent).toLowerCase();

    // 1. If currently a Group event and trying to decrease team size
    if (lowerEvent.includes('group')) {
      if (size === 2) {
        // Move the group to duet
        const duetEvent = eventsByCategory[perfCategory]?.find(ev => ev.toLowerCase().includes('duet'));
        if (duetEvent) {
          setPerfSpecificEvent(duetEvent);
        } else {
          return;
        }
      } else if (size === 1) {
        // Move the group to solo
        const soloEvent = eventsByCategory[perfCategory]?.find(ev => ev.toLowerCase().includes('solo'));
        if (soloEvent) {
          setPerfSpecificEvent(soloEvent);
        } else {
          return;
        }
      } else if (size < 3) {
        // Don't allow decreasing below 3 for group unless transitioning
        return;
      }
    }

    // 2. If currently a Duet event and trying to change team size
    if (lowerEvent.includes('duet')) {
      if (size === 1) {
        // Move the duet to solo
        const soloEvent = eventsByCategory[perfCategory]?.find(ev => ev.toLowerCase().includes('solo'));
        if (soloEvent) {
          setPerfSpecificEvent(soloEvent);
        } else {
          return;
        }
      } else if (size !== 2) {
        // Duet size must be strictly 2
        return;
      }
    }

    // 3. If currently a Solo event and trying to change team size
    if (lowerEvent.includes('solo')) {
      if (size !== 1) {
        // Solo size must be strictly 1
        return;
      }
    }

    setPerfTeamSize(sizeStr);
    const countNeeded = size - 1;
    setTeamMembers(prev => {
      const next = [...prev];
      if (countNeeded <= 0) {
        return [];
      }
      if (next.length < countNeeded) {
        for (let i = next.length; i < countNeeded; i++) {
          next.push({
            name: '',
            rollNo: '',
            schoolKey: '',
            levelKey: '',
            school: '',
            branch: '',
            year: '2nd Year',
            region: 'AP'
          });
        }
      } else if (next.length > countNeeded) {
        next.splice(countNeeded);
      }
      return next;
    });
  };

  const handleSpecificEventChange = (val) => {
    setPerfSpecificEvent(val);
    if (val !== 'Others') {
      setOtherEventText('');
    }
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('duet')) {
      handleTeamSizeChange('2', val);
    } else if (lowerVal.includes('group')) {
      handleTeamSizeChange('3', val);
    } else if (lowerVal.includes('solo')) {
      handleTeamSizeChange('1', val);
    }
  };

  const handleMemberChange = (index, field, value) => {
    setTeamMembers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'branch') {
        const m = next[index];
        const validYears = getYearsForProgram(m.schoolKey, m.levelKey, m.phdType || 'Full-Time', value);
        if (!validYears.includes(m.year)) {
          next[index].year = validYears[0];
        }
      }
      return next;
    });
  };

  const handleMemberSchoolChange = (index, schoolKey) => {
    setTeamMembers(prev => {
      const next = [...prev];
      const schoolObj = academicStructure[schoolKey];
      let defaultBranch = '';
      let levelKey = '';
      const schoolLabel = schoolObj ? schoolObj.label : '';

      if (schoolObj && schoolObj.levels) {
        levelKey = '';
        defaultBranch = '';
      } else if (schoolObj) {
        defaultBranch = schoolObj.defaultBranch || (schoolObj.branches ? schoolObj.branches[0] : '');
      }

      next[index] = {
        ...next[index],
        schoolKey,
        levelKey,
        school: schoolLabel,
        branch: defaultBranch,
        year: getYearsForProgram(schoolKey, '')[0]
      };
      return next;
    });
  };

  const handleMemberLevelChange = (index, levelKey) => {
    setTeamMembers(prev => {
      const next = [...prev];
      const schoolKey = next[index].schoolKey;
      const schoolObj = academicStructure[schoolKey];
      if (schoolObj && schoolObj.levels) {
        const lvlObj = schoolObj.levels[levelKey];
        const schoolLabel = `${schoolObj.label} - ${lvlObj ? lvlObj.label : ''}`;
        const defaultBranch = lvlObj ? (lvlObj.defaultBranch || (lvlObj.branches ? lvlObj.branches[0] : '')) : '';

        next[index] = {
          ...next[index],
          levelKey,
          school: schoolLabel,
          branch: defaultBranch,
          year: getYearsForProgram(schoolKey, levelKey)[0]
        };
      }
      return next;
    });
  };

  // Sync performer and profile data when user is logged in
  useEffect(() => {
    if (!user) return;

    const syncProfile = async () => {
      try {
        const profile = await db.getParticipantProfile(user.email, user.uid);
        if (profile) {
          if (profile.name) setPerfName(profile.name);
          if (profile.email) setPerfEmail(profile.email);
          if (profile.phone) setPerfPhone(profile.phone);
          if (profile.rollNo) setPerfRollNo(profile.rollNo);
          if (profile.branch) setPerfDept(resolveBranch(profile.branch));
          if (profile.region) setPerfRegion(profile.region);
          
          localStorage.setItem(`tt_profile_${user.email}`, JSON.stringify(profile));
        }
      } catch (e) {
        console.warn("Firestore profile sync failed in Register, relying on cache:", e);
      }
    };

    syncProfile();
  }, [user]);

  // Helper: Reset selection state
  const resetSelection = () => {
    setSelectedParent('');
    setSelectedLevel('');
    setWizardStep(1);
    setErrorMsg('');
  };

  const handleWizardBack = () => {
    if (wizardStep === 3) {
      const parentObj = academicStructure[selectedParent];
      if (parentObj && parentObj.levels) {
        setWizardStep(2);
        setSelectedLevel('');
      } else {
        resetSelection();
      }
    } else if (wizardStep === 2) {
      resetSelection();
    }
  };

  useEffect(() => {
    if (backRef) {
      backRef.current = () => {
        if (wizardStep > 1) {
          handleWizardBack();
          return true; // handled
        }
        return false; // not handled
      };
    }
    return () => {
      if (backRef) backRef.current = null;
    };
  }, [wizardStep, selectedParent, backRef]);

  // Step 1 Click Handler
  const handleParentSelect = (parent) => {
    setSelectedParent(parent);
    const targetSchool = academicStructure[parent];
    if (targetSchool.levels) {
      setWizardStep(2);
    } else {
      // Direct to Step 3 for flat branch structures
      setPerfSchool(targetSchool.label);
      setPerfDept(targetSchool.defaultBranch);
      setPerfYear(getYearsForProgram(parent, '')[0]);
      setWizardStep(3);
    }
  };

  // Step 2 Click Handler
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    const parentObj = academicStructure[selectedParent];
    const lvlObj = parentObj.levels[level];
    setPerfSchool(`${parentObj.label} - ${lvlObj.label}`);
    setPerfDept(lvlObj.defaultBranch);
    setPerfYear(getYearsForProgram(selectedParent, level, perfPhdType)[0]);
    setWizardStep(3);
  };

  // Handle Performer Registration Submit
  const handleRegisterPerformer = async (e) => {
    e.preventDefault();
    if (!perfName || !perfEmail || !perfPhone) {
      setErrorMsg('Please fill in all personal details.');
      return;
    }
    if (!perfCategory || !perfSpecificEvent) {
      setErrorMsg('Please select both Event Category and Specific Event.');
      return;
    }
    if (perfSpecificEvent === 'Others' && !otherEventText.trim()) {
      setErrorMsg('Please specify custom event name.');
      return;
    }
    
    const finalSpecificEvent = perfSpecificEvent === 'Others' ? `Others: ${otherEventText}` : perfSpecificEvent;
    
    setLoading(true);
    setErrorMsg('');
    try {
      try {
        const hasSqlSession = api.getToken() && user?.uid?.startsWith("sql_");
        if (!hasSqlSession) {
          throw new Error("No active SQL backend session. Routing to Firebase direct registry.");
        }

        // 1. Attempt PostgreSQL Express API Booking
        const schoolOption = perfSchool;
        const categoryOption = categoriesList.find(c => c.id === perfCategory)?.label || perfCategory;
        
        // Assemble detailed description to feed rich attributes to the backend
        const detailedDescription = JSON.stringify({
          specific_event: finalSpecificEvent,
          team_size: parseInt(perfTeamSize),
          contact_phone: perfPhone,
          bhavan: perfBhavan,
          department: perfDept,
          year: perfYear,
          email: perfEmail,
          roll_no: perfRollNo,
          region: perfRegion,
          team_members: teamMembers.map(m => ({
            name: m.name,
            roll_no: m.rollNo,
            school: m.school,
            branch: m.branch,
            year: m.year,
            region: m.region
          }))
        });

        await api.bookSlot(
          schoolOption,
          categoryOption,
          detailedDescription,
          perfName,
          perfBhavan,
          perfYear
        );
        
        setRegSuccess(true);
        setPerfCategory('');
        setPerfSpecificEvent('');
        setOtherEventText('');
        setPerfTeamSize('1');
        setTeamMembers([]);
        resetSelection();
      } catch (apiErr) {
        const hasSqlSession = api.getToken() && user?.uid?.startsWith("sql_");
        if (hasSqlSession && apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('NetworkError')) {
          throw apiErr;
        }
        
        // 2. Fallback to Firebase/Mock Database Engine
        console.warn("Express backend server offline or user is on Firebase session. Falling back to Firebase/Mock Database.");
        const data = {
          name: perfName,
          email: perfEmail,
          phone: perfPhone,
          rollNo: perfRollNo,
          school: perfSchool,
          dept: perfDept,
          bhavan: perfBhavan,
          year: perfYear,
          category: perfCategory,
          specificEvent: finalSpecificEvent,
          teamSize: parseInt(perfTeamSize),
          region: perfRegion,
          teamMembers: teamMembers.map(m => ({
            name: m.name,
            rollNo: m.rollNo,
            school: m.school,
            branch: m.branch,
            year: m.year,
            region: m.region
          })),
          timestamp: new Date().toISOString()
        };
        
        await db.registerParticipant(data);
        setRegSuccess(true);
        setPerfCategory('');
        setPerfSpecificEvent('');
        setOtherEventText('');
        setPerfTeamSize('1');
        setTeamMembers([]);
        resetSelection();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Performer registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const lowerEvent = perfSpecificEvent ? perfSpecificEvent.toLowerCase() : '';
  const isSoloEvent = lowerEvent.includes('solo');
  const isDuetEvent = lowerEvent.includes('duet');

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 'auto', overflowX: 'hidden' }}>
      
      {/* Dynamic Storm Shimmer Glows in the background */}
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', top: '10%', left: '-5%', width: '400px', height: '400px', opacity: 0.12 }}></div>
      <div className="glow-bg-radial" style={{ position: 'absolute', borderRadius: '50%', bottom: '15%', right: '-5%', width: '400px', height: '400px', opacity: 0.12 }}></div>

      <section className="animate-fade-in-up register-section" style={{ padding: '0px 8% 40px 8%', marginTop: '20px' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto', paddingTop: '0px', marginTop: '0px' }}>
          <div className="mockup-card" style={{ padding: '20px 25px 25px 25px', background: 'var(--bg-card)', minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            
            {/* SUCCESS STATE */}
            {regSuccess ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 0' }}>
                <div className="animate-pulse" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(75, 180, 75, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4bb44b', marginBottom: '20px', border: '2px solid #4bb44b' }}>
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '800' }}>
                  Registration Locked!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', marginBottom: '30px', lineHeight: '1.5' }}>
                  Congratulations, your performance has been successfully locked into the live stage registry! The Cultural Co-ordinators have queued your act for review.
                </p>

              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* 4-Week Validity Notice */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  background: 'rgba(200, 150, 12, 0.08)',
                  border: '1.5px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: '22px',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  <Clock size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Please Note:</strong> Your registration remains valid for 4 complete weeks. Kindly await the completion of this duration before applying for a new slot.
                  </span>
                </div>

                {/* WIZARD STEP 1: Parent Division Selection */}
                {wizardStep === 1 && (
                  <div className="animate-fade-in-up" style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Step 1 of 3
                    </span>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '6px', fontWeight: '900', color: 'var(--text-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                      Select Your School / College
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>
                      Choose your academic affiliation to load your dynamic branch list.
                    </p>

                    {/* Division Grid Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      
                      {/* 1. Engineering AUS */}
                      <div 
                        onClick={() => handleParentSelect('engineering')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><Layers size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>School of Engineering</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aditya University (School of Engineering) - UG / PG / Ph.D</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* School of Computing */}
                      <div 
                        onClick={() => handleParentSelect('computing')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><Layers size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>School of Computing</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aditya University (School of Computing) - UG / PG / Ph.D</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* 2. Business */}
                      <div 
                        onClick={() => handleParentSelect('business')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><BookOpen size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>School of Business</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>BBA / MBA programs in association with PWC, EY, Deloitte, KPMG</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* 3. Pharmacy */}
                      <div 
                        onClick={() => handleParentSelect('pharmacy')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><Globe size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>School of Pharmacy</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>B.Pharm / Pharm.D / M.Pharm Pharmacy college branches</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* 4. Sciences */}
                      <div 
                        onClick={() => handleParentSelect('sciences')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><FlaskConical size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>School of Sciences</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>B.Sc / M.Sc Forensic Sciences & Digital Forensics</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* 5. Engineering ACET */}
                      <div 
                        onClick={() => handleParentSelect('acet')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><Building size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>Aditya College of Eng & Tech (ACET)</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ACET campus branches and basic sciences departments</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                      {/* 6. Polytechnic */}
                      <div 
                        onClick={() => handleParentSelect('poly')}
                        className="division-row-card"
                        style={divisionRowStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={iconBoxStyle}><GraduationCap size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '1.02rem', fontWeight: '800', color: 'var(--text-primary)' }}>Polytechnic (Diploma)</h4>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Diploma Engineering and Communication Networking courses</p>
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--accent-gold)' }} />
                      </div>

                    </div>
                  </div>
                )}

                {/* WIZARD STEP 2: Level Selection */}
                {wizardStep === 2 && (
                  <div className="animate-fade-in-up" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <button 
                        onClick={resetSelection}
                        style={{
                          background: 'none', border: 'none', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', padding: '0'
                        }}
                      >
                        <ArrowLeft size={14} /> Back to Schools
                      </button>
                      
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Step 2 of 3
                      </span>
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '6px', fontWeight: '900', color: 'var(--text-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                        Select Program Level
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>
                        Choose the academic level to view relevant branches.
                      </p>

                      {/* Program Level Options Row */}
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {selectedParent && academicStructure[selectedParent]?.levels && 
                          Object.keys(academicStructure[selectedParent].levels).map(lvlKey => {
                            const levelObj = academicStructure[selectedParent].levels[lvlKey];
                            return (
                              <button 
                                key={lvlKey}
                                onClick={() => handleLevelSelect(lvlKey)}
                                style={subButtonStyle}
                                className="sub-selection-btn"
                              >
                                {lvlKey === 'ug' && <GraduationCap size={20} style={{ marginBottom: '6px', color: 'var(--accent-gold)' }} />}
                                {lvlKey === 'pg' && <BookOpen size={20} style={{ marginBottom: '6px', color: 'var(--accent-gold)' }} />}
                                {lvlKey === 'phd' && <Award size={20} style={{ marginBottom: '6px', color: 'var(--accent-gold)' }} />}
                                <span style={{ fontSize: '1.05rem', fontWeight: '900', fontFamily: 'var(--font-display)' }}>{levelObj.label}</span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                                  {lvlKey === 'ug' && "Bachelor programs"}
                                  {lvlKey === 'pg' && "Master & professional programs"}
                                  {lvlKey === 'phd' && "Doctoral research"}
                                </span>
                              </button>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* WIZARD STEP 3: Actual Performer Registration Form */}
                {wizardStep === 3 && (
                  <div className="animate-fade-in-up" style={{ textAlign: 'left' }}>
                    
                    {/* Back button & Selected School Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
                      <button 
                        onClick={handleWizardBack}
                        style={{
                          background: 'none', border: 'none', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: '0'
                        }}
                      >
                        <ArrowLeft size={14} /> {academicStructure[selectedParent]?.levels ? "Back to Levels" : "Back to Schools"}
                      </button>

                      {/* Premium dynamic selection badge */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200, 150, 12, 0.12)', border: '1px solid var(--accent-gold)', borderRadius: '15px', padding: '5px 12px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        <School size={12} /> {perfSchool}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '4px', fontWeight: '900', color: 'var(--accent-gold)', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
                      Stage Slot Application
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '18px' }}>
                      Provide your academic details and select the event category you want to perform in.
                    </p>

                    <form onSubmit={handleRegisterPerformer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {errorMsg && (
                        <div style={{ padding: '10px 14px', background: 'rgba(230, 50, 50, 0.08)', border: '1px solid #e63232', color: '#e63232', borderRadius: '12px', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.4' }}>
                          {errorMsg}
                        </div>
                      )}
                      
                      {/* Section 1: Personal Details */}
                      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>1. Personal Details</span>
                        {user ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '2px 8px', fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                            <Lock size={9} /> Signup Locked
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(200, 150, 12, 0.1)', borderRadius: '10px', padding: '2px 8px', fontSize: '0.62rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                            📝 Guest Entry
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Full Name {!user && "*"}</label>
                        <div style={{ position: 'relative' }}>
                          <User style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                          <input 
                            type="text" 
                            className="form-input" 
                            value={perfName}
                            onChange={!user ? (e) => setPerfName(e.target.value) : undefined}
                            placeholder={!user ? "e.g. John Doe" : undefined}
                            style={{ 
                              paddingLeft: '38px', 
                              backgroundColor: user ? 'rgba(255, 255, 255, 0.02)' : undefined, 
                              color: user ? 'var(--text-muted)' : undefined, 
                              cursor: user ? 'not-allowed' : undefined 
                            }}
                            readOnly={!!user}
                            disabled={!!user}
                            required={!user}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-responsive">
                        <div className="form-group">
                          <label className="form-label">Email ID {!user && "*"}</label>
                          <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <input 
                              type="email" 
                              className="form-input" 
                              value={perfEmail}
                              onChange={!user ? (e) => setPerfEmail(e.target.value) : undefined}
                              placeholder={!user ? "e.g. john@aditya.in" : undefined}
                              style={{ 
                                paddingLeft: '38px', 
                                backgroundColor: user ? 'rgba(255, 255, 255, 0.02)' : undefined, 
                                color: user ? 'var(--text-muted)' : undefined, 
                                cursor: user ? 'not-allowed' : undefined 
                              }}
                              readOnly={!!user}
                              disabled={!!user}
                              required={!user}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phone Number {!user && "*"}</label>
                          <div style={{ position: 'relative' }}>
                            <Phone style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <input 
                              type="tel" 
                              className="form-input" 
                              value={perfPhone}
                              onChange={!user ? (e) => setPerfPhone(e.target.value.replace(/\D/g, '').slice(0, 10)) : undefined}
                              placeholder={!user ? "e.g. 9876543210" : undefined}
                              style={{ 
                                paddingLeft: '38px', 
                                backgroundColor: user ? 'rgba(255, 255, 255, 0.02)' : undefined, 
                                color: user ? 'var(--text-muted)' : undefined, 
                                cursor: user ? 'not-allowed' : undefined 
                              }}
                              readOnly={!!user}
                              disabled={!!user}
                              required={!user}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Academic Details */}
                      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>2. Academic Details</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-responsive">
                        
                        {/* Student Roll Number input to be safe */}
                        <div className="form-group">
                          <label className="form-label">Student Roll Number *</label>
                          <div style={{ position: 'relative' }}>
                            <GraduationCap style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. 22A91A0501" 
                              value={perfRollNo}
                              onChange={(e) => setPerfRollNo(e.target.value.toUpperCase())}
                              style={{ paddingLeft: '38px' }}
                              required
                            />
                          </div>
                        </div>

                        {/* Branch Selection Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Select Branch *</label>
                          <div style={{ position: 'relative' }}>
                            <Layers style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <select 
                              className="form-input" 
                              value={perfDept}
                              onChange={(e) => {
                                const val = e.target.value;
                                setPerfDept(val);
                                const validYears = getYearsForProgram(selectedParent, selectedLevel, perfPhdType, val);
                                if (!validYears.includes(perfYear)) {
                                  setPerfYear(validYears[0]);
                                }
                              }}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              {getFilteredBranches(selectedParent, selectedLevel).map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Ph.D Program Details Option (Mobile & Desktop Responsive) */}
                      {selectedLevel === 'phd' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }} className="form-row-responsive">
                          <div className="form-group">
                            <label className="form-label">Ph.D Type *</label>
                            <div style={{ position: 'relative' }}>
                              <Layers style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                              <select 
                                className="form-input" 
                                value={perfPhdType}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPerfPhdType(val);
                                  setPerfYear(getYearsForProgram(selectedParent, selectedLevel, val, perfDept)[0]);
                                }}
                                style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                required
                              >
                                <option value="Full-Time">Full-Time (1 to 7 Years)</option>
                                <option value="Part-Time">Part-Time (1 to 9 Years)</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group" style={{ visibility: 'hidden' }} />
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-responsive">
                        
                        {/* Year of Study Selection Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Year of Study *</label>
                          <div style={{ position: 'relative' }}>
                            <BookOpen style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <select 
                              className="form-input" 
                              value={perfYear}
                              onChange={(e) => setPerfYear(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              {getYearsForProgram(selectedParent, selectedLevel, perfPhdType, perfDept).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Select Bhavan Selection Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Select Bhavan *</label>
                          <div style={{ position: 'relative' }}>
                            <Building style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <select 
                              className="form-input" 
                              value={perfBhavan}
                              onChange={(e) => setPerfBhavan(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              {bhavansList.map(bhavan => (
                                <option key={bhavan} value={bhavan}>{bhavan}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-responsive">
                        {/* Region Selection Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Region *</label>
                          <div style={{ position: 'relative' }}>
                            <Globe style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <select 
                              className="form-input" 
                              value={perfRegion}
                              onChange={(e) => setPerfRegion(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              <option value="AP">Andhra Pradesh (AP)</option>
                              <option value="Other that AP">Other that AP</option>
                              <option value="International">International</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Event Details */}
                      <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>3. Event Specifications</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="form-row-responsive">
                        
                        {/* Event Category Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Select Event Category *</label>
                          <select 
                            className="form-input" 
                            value={perfCategory}
                            onChange={(e) => {
                              setPerfCategory(e.target.value);
                              setPerfSpecificEvent(''); // Reset event on category change
                              setOtherEventText('');
                            }}
                            style={{ height: '52px', paddingBlock: '12px' }}
                            required
                          >
                            <option value="" disabled>-- Choose Event Category --</option>
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Team Size Selection Dropdown */}
                        <div className="form-group">
                          <label className="form-label">Select Team Size *</label>
                          <div style={{ position: 'relative' }}>
                            <Users style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <select 
                              className="form-input" 
                              value={perfTeamSize}
                              onChange={(e) => handleTeamSizeChange(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              <option value="1">Solo (1 Member)</option>
                              <option value="2" disabled={isSoloEvent}>Duet (2 Members)</option>
                              {[...Array(8)].map((_, i) => {
                                const val = String(i + 3);
                                return (
                                  <option key={val} value={val} disabled={isSoloEvent || isDuetEvent}>
                                    {val} Members
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Select Specific Event (Conditional view) */}
                      <div className="form-group">
                        <label className="form-label">Select Specific Event *</label>
                        <div style={{ position: 'relative' }}>
                          <Music style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                          
                          {perfCategory ? (
                            <select 
                              className="form-input animate-fade-in-up" 
                              value={perfSpecificEvent}
                              onChange={(e) => handleSpecificEventChange(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            >
                              <option value="" disabled>-- Choose Specific Showcase --</option>
                              {eventsByCategory[perfCategory]?.map(event => (
                                <option key={event} value={event}>{event}</option>
                              ))}
                            </select>
                          ) : (
                            <div 
                              className="form-input" 
                              style={{ 
                                paddingLeft: '38px', 
                                height: '52px', 
                                paddingBlock: '15px', 
                                backgroundColor: 'rgba(230, 50, 50, 0.05)', 
                                border: '1.5px dashed rgba(230, 50, 50, 0.3)',
                                color: '#e63232', 
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'not-allowed'
                              }}
                            >
                              Please select category first
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Custom Event Name (Shown when Others is selected) */}
                      {perfCategory && perfSpecificEvent === 'Others' && (
                        <div className="form-group animate-fade-in-up">
                          <label className="form-label">Specify Custom Event Name *</label>
                          <div style={{ position: 'relative' }}>
                            <Award style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="e.g. Beatboxing, Karate Demonstration, Magic Show..." 
                              value={otherEventText}
                              onChange={(e) => setOtherEventText(e.target.value)}
                              style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Dynamic Additional Performers Details */}
                      {teamMembers.length > 0 && (
                        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>4. Additional Team Member Details</span>
                          </div>
                          
                          {teamMembers.map((member, index) => {
                            const memberNum = index + 2;
                            return (
                              <div key={index} style={memberCardStyle} className="member-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '15px' }}>
                                  <Users size={15} style={{ color: 'var(--accent-gold)' }} />
                                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>Member #{memberNum} Details</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="form-row-responsive">
                                  {/* Member Name */}
                                  <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <div style={{ position: 'relative' }}>
                                      <User style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                      <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. Jane Doe"
                                        value={member.name}
                                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                        style={{ paddingLeft: '38px' }}
                                        required
                                      />
                                    </div>
                                  </div>

                                  {/* Member Roll Number */}
                                  <div className="form-group">
                                    <label className="form-label">Roll Number *</label>
                                    <div style={{ position: 'relative' }}>
                                      <GraduationCap style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                      <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="e.g. 22A91A0502"
                                        value={member.rollNo}
                                        onChange={(e) => handleMemberChange(index, 'rollNo', e.target.value.toUpperCase())}
                                        style={{ paddingLeft: '38px' }}
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }} className="form-row-responsive">
                                  {/* School Dropdown */}
                                  <div className="form-group">
                                    <label className="form-label">Select School *</label>
                                    <div style={{ position: 'relative' }}>
                                      <School style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                      <select
                                        className="form-input"
                                        value={member.schoolKey}
                                        onChange={(e) => handleMemberSchoolChange(index, e.target.value)}
                                        style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                        required
                                      >
                                        <option value="" disabled>-- Choose School --</option>
                                        {Object.keys(academicStructure).map(key => (
                                          <option key={key} value={key}>{academicStructure[key].label}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Program Level (Shown only if the school has levels) */}
                                  {member.schoolKey && academicStructure[member.schoolKey]?.levels ? (
                                    <div className="form-group">
                                      <label className="form-label">Program Level *</label>
                                      <div style={{ position: 'relative' }}>
                                        <Layers style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                        <select
                                          className="form-input"
                                          value={member.levelKey}
                                          onChange={(e) => handleMemberLevelChange(index, e.target.value)}
                                          style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                          required
                                        >
                                          <option value="" disabled>-- Choose Level --</option>
                                          {Object.keys(academicStructure[member.schoolKey].levels).map(lvlKey => (
                                            <option key={lvlKey} value={lvlKey}>{academicStructure[member.schoolKey].levels[lvlKey].label}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Year of Study if no level is needed */
                                    <div className="form-group">
                                      <label className="form-label">Year of Study *</label>
                                      <div style={{ position: 'relative' }}>
                                        <BookOpen style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                        <select
                                          className="form-input"
                                          value={member.year}
                                          onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                                          style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                          required
                                        >
                                          {getYearsForProgram(member.schoolKey, '', 'Full-Time', member.branch).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Ph.D Program Details Option for team members */}
                                {member.schoolKey && member.levelKey === 'phd' && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }} className="form-row-responsive">
                                    <div className="form-group">
                                      <label className="form-label">Ph.D Type *</label>
                                      <div style={{ position: 'relative' }}>
                                        <Layers style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                        <select
                                          className="form-input"
                                          value={member.phdType || 'Full-Time'}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            handleMemberChange(index, 'phdType', val);
                                            handleMemberChange(index, 'year', getYearsForProgram(member.schoolKey, member.levelKey, val, member.branch)[0]);
                                          }}
                                          style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                          required
                                        >
                                          <option value="Full-Time">Full-Time (1 to 7 Years)</option>
                                          <option value="Part-Time">Part-Time (1 to 9 Years)</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="form-group" style={{ visibility: 'hidden' }} />
                                  </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }} className="form-row-responsive">
                                  {/* Branch Selection */}
                                  <div className="form-group">
                                    <label className="form-label">Select Branch *</label>
                                    <div style={{ position: 'relative' }}>
                                      <Layers style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                      <select
                                        className="form-input"
                                        value={member.branch}
                                        onChange={(e) => handleMemberChange(index, 'branch', e.target.value)}
                                        style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                        disabled={!member.schoolKey || (academicStructure[member.schoolKey]?.levels && !member.levelKey)}
                                        required
                                      >
                                        <option value="" disabled>-- Choose Branch --</option>
                                        {getFilteredBranches(member.schoolKey, member.levelKey).map(br => (
                                          <option key={br} value={br}>{br}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Year of Study if level was shown above */}
                                  {member.schoolKey && academicStructure[member.schoolKey]?.levels && (
                                    <div className="form-group">
                                      <label className="form-label">Year of Study *</label>
                                      <div style={{ position: 'relative' }}>
                                        <BookOpen style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                        <select
                                          className="form-input"
                                          value={member.year}
                                          onChange={(e) => handleMemberChange(index, 'year', e.target.value)}
                                          style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                          required
                                        >
                                          {getYearsForProgram(member.schoolKey, member.levelKey, member.phdType || 'Full-Time', member.branch).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }} className="form-row-responsive">
                                  {/* Region Selection */}
                                  <div className="form-group">
                                    <label className="form-label">Region *</label>
                                    <div style={{ position: 'relative' }}>
                                      <Globe style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} size={16} />
                                      <select
                                        className="form-input"
                                        value={member.region || 'AP'}
                                        onChange={(e) => handleMemberChange(index, 'region', e.target.value)}
                                        style={{ paddingLeft: '38px', height: '52px', paddingBlock: '12px' }}
                                        required
                                      >
                                        <option value="AP">Andhra Pradesh (AP)</option>
                                        <option value="Other that AP">Other that AP</option>
                                        <option value="International">International</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}



                      <div className="form-group">
                        <label className="form-label">Special Requirements or Stage Notes</label>
                        <textarea 
                          className="form-input" 
                          placeholder="Stage props, backdrop soundtracks links, background graphics, microphone counts... (Optional)" 
                          value={perfDescription}
                          onChange={(e) => setPerfDescription(e.target.value)}
                          style={{ minHeight: '80px', paddingBlock: '12px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(200, 150, 12, 0.05)', border: '1px dashed var(--glass-border)', borderRadius: 'var(--border-radius-sm)', marginBottom: '15px', textAlign: 'left' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          <strong>Note:</strong> Please make sure all the data you have provided is true. Any incorrect registrations will lead to rejection.
                        </span>
                      </div>

                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ 
                          width: '100%', 
                          justifyContent: 'center', 
                          padding: '10px 0', 
                          fontSize: '0.88rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          marginTop: '10px'
                        }} 
                        disabled={loading}
                      >
                        {loading ? 'Submitting Registry...' : 'Lock Stage Booking'}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </section>

      <style>{`
        /* Step 1 Division Grid card buttons */
        .division-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1.5px solid var(--glass-border);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .division-row-card:hover {
          border-color: var(--accent-gold);
          background: rgba(200, 150, 12, 0.05);
          box-shadow: 0 4px 15px rgba(200, 150, 12, 0.1);
          transform: translateX(4px);
        }

        /* Step 2 sub selection card buttons */
        .sub-selection-btn {
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1.8px solid var(--glass-border);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: var(--transition-smooth);
          color: var(--text-primary);
          text-align: center;
        }
        .sub-selection-btn:hover {
          border-color: var(--accent-gold);
          background: rgba(200, 150, 12, 0.06);
          box-shadow: var(--glow-shadow);
          transform: translateY(-4px);
        }
        .sub-selection-btn:active {
          transform: translateY(0);
        }

        /* Form styling compact overrides */
        .form-group {
          margin-bottom: 12px !important;
        }
        .form-label {
          font-size: 0.78rem !important;
          margin-bottom: 4px !important;
        }
        .form-input {
          padding: 8px 12px !important;
          font-size: 0.85rem !important;
          height: 38px !important;
        }
        textarea.form-input {
          height: auto !important;
          min-height: 70px !important;
        }
        div.form-input {
          display: flex !important;
          align-items: center !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
        .form-group svg + .form-input,
        .form-group svg + select.form-input {
          padding-left: 32px !important;
        }
        .form-group svg {
          left: 10px !important;
          top: 12px !important;
          width: 14px !important;
          height: 14px !important;
        }

        @media (max-width: 992px) {
          .register-split-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          .mockup-card {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (max-width: 600px) {
          .form-row-responsive {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
        }
      `}</style>

    </div>
  );
};

// Internal visuals
const divisionRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1.5px solid var(--glass-border)',
  borderRadius: 'var(--border-radius-md)',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)'
};

const iconBoxStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: 'rgba(200, 150, 12, 0.12)',
  border: '1px solid rgba(200, 150, 12, 0.3)',
  color: 'var(--accent-gold)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const subButtonStyle = {
  flex: 1,
  minWidth: '160px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px 16px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1.8px solid var(--glass-border)',
  borderRadius: 'var(--border-radius-lg)',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  color: 'var(--text-primary)',
  textAlign: 'center'
};

const memberCardStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--border-radius-md)',
  padding: '12px',
  marginTop: '10px',
  marginBottom: '10px',
  boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.01)'
};

export default Register;
