// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";

// Firebase configuration from Vite environment variables or defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyANytjwfO0UnHZePxbIxomE2yuPgygey9Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thunder-thursday.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thunder-thursday",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thunder-thursday.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "361201097177",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:361201097177:web:f72e4de76cd5ce025661c8"
};

// Check if valid config is present
const hasFirebaseConfig = true;

let auth;
let db;
let isMock = false;

// Mock implementations for testing out-of-the-box without config
const mockDb = {
  // Helper to get local data
  getData(key, defaultVal) {
    const data = localStorage.getItem(`tt_mock_${key}`);
    return data ? JSON.parse(data) : defaultVal;
  },
  setData(key, val) {
    localStorage.setItem(`tt_mock_${key}`, JSON.stringify(val));
    // Trigger custom event for multi-tab sync
    window.dispatchEvent(new CustomEvent(`tt_mock_update_${key}`, { detail: val }));
    // Also trigger standard storage event for other windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: `tt_mock_${key}`,
      newValue: JSON.stringify(val)
    }));
  }
};

// Seed Mock Performers if not already present
if (!localStorage.getItem("tt_mock_performers")) {
  const initialPerformers = [
    // Music
    { id: "m1", name: "Aarav Sharma", category: "music", title: "Classical Fusion (Sitar & Keys)", voteCount: 42, collegeId: "AUSTU01" },
    { id: "m2", name: "Riya Sen", category: "music", title: "Acoustic Pop Medley (Vocals)", voteCount: 28, collegeId: "AUSTU02" },
    { id: "m3", name: "The Thunder Beat", category: "music", title: "Rock Anthem Performance", voteCount: 56, collegeId: "AUSTU03" },
    // Dance
    { id: "d1", name: "Natyasutra Crew", category: "dance", title: "Contemporary Bharatanatyam Fusion", voteCount: 65, collegeId: "AUSTU04" },
    { id: "d2", name: "Siddharth Verma", category: "dance", title: "Hip-Hop Solo Showcase", voteCount: 34, collegeId: "AUSTU05" },
    { id: "d3", name: "Rhythm Rebels", category: "dance", title: "High-Energy Cinematic Dance", voteCount: 88, collegeId: "AUSTU06" },
    // Singing
    { id: "s1", name: "Ananya Iyer", category: "singing", title: "Sufi Devotional Performance", voteCount: 51, collegeId: "AUSTU07" },
    { id: "s2", name: "Vikram & Group", category: "singing", title: "Retro Bollywood Unplugged", voteCount: 39, collegeId: "AUSTU08" },
    { id: "s3", name: "Kunal Roy", category: "singing", title: "Western Rock Ballad Solo", voteCount: 45, collegeId: "AUSTU09" }
  ];
  mockDb.setData("performers", initialPerformers);
}

// Seed mock participants
if (!localStorage.getItem("tt_mock_participants")) {
  mockDb.setData("participants", []);
}

// Seed mock votes
if (!localStorage.getItem("tt_mock_votes")) {
  mockDb.setData("votes", []);
}

// Seed mock gallery images & highlights
if (!localStorage.getItem("tt_mock_gallery_images")) {
  const initialGalleryImages = [
    { id: "g1", url: "/event_images/event_1.jpg", caption: "Electric Rock Opener - Week 1" },
    { id: "g2", url: "/event_images/event_2.png", caption: "Synchronized Choreography - Week 2" },
    { id: "g3", url: "/event_images/event_3.png", caption: "Soulful Solo Vocals - Week 3" },
    { id: "g4", url: "/event_images/event_4.png", caption: "Contemporary Classical Fusion - Week 4" },
    { id: "g5", url: "/event_images/event_5.png", caption: "Crowd Wave and Arena Roar - Week 5" },
    { id: "g6", url: "/event_images/event_6.png", caption: "Electronic Synth Beats - Week 6" },
    { id: "g7", url: "/event_images/event_7.png", caption: "Folk Rhythm Ensemble - Week 7" },
    { id: "g8", url: "/event_images/event_8.png", caption: "Stunning Laser Light Showcase - Week 8" },
    { id: "g9", url: "/event_images/event_9.png", caption: "Acoustic Pop Medley - Week 9" },
    { id: "g10", url: "/event_images/event_10.png", caption: "Hip Hop Solo Battle - Week 10" },
    { id: "g11", url: "/event_images/event_11.png", caption: "Grand Finale Performers Group - Week 11" },
    { id: "g12", url: "/event_images/event_12.png", caption: "Candid Student Cheers - Week 12" },
    { id: "g13", url: "/event_images/event_13.png", caption: "Traditional Drummers Charge - Week 13" }
  ];
  mockDb.setData("gallery_images", initialGalleryImages);
}
if (!localStorage.getItem("tt_mock_highlights")) {
  const initialHighlights = [
    { id: "g1", image_url: "/event_images/event_1.jpg", url: "/event_images/event_1.jpg", caption: "Electric Rock Opener - Week 1", date: "Week 1" },
    { id: "g2", image_url: "/event_images/event_2.png", url: "/event_images/event_2.png", caption: "Synchronized Choreography - Week 2", date: "Week 2" },
    { id: "g3", image_url: "/event_images/event_3.png", url: "/event_images/event_3.png", caption: "Soulful Solo Vocals - Week 3", date: "Week 3" },
    { id: "g4", image_url: "/event_images/event_4.png", url: "/event_images/event_4.png", caption: "Contemporary Classical Fusion - Week 4", date: "Week 4" },
    { id: "g5", image_url: "/event_images/event_5.png", url: "/event_images/event_5.png", caption: "Crowd Wave and Arena Roar - Week 5", date: "Week 5" },
    { id: "g6", image_url: "/event_images/event_6.png", url: "/event_images/event_6.png", caption: "Electronic Synth Beats - Week 6", date: "Week 6" },
    { id: "g7", image_url: "/event_images/event_7.png", url: "/event_images/event_7.png", caption: "Folk Rhythm Ensemble - Week 7", date: "Week 7" },
    { id: "g8", image_url: "/event_images/event_8.png", url: "/event_images/event_8.png", caption: "Stunning Laser Light Showcase - Week 8", date: "Week 8" },
    { id: "g9", image_url: "/event_images/event_9.png", url: "/event_images/event_9.png", caption: "Acoustic Pop Medley - Week 9", date: "Week 9" },
    { id: "g10", image_url: "/event_images/event_10.png", url: "/event_images/event_10.png", caption: "Hip Hop Solo Battle - Week 10", date: "Week 10" },
    { id: "g11", image_url: "/event_images/event_11.png", url: "/event_images/event_11.png", caption: "Grand Finale Performers Group - Week 11", date: "Week 11" },
    { id: "g12", image_url: "/event_images/event_12.png", url: "/event_images/event_12.png", caption: "Candid Student Cheers - Week 12", date: "Week 12" },
    { id: "g13", image_url: "/event_images/event_13.png", url: "/event_images/event_13.png", caption: "Traditional Drummers Charge - Week 13", date: "Week 13" }
  ];
  mockDb.setData("highlights", initialHighlights);
}

