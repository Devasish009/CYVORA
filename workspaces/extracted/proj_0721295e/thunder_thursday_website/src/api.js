// src/api.js

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000';

const api = {
  // Token management
  getToken() {
    return localStorage.getItem('tt_jwt_token');
  },
  setToken(token) {
    localStorage.setItem('tt_jwt_token', token);
  },
  removeToken() {
    localStorage.removeItem('tt_jwt_token');
  },

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // 1. Authentication
  async signup(email, password, fullName, phone) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed.');
    if (data.success && data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');
    if (data.success && data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Session verification failed.');
    return data;
  },

  // 2. Event Registrations (Slot booking)
  async bookSlot(school, talentType, description, name, bhavan, year) {
    const res = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        school,
        talent_type: talentType,
        talent_description: description,
        participant_name: name,
        bhavan,
        year_of_study: parseInt(year)
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Event registration failed.');
    return data;
  },

  async getMyRegistration() {
    const res = await fetch(`${BASE_URL}/api/registrations/my-registration`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to retrieve registration.');
    return data;
  },

  // 3. Voting & Live Performances
  async getLivePerformers() {
    const res = await fetch(`${BASE_URL}/api/voting/performances`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load live performances.');
    return data;
  },

  async castVote(performanceId, stars) {
    const res = await fetch(`${BASE_URL}/api/voting/vote`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        performance_id: performanceId,
        stars_rating: parseInt(stars)
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit vote.');
    return data;
  },

  async getUserVotes() {
    const res = await fetch(`${BASE_URL}/api/voting/my-votes`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user votes.');
    return data;
  },

  // 4. Gallery & Highlights
  async getHighlights() {
    const res = await fetch(`${BASE_URL}/api/highlights`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to load gallery highlights.');
    return data;
  }
};

export default api;