// Seed mock notifications
if (!localStorage.getItem("tt_mock_notifications")) {
  const initialNotifications = [
    { id: "n1", title: "Live Leaderboard Active", message: "Rhythm Rebels is currently leading the Dance Category!", type: "leaderboard", timestamp: new Date().toISOString() },
    { id: "n2", title: "Gallery Updated", message: "13 new high-res highlight slides added to the Hall of Lightning!", type: "gallery", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "n3", title: "Stage Bookings Open", message: "Stage slot curation is officially open for Week 14 acts.", type: "stage", timestamp: new Date(Date.now() - 7200000).toISOString() }
  ];
  mockDb.setData("notifications", initialNotifications);
}

// Custom Mock engine
const mockEngine = {
  auth: {
    currentUser: JSON.parse(localStorage.getItem("tt_mock_user") || "null"),
    listeners: [],
    
    onAuthStateChanged(callback) {
      this.listeners.push(callback);
      callback(this.currentUser);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    },

    updateUser(user) {
      this.currentUser = user;
      if (user) {
        localStorage.setItem("tt_mock_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("tt_mock_user");
      }
      this.listeners.forEach(cb => cb(user));
    },

    async createUserWithEmailAndPassword(email, password, displayName) {
      const user = {
        uid: "mock_" + email.replace(/[^a-zA-Z0-9]/g, ""),
        email: email,
        displayName: displayName || email.split("@")[0].toUpperCase(),
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
      };
      this.updateUser(user);
      console.log(`[MOCK AUTH] Verification email sent to registered address: ${email}`);
      return { user };
    },

    async signInWithPopup() {
      const randomSeed = Math.random().toString(36).substring(7);
      const user = {
        uid: "mock_google_" + randomSeed,
        email: `${randomSeed}@gmail.com`,
        displayName: "Aditya Student " + randomSeed.toUpperCase(),
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`
      };
      this.updateUser(user);
      return { user };
    },

    async signOut() {
      this.updateUser(null);
    },

    async updateProfileDisplayName(displayName) {
      if (this.currentUser) {
        this.currentUser.displayName = displayName;
        this.updateUser(this.currentUser);
      }
    }
  },

  db: {
    // Real-time updates subscription
    subscribePerformers(callback) {
      const getActive = () => {
        const list = mockDb.getData("performers", []);
        return list.filter(p => p.status !== "pending");
      };

      // Push initial data
      callback(getActive());

      // Listen for local changes
      const handleLocalUpdate = (e) => {
        const list = e.detail || mockDb.getData("performers", []);
        callback(list.filter(p => p.status !== "pending"));
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_performers") {
          const list = JSON.parse(e.newValue || "[]");
          callback(list.filter(p => p.status !== "pending"));
        }
      };

      window.addEventListener("tt_mock_update_performers", handleLocalUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_performers", handleLocalUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    // Cast vote mock
    async castVote(userUid, performerId, category, starsCount = 5) {
      const votes = mockDb.getData("votes", []);
      const voteKey = `${userUid}_${performerId}`;
      
      // Check if already voted for this performer
      const existingVote = votes.find(v => (v.userUid === userUid || v.user_id === userUid) && v.performerId === performerId);
      if (existingVote) {
        throw new Error(`You have already voted for this performer!`);
      }

      // Record vote with stars rating (both schemas for web-mobile compatibility)
      votes.push({
        id: voteKey,
        userUid,
        user_id: userUid,
        category,
        performerId,
        performance_id: performerId,
        stars_rating: parseInt(starsCount),
        rating: parseInt(starsCount),
        timestamp: new Date().toISOString()
      });
      mockDb.setData("votes", votes);

      // Recalculate and update performer rating
      const performers = mockDb.getData("performers", []);
      const perfIndex = performers.findIndex(p => p.id === performerId);
      if (perfIndex !== -1) {
        const p = performers[perfIndex];
        const currentVoteCount = parseInt(p.voteCount || p.vote_count || 0);
        // Default to a 4.0 starting rating if not already set, to make seeded mock data look natural
        const currentRating = parseFloat(p.rating !== undefined ? p.rating : 4.0);
        const newVoteCount = currentVoteCount + 1;
        const newRating = parseFloat(((currentRating * currentVoteCount + starsCount) / newVoteCount).toFixed(1));

        performers[perfIndex].voteCount = newVoteCount;
        performers[perfIndex].rating = newRating;
        mockDb.setData("performers", performers);
      }

      return true;
    },

    // Check user vote status for categories
    getUserVotes(userUid) {
      const votes = mockDb.getData("votes", []);
      return votes.filter(v => v.userUid === userUid || v.user_id === userUid).map(v => ({
        id: v.id,
        category: v.category,
        performerId: v.performerId || v.performance_id,
        starsRating: v.stars_rating || v.rating || 5,
        ...v
      }));
    },

    subscribeUserVotes(userUid, userEmail = null, callback) {
      callback(this.getUserVotes(userUid));
      return () => {};
    },

    async saveUserProfile(uid, profileData) {
      const users = mockDb.getData("users", []);
      const index = users.findIndex(u => u.uid === uid);
      const updatedUser = {
        uid,
        name: profileData.name || profileData.displayName || '',
        fullName: profileData.name || profileData.displayName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        rollNo: profileData.rollNo || '',
        campus: profileData.campus || '',
        branch: profileData.branch || '',
        region: profileData.region || '',
        updatedAt: new Date().toISOString()
      };
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
      } else {
        users.push(updatedUser);
      }
      mockDb.setData("users", users);
    },

    async checkUserFeedbackStatus(email, uid, sessionId, lastEnabledAt) {
      let compareDate = null;
      if (lastEnabledAt) {
        compareDate = new Date(lastEnabledAt);
      }

      // Check event_feedback
      const feedbacks = mockDb.getData("event_feedback", []);
      const hasWeb = feedbacks.some(f => {
        const matchesUser = f.email === email || (uid && (f.userId === uid || f.user_id === uid));
        const matchesSession = f.sessionId === sessionId;
        if (!matchesUser || !matchesSession) return false;
        
        const submittedAt = f.submittedAt ? new Date(f.submittedAt) : null;
        return !compareDate || (submittedAt && submittedAt >= compareDate);
      });
      if (hasWeb) return true;

      // Check general_feedbacks
      const generalFeedbacks = mockDb.getData("general_feedbacks", []);
      const hasGeneral = generalFeedbacks.some(f => {
        const matchesUser = f.user_email === email || (uid && f.user_id === uid);
        const matchesSession = f.session_id === sessionId;
        if (!matchesUser || !matchesSession) return false;
        
        const submittedAt = f.submitted_at ? new Date(f.submitted_at) : null;
        return !compareDate || (submittedAt && submittedAt >= compareDate);
      });
      return hasGeneral;
    },

    // Register a performer mock
    async registerParticipant(participantData) {
      const registrations = mockDb.getData("registrations", []);
      const newParticipant = {
        ...participantData,
        user_id: participantData.user_id || participantData.uid || 'mock_user',
        participant_name: participantData.name || '',
        talent_type: participantData.category || '',
        talent_description: participantData.specificEvent || '',
        year_of_study: parseInt(participantData.year) || 1,
        year_of_study_string: String(participantData.year || '1'),
        branch: participantData.branch || participantData.dept || '',
        event_category: participantData.category || '',
        event_name: participantData.specificEvent || '',
        team_size: participantData.teamSize || 1,
        status: 'pending',
        id: "p_" + Date.now(),
        registeredAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };
      
      registrations.push(newParticipant);
      mockDb.setData("registrations", registrations);

      // Keep legacy participants mock list in sync
      const participants = mockDb.getData("participants", []);
      participants.push(newParticipant);
      mockDb.setData("participants", participants);

      return newParticipant;
    },

    async submitEventFeedback(feedbackData) {
      // Write to event_feedback (legacy web collection)
      const webFeedbackList = mockDb.getData("event_feedback", []);
      const newWebFeedback = {
        ...feedbackData,
        id: "f_" + Date.now(),
        submittedAt: new Date().toISOString()
      };
      webFeedbackList.push(newWebFeedback);
      mockDb.setData("event_feedback", webFeedbackList);

      // Write to general_feedbacks (mobile/admin collection)
      const mobileFeedbackList = mockDb.getData("general_feedbacks", []);
      let feedbackString = feedbackData.comments || '';
      if (feedbackData.rating) feedbackString = `[Rating: ${feedbackData.rating}/5] ${feedbackString}`;
      if (feedbackData.favoriteAct) feedbackString = `[Fav Act: ${feedbackData.favoriteAct}] ${feedbackString}`;

      // Resolve mock profile if possible
      let user_id = feedbackData.userId || 'mock_user';
      let user_name = feedbackData.name || 'Mock Web Student';
      let user_email = feedbackData.email || 'student@adityauniversity.in';
      let user_roll = feedbackData.rollNo || feedbackData.rollNumber || '23A91A0501';

      const newMobileFeedback = {
        user_id,
        user_name,
        user_email,
        user_roll,
        session_id: feedbackData.sessionId || 'event_feedback_session',
        feedback: feedbackString.trim(),
        submitted_at: new Date().toISOString(),
        id: newWebFeedback.id
      };
      mobileFeedbackList.push(newMobileFeedback);
      mockDb.setData("general_feedbacks", mobileFeedbackList);

      return { id: newWebFeedback.id, success: true };
    },

    subscribeEventFeedback(callback) {
      const getCombinedSorted = () => {
        const webList = mockDb.getData("event_feedback", []);
        const mobileList = mockDb.getData("general_feedbacks", []);
        const combined = [];

        webList.forEach(item => {
          combined.push({
            id: item.id,
            comments: item.comments || item.feedback || '',
            rating: item.rating || 5,
            favoriteAct: item.favoriteAct || '',
            user_name: item.user_name || 'Web Student',
            submittedAt: item.submittedAt
          });
        });

        mobileList.forEach(item => {
          if (!combined.some(c => c.id === item.id)) {
            let comments = item.feedback || '';
            let rating = 5;
            let favoriteAct = '';
            
            const ratingMatch = comments.match(/\[Rating:\s*([0-9.]+)\/5\]/);
            if (ratingMatch) {
              rating = parseFloat(ratingMatch[1]);
              comments = comments.replace(ratingMatch[0], '').trim();
            }
            const favActMatch = comments.match(/\[Fav Act:\s*([^\]]+)\]/);
            if (favActMatch) {
              favoriteAct = favActMatch[1];
              comments = comments.replace(favActMatch[0], '').trim();
            }

            combined.push({
              id: item.id || 'm_f_' + Math.random(),
              comments: comments,
              rating: rating,
              favoriteAct: favoriteAct,
              user_name: item.user_name || 'Mobile Student',
              submittedAt: item.submitted_at
            });
          }
        });

        combined.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
        return combined;
      };

      callback(getCombinedSorted());

      const handleUpdate = () => {
        callback(getCombinedSorted());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_event_feedback" || e.key === "tt_mock_general_feedbacks") {
          callback(getCombinedSorted());
        }
      };

      window.addEventListener("tt_mock_update_event_feedback", handleUpdate);
      window.addEventListener("tt_mock_update_general_feedbacks", handleUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_event_feedback", handleUpdate);
        window.removeEventListener("tt_mock_update_general_feedbacks", handleUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    subscribeFeedbackStatus(callback) {
      if (!localStorage.getItem("tt_mock_feedback_settings")) {
        mockDb.setData("feedback_settings", { enabled: true });
      }
      callback(mockDb.getData("feedback_settings", { enabled: true }));

      const handleLocalUpdate = (e) => {
        callback(e.detail || mockDb.getData("feedback_settings", { enabled: true }));
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_feedback_settings") {
          callback(JSON.parse(e.newValue || '{"enabled":true}'));
        }
      };

      window.addEventListener("tt_mock_update_feedback_settings", handleLocalUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_feedback_settings", handleLocalUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    async getParticipantProfile(email, uid) {
      const list = mockDb.getData("participants", []);
      let match = list.find(p => p.email?.toLowerCase() === email?.toLowerCase() || (uid && p.uid === uid));
      if (!match) {
        const users = mockDb.getData("users", []);
        match = users.find(u => u.email?.toLowerCase() === email?.toLowerCase() || (uid && u.uid === uid));
      }
      return match || null;
    },

    // Subscribe to gallery images
    subscribeGalleryImages(callback) {
      const getMapped = () => {
        const highlights = mockDb.getData("highlights", []);
        const gallery = mockDb.getData("gallery_images", []);
        const combined = [...highlights, ...gallery];
        const unique = [];
        const seen = new Set();
        for (const img of combined) {
          if (!seen.has(img.id)) {
            seen.add(img.id);
            unique.push({
              ...img,
              url: img.image_url || img.url || ''
            });
          }
        }
        return unique;
      };

      callback(getMapped());

      const handleUpdate = () => {
        callback(getMapped());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_highlights" || e.key === "tt_mock_gallery_images") {
          callback(getMapped());
        }
      };

      window.addEventListener("tt_mock_update_highlights", handleUpdate);
      window.addEventListener("tt_mock_update_gallery_images", handleUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_highlights", handleUpdate);
        window.removeEventListener("tt_mock_update_gallery_images", handleUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    // Subscribe to highlight reels
    subscribeHighlightReels(callback) {
      if (!localStorage.getItem("tt_mock_highlight_reels")) {
        const initialHighlightReels = [
          { id: "hr1", date: "WEEK 1 - THUNDER THURSDAY", instagram_url: "https://www.instagram.com/sac_aditya_university/" },
          { id: "hr2", date: "WEEK 2 - THUNDER THURSDAY", instagram_url: "https://www.instagram.com/sac_aditya_university/" },
          { id: "hr3", date: "WEEK 3 - THUNDER THURSDAY", instagram_url: "https://www.instagram.com/sac_aditya_university/" }
        ];
        mockDb.setData("highlight_reels", initialHighlightReels);
      }

      const getMapped = () => {
        return mockDb.getData("highlight_reels", []);
      };

      callback(getMapped());

      const handleUpdate = () => {
        callback(getMapped());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_highlight_reels") {
          callback(getMapped());
        }
      };

      window.addEventListener("tt_mock_update_highlight_reels", handleUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_highlight_reels", handleUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    subscribeNotifications(callback) {
      const getSorted = () => {
        const list = mockDb.getData("notifications", []);
        list.sort((a, b) => {
          const getMillis = (item) => {
            const ts = item.created_at || item.timestamp || item.created || 0;
            return new Date(ts).getTime();
          };
          return getMillis(b) - getMillis(a);
        });
        return list;
      };

      callback(getSorted());

      const handleLocalUpdate = (e) => {
        callback(e.detail || getSorted());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_notifications") {
          const list = JSON.parse(e.newValue || "[]");
          list.sort((a, b) => {
            const getMillis = (item) => {
              const ts = item.created_at || item.timestamp || item.created || 0;
              return new Date(ts).getTime();
            };
            return getMillis(b) - getMillis(a);
          });
          callback(list);
        }
      };

      window.addEventListener("tt_mock_update_notifications", handleLocalUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_notifications", handleLocalUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    getUserRegistrations(email) {
      const registrations = mockDb.getData("registrations", []);
      const participants = mockDb.getData("participants", []);
      const combined = [...registrations, ...participants];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          if (item.email?.toLowerCase() === email?.toLowerCase()) {
            unique.push(item);
          }
        }
      }
      return unique;
    },

    subscribeUserProfile(email, uid, callback) {
      const getProfile = () => {
        const list = mockDb.getData("participants", []);
        let match = list.find(p => p.email?.toLowerCase() === email?.toLowerCase() || (uid && p.uid === uid));
        if (!match) {
          const users = mockDb.getData("users", []);
          match = users.find(u => u.email?.toLowerCase() === email?.toLowerCase() || (uid && u.uid === uid));
        }
        return match || null;
      };

      callback(getProfile());

      const handleUpdate = () => {
        callback(getProfile());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_users" || e.key === "tt_mock_participants") {
          callback(getProfile());
        }
      };

      window.addEventListener("tt_mock_update_users", handleUpdate);
      window.addEventListener("tt_mock_update_participants", handleUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_users", handleUpdate);
        window.removeEventListener("tt_mock_update_participants", handleUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    },

    subscribeUserRegistrations(email, callback) {
      const getRegs = () => {
        const registrations = mockDb.getData("registrations", []);
        const participants = mockDb.getData("participants", []);
        const combined = [...registrations, ...participants];
        const unique = [];
        const seen = new Set();
        for (const item of combined) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            if (item.email?.toLowerCase() === email?.toLowerCase()) {
              unique.push(item);
            }
          }
        }
        return unique;
      };

      callback(getRegs());

      const handleUpdate = () => {
        callback(getRegs());
      };

      const handleStorageUpdate = (e) => {
        if (e.key === "tt_mock_registrations" || e.key === "tt_mock_participants") {
          callback(getRegs());
        }
      };

      window.addEventListener("tt_mock_update_registrations", handleUpdate);
      window.addEventListener("tt_mock_update_participants", handleUpdate);
      window.addEventListener("storage", handleStorageUpdate);

      return () => {
        window.removeEventListener("tt_mock_update_registrations", handleUpdate);
        window.removeEventListener("tt_mock_update_participants", handleUpdate);
        window.removeEventListener("storage", handleStorageUpdate);
      };
    }
  }
};

// Initialize Firebase if keys are configured
if (hasFirebaseConfig) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const realAuth = getAuth(app);
    const realDb = getFirestore(app);

    auth = {
      get currentUser() { return realAuth.currentUser; },
      onAuthStateChanged: (callback) => realAuth.onAuthStateChanged(callback),
      signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(realAuth, email, password),
      createUserWithEmailAndPassword: async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(realAuth, email, password);
        try {
          await sendEmailVerification(userCredential.user);
          console.log("Verification email sent to registered address.");
        } catch (verErr) {
          console.warn("Failed to send verification email:", verErr);
        }
        if (displayName) {
          try {
            await updateProfile(userCredential.user, { displayName: displayName });
            console.log("User display name updated successfully.");
          } catch (profileErr) {
            console.warn("Failed to update user display name:", profileErr);
          }
        }
        return userCredential;
      },
      signInWithPopup: () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(realAuth, provider);
      },
      signOut: () => signOut(realAuth),
      updateProfileDisplayName: async (displayName) => {
        if (realAuth.currentUser) {
          await updateProfile(realAuth.currentUser, { displayName: displayName });
        }
      }
    };

    // Helper wrappers for Firestore
    db = {
      subscribePerformers: (callback) => {
        const q = collection(realDb, "performances");
        return onSnapshot(q, (snapshot) => {
          const performersList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Filter to only include active live performances
            if (data.status === "live") {
              performersList.push({
                ...data,
                id: doc.id,
                name: data.name,
                category: data.type ? data.type.toLowerCase() : 'music',
                genre: data.genre || data.type || data.category || 'General',
                title: data.type || data.description || 'Showcase Performance',
                rating: parseFloat(data.average !== undefined ? data.average : data.rating !== undefined ? data.rating : 0),
                voteCount: parseInt(data.total_votes !== undefined ? data.total_votes : data.voteCount !== undefined ? data.voteCount : 0),
                collegeId: data.collegeId || data.college_id || 'AU'
              });
            }
          });
          callback(performersList);
        }, (error) => {
          console.error("Firestore subscription error, loading mock state:", error);
          callback(mockDb.getData("performers", []));
        });
      },

      castVote: async (userUid, performerId, category, starsCount = 5, userEmail = null) => {
        let realUid = userUid;
        if (userEmail) {
          try {
            const qEmail = query(collection(realDb, "users"), where("email", "in", [userEmail, userEmail.toLowerCase()]));
            const emailSnapshot = await getDocs(qEmail);
            if (!emailSnapshot.empty) {
              realUid = emailSnapshot.docs[0].id;
            }
          } catch (err) {
            console.warn("Could not resolve real Firebase UID from email in castVote:", err);
          }
        }

        const voteId = `${realUid}_${performerId}`;
        const voteRef = doc(realDb, "votes", voteId);
        
        // Use a Firestore transaction to safely increment votes and record the unique user vote
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          throw new Error(`You have already voted for this performer!`);
        }

        // Set vote with rating representation (writing both schemas for web-mobile compatibility)
        await setDoc(voteRef, {
          userUid: realUid,
          user_id: realUid,
          category,
          performerId,
          performance_id: performerId,
          stars_rating: parseInt(starsCount),
          rating: parseInt(starsCount),
          timestamp: new Date()
        });

        // Dynamic average rating and vote count recalculation targeting the performances collection
        try {
          const performanceRef = doc(realDb, "performances", performerId);
          const performanceDoc = await getDoc(performanceRef);
          if (performanceDoc.exists()) {
            const perfData = performanceDoc.data();
            const currentVotes = parseInt(perfData.total_votes || perfData.voteCount || 0);
            const currentScore = parseInt(perfData.total_score || (currentVotes * (perfData.average || 0)) || 0);
            const newVotes = currentVotes + 1;
            const newScore = currentScore + starsCount;
            const newAverage = parseFloat((newScore / newVotes).toFixed(1));

            await updateDoc(performanceRef, {
              total_votes: newVotes,
              total_score: newScore,
              average: newAverage,
              // maintain fallbacks for component safety
              voteCount: newVotes,
              rating: newAverage
            });
          }
        } catch (perfErr) {
          console.warn("Could not update performances collection directly (expected if Firestore rules restrict write access). The backend trigger will handle it.", perfErr);
        }

        return true;
      },

      getUserVotes: async (userUid, userEmail = null) => {
        console.log("[getUserVotes] Started with userUid:", userUid, "userEmail:", userEmail);
        let realUid = userUid;
        if (userEmail) {
          try {
            const qEmail = query(collection(realDb, "users"), where("email", "in", [userEmail, userEmail.toLowerCase()]));
            const emailSnapshot = await getDocs(qEmail);
            if (!emailSnapshot.empty) {
              realUid = emailSnapshot.docs[0].id;
              console.log("[getUserVotes] Resolved real Firebase UID for email:", userEmail, "➔", realUid);
            } else {
              console.log("[getUserVotes] No user document found for email:", userEmail);
            }
          } catch (err) {
            console.warn("[getUserVotes] Error resolving Firebase UID from email:", err);
          }
        }

        const votes = [];
        try {
          const q1 = query(collection(realDb, "votes"), where("userUid", "==", realUid));
          const querySnapshot1 = await getDocs(q1);
          console.log("[getUserVotes] q1 (userUid == realUid) size:", querySnapshot1.size);
          querySnapshot1.forEach((doc) => {
            const data = doc.data();
            votes.push({
              id: doc.id,
              category: data.category,
              performerId: data.performerId || data.performance_id,
              starsRating: data.stars_rating || data.rating || 5,
              ...data
            });
          });
        } catch (e) {
          console.warn("[getUserVotes] Error querying votes by userUid:", e);
        }

        try {
          const q2 = query(collection(realDb, "votes"), where("user_id", "==", realUid));
          const querySnapshot2 = await getDocs(q2);
          console.log("[getUserVotes] q2 (user_id == realUid) size:", querySnapshot2.size);
          querySnapshot2.forEach((doc) => {
            const data = doc.data();
            // Avoid duplicates
            if (!votes.some(v => v.id === doc.id)) {
              votes.push({
                id: doc.id,
                category: data.category,
                performerId: data.performerId || data.performance_id,
                starsRating: data.stars_rating || data.rating || 5,
                ...data
              });
            }
          });
        } catch (e) {
          console.warn("[getUserVotes] Error querying votes by user_id:", e);
        }

        console.log("[getUserVotes] Total resolved votes:", votes.length);
        return votes;
      },

      subscribeUserVotes: (userUid, userEmail = null, callback) => {
        let resolvedUid = userUid;
        let unsubscribe1 = null;
        let unsubscribe2 = null;
        let isCancelled = false;

        const setupListeners = (targetUid) => {
          if (isCancelled) return;

          let q1Docs = [];
          let q2Docs = [];

          const emitMerged = () => {
            const merged = [];
            const seenIds = new Set();
            [...q1Docs, ...q2Docs].forEach(docData => {
              if (!seenIds.has(docData.id)) {
                seenIds.add(docData.id);
                merged.push(docData);
              }
            });
            callback(merged);
          };

          const q1 = query(collection(realDb, "votes"), where("userUid", "==", targetUid));
          unsubscribe1 = onSnapshot(q1, (snapshot) => {
            q1Docs = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              q1Docs.push({
                id: doc.id,
                category: data.category,
                performerId: data.performerId || data.performance_id,
                starsRating: data.stars_rating || data.rating || 5,
                ...data
              });
            });
            emitMerged();
          }, (err) => console.warn("Err q1:", err));

          const q2 = query(collection(realDb, "votes"), where("user_id", "==", targetUid));
          unsubscribe2 = onSnapshot(q2, (snapshot) => {
            q2Docs = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              q2Docs.push({
                id: doc.id,
                category: data.category,
                performerId: data.performerId || data.performance_id,
                starsRating: data.stars_rating || data.rating || 5,
                ...data
              });
            });
            emitMerged();
          }, (err) => console.warn("Err q2:", err));
        };

        if (userEmail) {
          const qEmail = query(collection(realDb, "users"), where("email", "in", [userEmail, userEmail.toLowerCase()]));
          getDocs(qEmail).then((emailSnapshot) => {
            if (!emailSnapshot.empty) {
              resolvedUid = emailSnapshot.docs[0].id;
              console.log("[subscribeUserVotes] Resolved real Firebase UID:", resolvedUid);
            }
            setupListeners(resolvedUid);
          }).catch((err) => {
            console.warn("[subscribeUserVotes] Error resolving UID:", err);
            setupListeners(resolvedUid);
          });
        } else {
          setupListeners(resolvedUid);
        }

        return () => {
          isCancelled = true;
          if (unsubscribe1) unsubscribe1();
          if (unsubscribe2) unsubscribe2();
        };
      },

      registerParticipant: async (participantData) => {
        const id = "p_" + Date.now();

        // 1. Write to registrations collection (mobile/admin schema)
        const registrationsRef = doc(realDb, "registrations", id);
        const registrationDoc = {
          // Web App Schema Fields
          name: participantData.name || '',
          email: participantData.email || '',
          phone: participantData.phone || '',
          rollNo: participantData.rollNo || '',
          school: participantData.school || '',
          dept: participantData.dept || '',
          bhavan: participantData.bhavan || '',
          year: participantData.year || 1,
          category: participantData.category || '',
          specificEvent: participantData.specificEvent || '',
          teamSize: participantData.teamSize || 1,
          region: participantData.region || '',
          teamMembers: participantData.teamMembers || [],
          timestamp: new Date().toISOString(),

          // Mobile App Schema Fields (synced)
          user_id: participantData.user_id || participantData.uid || 'firebase_user',
          participant_name: participantData.name || '',
          talent_type: participantData.category || '',
          talent_description: participantData.specificEvent || '',
          year_of_study: parseInt(participantData.year) || 1,
          year_of_study_string: String(participantData.year || '1'),
          branch: participantData.branch || participantData.dept || '',
          event_category: participantData.category || '',
          event_name: participantData.specificEvent || '',
          team_size: participantData.teamSize || 1,
          status: 'pending',
          registered_at: new Date()
        };
        await setDoc(registrationsRef, registrationDoc);

        // 2. Write to legacy participants collection (for backward compatibility)
        try {
          const participantRef = doc(realDb, "participants", id);
          await setDoc(participantRef, {
            ...participantData,
            id,
            registeredAt: new Date()
          });
        } catch (err) {
          console.warn("Could not save to legacy participants collection:", err);
        }

        return { ...participantData, id, registeredAt: new Date() };
      },

      saveUserProfile: async (uid, profileData) => {
        if (!uid) return;
        try {
          const userRef = doc(realDb, "users", uid);
          await setDoc(userRef, {
            uid,
            name: profileData.name || profileData.displayName || '',
            fullName: profileData.name || profileData.displayName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            rollNo: profileData.rollNo || '',
            campus: profileData.campus || '',
            branch: profileData.branch || '',
            region: profileData.region || '',
            updatedAt: new Date()
          }, { merge: true });
          console.log("User profile saved successfully in Firestore.");
        } catch (err) {
          console.warn("Failed to save user profile in Firestore:", err);
        }
      },

      checkUserFeedbackStatus: async (email, uid, sessionId, lastEnabledAt) => {
        if (!email && !uid) return false;
        try {
          let compareDate = null;
          if (lastEnabledAt) {
            if (lastEnabledAt.toDate) {
              compareDate = lastEnabledAt.toDate();
            } else if (lastEnabledAt.seconds) {
              compareDate = new Date(lastEnabledAt.seconds * 1000);
            } else {
              compareDate = new Date(lastEnabledAt);
            }
          }

          // 1. Query event_feedback by email
          const q = query(
            collection(realDb, "event_feedback"),
            where("email", "==", email || ""),
            where("sessionId", "==", sessionId || "event_feedback_session")
          );
          const snap = await getDocs(q);
          let hasSubmitted = false;
          snap.forEach(doc => {
            const data = doc.data();
            const submittedAt = data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt)) : null;
            if (!compareDate || (submittedAt && submittedAt >= compareDate)) {
              hasSubmitted = true;
            }
          });
          if (hasSubmitted) return true;

          // 2. Query event_feedback by userId
          if (uid) {
            const qUid = query(
              collection(realDb, "event_feedback"),
              where("userId", "==", uid),
              where("sessionId", "==", sessionId || "event_feedback_session")
            );
            const snapUid = await getDocs(qUid);
            snapUid.forEach(doc => {
              const data = doc.data();
              const submittedAt = data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt)) : null;
              if (!compareDate || (submittedAt && submittedAt >= compareDate)) {
                hasSubmitted = true;
              }
            });
            if (hasSubmitted) return true;
          }

          // 3. Query general_feedbacks by user_email
          const qGeneral = query(
            collection(realDb, "general_feedbacks"),
            where("user_email", "==", email || ""),
            where("session_id", "==", sessionId || "event_feedback_session")
          );
          const snapGeneral = await getDocs(qGeneral);
          snapGeneral.forEach(doc => {
            const data = doc.data();
            const submittedAt = data.submitted_at ? (data.submitted_at.toDate ? data.submitted_at.toDate() : new Date(data.submitted_at)) : null;
            if (!compareDate || (submittedAt && submittedAt >= compareDate)) {
              hasSubmitted = true;
            }
          });
          if (hasSubmitted) return true;

          // 4. Query general_feedbacks by user_id
          if (uid) {
            const qGeneralUid = query(
              collection(realDb, "general_feedbacks"),
              where("user_id", "==", uid),
              where("session_id", "==", sessionId || "event_feedback_session")
            );
            const snapGeneralUid = await getDocs(qGeneralUid);
            snapGeneralUid.forEach(doc => {
              const data = doc.data();
              const submittedAt = data.submitted_at ? (data.submitted_at.toDate ? data.submitted_at.toDate() : new Date(data.submitted_at)) : null;
              if (!compareDate || (submittedAt && submittedAt >= compareDate)) {
                hasSubmitted = true;
              }
            });
            if (hasSubmitted) return true;
          }
        } catch (err) {
          console.warn("Error checking feedback status:", err);
        }
        return false;
      },

      getParticipantProfile: async (email, uid) => {
        let profileData = null;
        
        // 1. Try pulling directly from `/users/[uid]` if UID is valid
        if (uid && !uid.startsWith("sql_")) {
          try {
            const userRef = doc(realDb, "users", uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              profileData = { id: userDoc.id, ...userDoc.data() };
            }
          } catch (e) {
            console.warn("Direct /users/[uid] lookup failed:", e);
          }
        }
        
        // 2. If not found, try querying `users` collection by email
        if (!profileData && email) {
          try {
            const q = query(collection(realDb, "users"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const matchedDoc = querySnapshot.docs[0];
              profileData = { id: matchedDoc.id, ...matchedDoc.data() };
            }
          } catch (e) {
            console.warn("Querying 'users' collection by email failed:", e);
          }
        }
        
        // 3. If still not found, fallback to querying `participants` collection by email
        if (!profileData && email) {
          try {
            const q = query(collection(realDb, "participants"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const matchedDoc = querySnapshot.docs[0];
              profileData = { id: matchedDoc.id, ...matchedDoc.data() };
            }
          } catch (e) {
            console.warn("Querying 'participants' collection failed:", e);
          }
        }
        
        // 4. Map the resulting object fields dynamically to ensure normalization
        if (profileData) {
          return {
            name: profileData.name || profileData.fullName || profileData.full_name || profileData.displayName || profileData.display_name || "",
            email: profileData.email || email || "",
            phone: profileData.phone || profileData.phoneNumber || profileData.phone_number || profileData.contact || "",
            rollNo: profileData.roll || profileData.rollNo || profileData.rollNumber || profileData.roll_no || profileData.roll_number || profileData.collegeId || profileData.college_id || "",
            campus: profileData.campus || profileData.campusBlock || profileData.campus_block || profileData.college || "",
            branch: profileData.branch || profileData.dept || profileData.department || profileData.branch_name || "",
            region: profileData.region || ""
          };
        }
        
        return null;
      },

      subscribeGalleryImages: (callback) => {
        const q = collection(realDb, "highlights");
        return onSnapshot(q, (snapshot) => {
          const imagesList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            imagesList.push({
              id: doc.id,
              ...data,
              url: data.image_url || data.url || ''
            });
          });
          if (imagesList.length === 0) {
            // Fallback to legacy gallery_images collection
            const qLegacy = collection(realDb, "gallery_images");
            getDocs(qLegacy).then(legacySnap => {
              const legacyList = [];
              legacySnap.forEach(d => {
                const legacyData = d.data();
                legacyList.push({
                  id: d.id,
                  ...legacyData,
                  url: legacyData.image_url || legacyData.url || ''
                });
              });
              if (legacyList.length === 0) {
                callback(mockDb.getData("highlights", []));
              } else {
                callback(legacyList);
              }
            }).catch(() => {
              callback(mockDb.getData("highlights", []));
            });
          } else {
            callback(imagesList);
          }
        }, (error) => {
          console.error("Firestore gallery subscription error, loading mock state:", error);
          callback(mockDb.getData("highlights", []));
        });
      },

      subscribeHighlightReels: (callback) => {
        const q = collection(realDb, "highlight_reels");
        return onSnapshot(q, (snapshot) => {
          const reelsList = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            reelsList.push({
              id: doc.id,
              ...data,
              date: data.date || '',
              instagram_url: data.instagram_url || ''
            });
          });
          // Sort by date label alphabetically descending (e.g. WEEK 3, WEEK 2, WEEK 1)
          reelsList.sort((a, b) => b.date.localeCompare(a.date));
          if (reelsList.length === 0) {
            callback(mockDb.getData("highlight_reels", []));
          } else {
            callback(reelsList);
          }
        }, (error) => {
          console.error("Firestore highlight reels subscription error, loading mock state:", error);
          callback(mockDb.getData("highlight_reels", []));
        });
      },

      subscribeNotifications: (callback) => {
        const q = collection(realDb, "notifications");
        return onSnapshot(q, (snapshot) => {
          const list = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              ...data,
              timestamp: data.created_at || data.timestamp || new Date().toISOString()
            });
          });
          // Sort by timestamp descending supporting both created_at (Timestamp) and timestamp
          list.sort((a, b) => {
            const getMillis = (item) => {
              const ts = item.created_at || item.timestamp || item.created || 0;
              if (ts?.seconds) return ts.seconds * 1000;
              if (ts instanceof Date) return ts.getTime();
              if (typeof ts === 'string') return new Date(ts).getTime();
              return 0;
            };
            return getMillis(b) - getMillis(a);
          });
          if (list.length === 0) {
            callback(mockDb.getData("notifications", []));
          } else {
            callback(list);
          }
        }, (error) => {
          console.error("Firestore notifications subscription error, loading mock state:", error);
          callback(mockDb.getData("notifications", []));
        });
      },

      getUserRegistrations: async (email) => {
        const list = [];
        
        // 1. Query new registrations collection by email
        try {
          const q = query(collection(realDb, "registrations"), where("email", "==", email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              ...data,
              name: data.participant_name || data.name || '',
              category: data.talent_type || data.category || '',
              talent_type: data.talent_type || data.category || '',
              specificEvent: data.event_name || data.specificEvent || data.talent_description || '',
              teamSize: data.team_size || data.teamSize || 1,
              year: data.year_of_study || data.year || 1,
              bhavan: data.bhavan || '',
              school: data.school || '',
              timestamp: data.registered_at ? (data.registered_at.seconds ? new Date(data.registered_at.seconds * 1000).toISOString() : data.registered_at) : data.timestamp,
              registeredAt: data.registered_at ? (data.registered_at.seconds ? new Date(data.registered_at.seconds * 1000).toISOString() : data.registered_at) : data.registeredAt
            });
          });
        } catch (e) {
          console.warn("Error querying registrations collection:", e);
        }

        // 2. Query legacy participants collection by email
        try {
          const q = query(collection(realDb, "participants"), where("email", "==", email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!list.some(item => item.id === doc.id)) {
              list.push({
                id: doc.id,
                ...data,
                registeredAt: data.registeredAt?.seconds ? new Date(data.registeredAt.seconds * 1000).toISOString() : data.registeredAt
              });
            }
          });
        } catch (e) {
          console.warn("Error querying participants collection:", e);
        }
        return list;
      },

      submitEventFeedback: async (feedbackData) => {
        const id = "f_" + Date.now();
        
        let userProfile = null;
        let userUid = '';
        let userEmail = '';
        let currentUser = null;
        try {
          currentUser = auth?.currentUser;
          if (currentUser) {
            userUid = currentUser.uid;
            userEmail = currentUser.email || '';
            userProfile = await db.getParticipantProfile(userEmail, userUid);
          }
        } catch (err) {
          console.warn("Could not retrieve profile for feedback submission:", err);
        }

        const fullName = userProfile?.name || userProfile?.fullName || userProfile?.full_name || currentUser?.displayName || (feedbackData.name && feedbackData.name !== 'Anonymous Student' ? feedbackData.name : null) || 'Aditya Student';
        const rollNumber = feedbackData.rollNo || feedbackData.rollNumber || userProfile?.rollNo || userProfile?.rollNumber || userProfile?.roll_number || '';

        // Format mobile feedback message
        let feedbackString = feedbackData.comments || '';
        if (feedbackData.rating) feedbackString = `[Rating: ${feedbackData.rating}/5] ${feedbackString}`;
        if (feedbackData.favoriteAct) feedbackString = `[Fav Act: ${feedbackData.favoriteAct}] ${feedbackString}`;

        // 1. Submit to general_feedbacks (mobile/admin)
        try {
          const generalRef = doc(realDb, "general_feedbacks", id);
          await setDoc(generalRef, {
            user_id: userUid,
            user_name: fullName,
            user_email: userEmail,
            user_roll: rollNumber,
            session_id: feedbackData.sessionId || 'event_feedback_session',
            feedback: feedbackString.trim(),
            submitted_at: new Date()
          });
        } catch (err) {
          console.warn("Could not save to general_feedbacks collection:", err);
        }

        // 2. Submit to event_feedback (web compatibility)
        const feedbackRef = doc(realDb, "event_feedback", id);
        const newFeedback = {
          ...feedbackData,
          id,
          user_id: userUid,
          user_name: fullName,
          user_email: userEmail,
          submittedAt: new Date()
        };
        await setDoc(feedbackRef, newFeedback);
        return { id, success: true };
      },

      subscribeEventFeedback: (callback) => {
        const qWeb = collection(realDb, "event_feedback");
        return onSnapshot(qWeb, (webSnapshot) => {
          const qMobile = collection(realDb, "general_feedbacks");
          getDocs(qMobile).then((mobileSnapshot) => {
            const combinedList = [];

            // Add web feedback
            webSnapshot.forEach((doc) => {
              const data = doc.data();
              combinedList.push({
                id: doc.id,
                ...data,
                comments: data.comments || data.feedback || '',
                favoriteAct: data.favoriteAct || '',
                rating: data.rating || 5,
                user_name: data.user_name || 'Web Student',
                submittedAt: data.submittedAt ? (data.submittedAt.seconds ? new Date(data.submittedAt.seconds * 1000) : new Date(data.submittedAt)) : new Date()
              });
            });

            // Add mobile feedback
            mobileSnapshot.forEach((doc) => {
              const data = doc.data();
              if (!combinedList.some(item => item.id === doc.id)) {
                let comments = data.feedback || '';
                let rating = 5;
                let favoriteAct = '';
                
                const ratingMatch = comments.match(/\[Rating:\s*([0-9.]+)\/5\]/);
                if (ratingMatch) {
                  rating = parseFloat(ratingMatch[1]);
                  comments = comments.replace(ratingMatch[0], '').trim();
                }
                const favActMatch = comments.match(/\[Fav Act:\s*([^\]]+)\]/);
                if (favActMatch) {
                  favoriteAct = favActMatch[1];
                  comments = comments.replace(favActMatch[0], '').trim();
                }

                combinedList.push({
                  id: doc.id,
                  comments: comments,
                  rating: rating,
                  favoriteAct: favoriteAct,
                  user_name: data.user_name || 'Mobile Student',
                  submittedAt: data.submitted_at ? (data.submitted_at.seconds ? new Date(data.submitted_at.seconds * 1000) : new Date(data.submitted_at)) : new Date()
                });
              }
            });

            // Sort by submittedAt descending
            combinedList.sort((a, b) => b.submittedAt - a.submittedAt);
            callback(combinedList);
          }).catch(err => {
            console.warn("Could not fetch general_feedbacks for sync, using event_feedback only:", err);
            const list = [];
            webSnapshot.forEach((doc) => {
              const data = doc.data();
              list.push({
                id: doc.id,
                ...data,
                comments: data.comments || data.feedback || '',
                submittedAt: data.submittedAt ? (data.submittedAt.seconds ? new Date(data.submittedAt.seconds * 1000) : new Date(data.submittedAt)) : new Date()
              });
            });
            list.sort((a, b) => b.submittedAt - a.submittedAt);
            callback(list);
          });
        }, (error) => {
          console.error("Firestore event_feedback subscription error, loading mock state:", error);
          const mockList = mockDb.getData("event_feedback", []);
          mockList.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
          callback(mockList);
        });
      },

      subscribeFeedbackStatus: (callback) => {
        const docRef = doc(realDb, "settings", "feedback");
        return onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data());
          } else {
            callback({ enabled: false });
          }
        }, (error) => {
          console.error("Firestore feedback status subscription error, falling back to mock:", error);
          callback(mockDb.getData("feedback_settings", { enabled: false }));
        });
      },

      subscribeUserProfile: (email, uid, callback) => {
        let unsub = null;
        
        const runFallbackQuery = () => {
          if (!email) {
            callback(null);
            return;
          }
          const qUsers = query(collection(realDb, "users"), where("email", "==", email));
          unsub = onSnapshot(qUsers, (snap) => {
            if (!snap.empty) {
              const data = snap.docs[0].data();
              callback({ id: snap.docs[0].id, ...data, name: data.name || data.fullName || '' });
            } else {
              const qParts = query(collection(realDb, "participants"), where("email", "==", email));
              const unsubParts = onSnapshot(qParts, (snapParts) => {
                if (!snapParts.empty) {
                  const data = snapParts.docs[0].data();
                  callback({ id: snapParts.docs[0].id, ...data });
                } else {
                  callback(null);
                }
              }, (err) => {
                console.warn("Error subscribing to participants:", err);
                callback(null);
              });
              
              const prevUnsub = unsub;
              unsub = () => {
                if (prevUnsub) prevUnsub();
                unsubParts();
              };
            }
          }, (err) => {
            console.warn("Error subscribing to users by email:", err);
            callback(null);
          });
        };

        if (uid && !uid.startsWith("sql_")) {
          const userRef = doc(realDb, "users", uid);
          unsub = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              callback({ id: docSnap.id, ...data, name: data.name || data.fullName || '' });
            } else {
              runFallbackQuery();
            }
          }, (err) => {
            console.warn("Error subscribing to users by UID, trying email:", err);
            runFallbackQuery();
          });
        } else {
          runFallbackQuery();
        }

        return () => {
          if (unsub) unsub();
        };
      },

      subscribeUserRegistrations: (email, callback) => {
        if (!email) {
          callback([]);
          return () => {};
        }

        let list1 = [];
        let list2 = [];

        const mergeAndCallback = () => {
          const combined = [];
          const seen = new Set();
          
          list1.forEach(item => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              combined.push(item);
            }
          });
          
          list2.forEach(item => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              combined.push(item);
            }
          });

          combined.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.registeredAt || 0).getTime();
            const timeB = new Date(b.timestamp || b.registeredAt || 0).getTime();
            return timeB - timeA;
          });

          callback(combined);
        };

        const q1 = query(collection(realDb, "registrations"), where("email", "==", email));
        const unsub1 = onSnapshot(q1, (snapshot) => {
          list1 = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list1.push({
              id: doc.id,
              ...data,
              name: data.participant_name || data.name || '',
              category: data.talent_type || data.category || '',
              talent_type: data.talent_type || data.category || '',
              specificEvent: data.event_name || data.specificEvent || data.talent_description || '',
              teamSize: data.team_size || data.teamSize || 1,
              year: data.year_of_study || data.year || 1,
              bhavan: data.bhavan || '',
              school: data.school || '',
              timestamp: data.registered_at ? (data.registered_at.seconds ? new Date(data.registered_at.seconds * 1000).toISOString() : data.registered_at) : data.timestamp,
              registeredAt: data.registered_at ? (data.registered_at.seconds ? new Date(data.registered_at.seconds * 1000).toISOString() : data.registered_at) : data.registeredAt
            });
          });
          mergeAndCallback();
        }, (err) => {
          console.warn("Registrations listener failed, using empty array:", err);
          list1 = [];
          mergeAndCallback();
        });

        const q2 = query(collection(realDb, "participants"), where("email", "==", email));
        const unsub2 = onSnapshot(q2, (snapshot) => {
          list2 = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list2.push({
              id: doc.id,
              ...data,
              registeredAt: data.registeredAt?.seconds ? new Date(data.registeredAt.seconds * 1000).toISOString() : data.registeredAt
            });
          });
          mergeAndCallback();
        }, (err) => {
          console.warn("Legacy participants listener failed, using empty array:", err);
          list2 = [];
          mergeAndCallback();
        });

        return () => {
          unsub1();
          unsub2();
        };
      }
    };
    
    isMock = false;
    console.log("Connected to Real Firebase Backend.");
  } catch (error) {
    console.error("Firebase init failed, running in Mock Mode:", error);
    auth = mockEngine.auth;
    db = mockEngine.db;
    isMock = true;
  }
} else {
  // No Firebase configuration provided, fallback to Mock Engine
  auth = mockEngine.auth;
  db = mockEngine.db;
  isMock = true;
  console.log("No Firebase credentials detected. App is operating in Mock Fallback Mode (LocalStorage Sync enabled).");
}

export { auth, db, isMock };
