require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');
const pool = require('./db/index');

const app = express();
const CATEGORIES = ['Heritage', 'Nature', 'Adventure', 'Religious', 'Beach', 'Wildlife'];
const CATEGORY_META = {
  Heritage: { intro: 'India\'s architectural and cultural landmarks.' },
  Nature: { intro: 'Scenic escapes ranging from tea gardens to alpine valleys.' },
  Adventure: { intro: 'Thrilling experiences in mountains, rivers and deserts.' },
  Religious: { intro: 'Temples, ghats and pilgrimage routes across the country.' },
  Beach: { intro: 'Relaxed coastal escapes with sunsets, shacks and lagoons.' },
  Wildlife: { intro: 'Tiger reserves, forests and biodiversity hotspots.' }
};

// ── View engine ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static files & body parser ────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session middleware ────────────────────────────────────────
app.use(session({
  store: new pgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'travelbharat_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// ── Pass user & flash to all views ──────────────────────────
app.use((req, res, next) => {
  res.locals.user    = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error   = req.session.error   || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

function setFlash(req, type, message) {
  req.session[type] = message;
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    setFlash(req, 'error', 'Admin login required.');
    return res.redirect('/admin/login');
  }

  if (req.session.user.role !== 'admin') {
    setFlash(req, 'error', 'Admin access only.');
    return res.redirect('/home');
  }

  next();
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildStateUrl(name) {
  return `/states/${slugify(name)}`;
}

function buildDestinationUrl(destination) {
  return `/destinations/${destination.id}/${slugify(destination.name)}`;
}

async function getSiteStats() {
  const [stateCount, destinationCount, categoryCount, galleryCount] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM states'),
    pool.query('SELECT COUNT(*)::int AS count FROM destinations'),
    pool.query('SELECT COUNT(DISTINCT category)::int AS count FROM destinations'),
    pool.query('SELECT COUNT(*)::int AS count FROM gallery_images')
  ]);

  return {
    states: stateCount.rows[0]?.count || 0,
    destinations: destinationCount.rows[0]?.count || 0,
    categories: categoryCount.rows[0]?.count || 0,
    galleryImages: galleryCount.rows[0]?.count || 0
  };
}

async function fetchStateBySlug(slug) {
  const result = await pool.query('SELECT * FROM states ORDER BY name');
  return result.rows.find((state) => slugify(state.name) === slug) || null;
}

async function fetchDestinationById(id) {
  const result = await pool.query(
    `SELECT d.*, s.name AS state_name, s.region, s.type AS state_type,
            s.capital, s.language, s.best_time AS state_best_time
     FROM destinations d
     JOIN states s ON d.state_id = s.id
     WHERE d.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getAdminDashboardData() {
  const [stats, recentDestinations, recentUsers] = await Promise.all([
    getSiteStats(),
    pool.query(
      `SELECT d.id, d.name, d.category, d.rating, s.name AS state_name
       FROM destinations d
       JOIN states s ON s.id = d.state_id
       ORDER BY d.id DESC
       LIMIT 6`
    ),
    pool.query(
      `SELECT id, full_name, username, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 6`
    )
  ]);

  return {
    stats,
    recentDestinations: recentDestinations.rows,
    recentUsers: recentUsers.rows
  };
}

function normalizeStatePayload(body) {
  return {
    name: (body.name || '').trim(),
    type: body.type === 'union_territory' ? 'union_territory' : 'state',
    capital: (body.capital || '').trim(),
    region: (body.region || '').trim(),
    description: (body.description || '').trim(),
    image_url: (body.image_url || '').trim(),
    best_time: (body.best_time || '').trim(),
    language: (body.language || '').trim(),
    famous_for: (body.famous_for || '').trim(),
    destinations_count: Number.parseInt(body.destinations_count, 10) || 0
  };
}

function normalizeDestinationPayload(body) {
  return {
    state_id: Number.parseInt(body.state_id, 10),
    name: (body.name || '').trim(),
    location: (body.location || '').trim(),
    category: CATEGORIES.includes(body.category) ? body.category : 'Heritage',
    description: (body.description || '').trim(),
    image_url: (body.image_url || '').trim(),
    entry_fee: (body.entry_fee || '').trim(),
    best_time: (body.best_time || '').trim(),
    rating: Number.parseFloat(body.rating) || 4.0
  };
}

function normalizeGalleryPayload(body) {
  return {
    title: (body.title || '').trim(),
    location: (body.location || '').trim(),
    state: (body.state || '').trim(),
    image_url: (body.image_url || '').trim(),
    category: CATEGORIES.includes(body.category) ? body.category : 'Heritage'
  };
}

// ════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ════════════════════════════════════════════════════════════

// Splash
app.get('/', (req, res) => res.render('pages/splash'));

// Login page
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/home');
  res.render('pages/login', { tab: req.query.tab || 'login' });
});

// Register page — no separate page, handled via tabs in login.ejs
app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/home');
  res.redirect('/login?tab=register');
});

// ── POST Login ──────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      req.session.error = 'Username and password are required.';
      return res.redirect('/login');
    }
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1', [username]
    );
    if (result.rows.length === 0) {
      req.session.error = 'Invalid username or password.';
      return res.redirect('/login');
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.session.error = 'Invalid username or password.';
      return res.redirect('/login');
    }
    req.session.user = { id: user.id, username: user.username, full_name: user.full_name, role: user.role };
    req.session.success = `Welcome back, ${user.full_name.split(' ')[0]}! 🇮🇳`;
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    req.session.error = 'Server error. Please try again.';
    res.redirect('/login');
  }
});

// ── POST Register ────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
  const { full_name, email, username, password, confirm_password } = req.body;
  try {
    if (!full_name || !email || !username || !password) {
      req.session.error = 'All fields are required.';
      return res.redirect('/login?tab=register');
    }
    if (password !== confirm_password) {
      req.session.error = 'Passwords do not match.';
      return res.redirect('/login?tab=register');
    }
    if (password.length < 6) {
      req.session.error = 'Password must be at least 6 characters.';
      return res.redirect('/login?tab=register');
    }
    // Check duplicates
    const exists = await pool.query(
      'SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]
    );
    if (exists.rows.length > 0) {
      req.session.error = 'Username or email already taken.';
      return res.redirect('/login?tab=register');
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (full_name,email,username,password_hash) VALUES($1,$2,$3,$4) RETURNING *',
      [full_name, email, username, hash]
    );
    req.session.user = {
      id: newUser.rows[0].id,
      username: newUser.rows[0].username,
      full_name: newUser.rows[0].full_name,
      role: 'user'
    };
    req.session.success = `Account created! Welcome to TravelBharat, ${full_name.split(' ')[0]}! 🇮🇳`;
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    req.session.error = 'Server error. Please try again.';
    res.redirect('/login?tab=register');
  }
});

// ── Logout ───────────────────────────────────────────────────
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/api/search/suggestions', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const [destinations, states] = await Promise.all([
      pool.query(
        `SELECT d.id, d.name, s.name AS state_name
         FROM destinations d
         JOIN states s ON s.id = d.state_id
         WHERE d.name ILIKE $1
         ORDER BY d.rating DESC, d.name
         LIMIT 6`,
        [`%${q}%`]
      ),
      pool.query(
        `SELECT id, name
         FROM states
         WHERE name ILIKE $1
         ORDER BY destinations_count DESC, name
         LIMIT 4`,
        [`%${q}%`]
      )
    ]);

    const suggestions = [
      ...destinations.rows.map((row) => ({
        type: 'destination',
        label: `${row.name} - ${row.state_name}`,
        url: buildDestinationUrl(row)
      })),
      ...states.rows.map((row) => ({
        type: 'state',
        label: row.name,
        url: buildStateUrl(row.name)
      }))
    ];

    res.json({ suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ suggestions: [] });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getSiteStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load stats.' });
  }
});

app.get('/api/states', async (req, res) => {
  try {
    const filters = [];
    const params = [];
    let index = 1;

    if (req.query.region) {
      filters.push(`region = $${index++}`);
      params.push(req.query.region);
    }

    if (req.query.type) {
      filters.push(`type = $${index++}`);
      params.push(req.query.type);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM states ${where} ORDER BY type, name`, params);
    res.json({
      states: result.rows.map((state) => ({
        ...state,
        slug: slugify(state.name),
        url: buildStateUrl(state.name)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load states.' });
  }
});

app.get('/api/states/:slug', async (req, res) => {
  try {
    const state = await fetchStateBySlug(req.params.slug);
    if (!state) return res.status(404).json({ error: 'State not found.' });

    const destinations = await pool.query(
      `SELECT id, name, category, image_url, best_time, entry_fee, rating
       FROM destinations
       WHERE state_id = $1
       ORDER BY rating DESC, name`,
      [state.id]
    );

    res.json({
      state: { ...state, slug: slugify(state.name), url: buildStateUrl(state.name) },
      destinations: destinations.rows.map((destination) => ({
        ...destination,
        url: buildDestinationUrl(destination)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load state.' });
  }
});

app.get('/api/destinations', async (req, res) => {
  try {
    const filters = [];
    const params = [];
    let index = 1;

    if (req.query.q) {
      filters.push(`(d.name ILIKE $${index} OR d.description ILIKE $${index} OR s.name ILIKE $${index})`);
      params.push(`%${req.query.q}%`);
      index += 1;
    }

    if (req.query.category) {
      filters.push(`d.category = $${index++}`);
      params.push(req.query.category);
    }

    if (req.query.state) {
      filters.push(`s.name = $${index++}`);
      params.push(req.query.state);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT d.*, s.name AS state_name
       FROM destinations d
       JOIN states s ON s.id = d.state_id
       ${where}
       ORDER BY d.rating DESC, d.name`,
      params
    );

    res.json({
      destinations: result.rows.map((destination) => ({
        ...destination,
        url: buildDestinationUrl(destination)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load destinations.' });
  }
});

app.get('/api/destinations/:id', async (req, res) => {
  try {
    const destination = await fetchDestinationById(req.params.id);
    if (!destination) return res.status(404).json({ error: 'Destination not found.' });

    res.json({
      destination: {
        ...destination,
        slug: slugify(destination.name),
        url: buildDestinationUrl(destination),
        stateUrl: buildStateUrl(destination.state_name)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load destination.' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const counts = await pool.query(
      `SELECT category, COUNT(*)::int AS total
       FROM destinations
       GROUP BY category`
    );

    const lookup = Object.fromEntries(counts.rows.map((row) => [row.category, row.total]));
    res.json({
      categories: CATEGORIES.map((category) => ({
        name: category,
        slug: slugify(category),
        total: lookup[category] || 0,
        intro: CATEGORY_META[category]?.intro || ''
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load categories.' });
  }
});

// ════════════════════════════════════════════════════════════
//  MAIN PAGES
// ════════════════════════════════════════════════════════════

// Home
app.get('/home', async (req, res) => {
  try {
    const [featuredStates, popularDest, stats] = await Promise.all([
      pool.query(`SELECT * FROM states ORDER BY destinations_count DESC, name LIMIT 8`),
      pool.query(
        `SELECT d.*, s.name AS state_name FROM destinations d
         JOIN states s ON d.state_id = s.id
         ORDER BY d.rating DESC, d.name LIMIT 6`
      ),
      getSiteStats()
    ]);
    res.render('pages/home', {
      featuredStates: featuredStates.rows,
      popularDest: popularDest.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) })),
      stats
    });
  } catch (err) {
    console.error(err);
    res.render('pages/home', {
      featuredStates: [],
      popularDest: [],
      stats: { states: 0, destinations: 0, categories: 0, galleryImages: 0 }
    });
  }
});

// States & UTs
app.get('/states', async (req, res) => {
  try {
    const statesResult = await pool.query(`SELECT * FROM states ORDER BY type, name`);
    const allStates = statesResult.rows.map((state) => ({
      ...state,
      slug: slugify(state.name)
    }));
    const regions = [...new Set(allStates.map((state) => state.region).filter(Boolean))].sort();

    res.render('pages/states-index', {
      states: allStates.filter((state) => state.type === 'state'),
      uts: allStates.filter((state) => state.type === 'union_territory'),
      regions
    });
  } catch (err) {
    console.error(err);
    res.render('pages/states-index', { states: [], uts: [], regions: [] });
  }
});

app.get('/states/:slug', async (req, res, next) => {
  try {
    const state = await fetchStateBySlug(req.params.slug);
    if (!state) return next();

    const [destinations, gallery, regionalHighlights] = await Promise.all([
      pool.query(
        `SELECT d.*, s.name AS state_name
         FROM destinations d
         JOIN states s ON s.id = d.state_id
         WHERE d.state_id = $1
         ORDER BY d.rating DESC, d.name`,
        [state.id]
      ),
      pool.query(
        `SELECT *
         FROM gallery_images
         WHERE state = $1
         ORDER BY id
         LIMIT 8`,
        [state.name]
      ),
      pool.query(
        `SELECT id, name, image_url, category, location, best_time, rating, entry_fee
         FROM destinations
         WHERE state_id = $1
         ORDER BY rating DESC, name
         LIMIT 4`,
        [state.id]
      )
    ]);

    const categoryBreakdown = CATEGORIES.map((category) => ({
      name: category,
      count: destinations.rows.filter((destination) => destination.category === category).length
    })).filter((item) => item.count > 0);

    res.render('pages/state-detail', {
      state: { ...state, slug: slugify(state.name) },
      destinations: destinations.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) })),
      galleryImages: gallery.rows,
      categoryBreakdown,
      regionalHighlights: regionalHighlights.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) }))
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Explore
app.get('/explore', async (req, res) => {
  try {
    const { q, category, state: stateFilter, region } = req.query;
    let query = `SELECT d.*, s.name AS state_name, s.region FROM destinations d
                 JOIN states s ON d.state_id = s.id WHERE 1=1`;
    const params = [];
    let i = 1;
    if (q) {
      query += ` AND (d.name ILIKE $${i} OR d.description ILIKE $${i} OR s.name ILIKE $${i})`;
      params.push(`%${q}%`);
      i += 1;
    }
    if (category) { query += ` AND d.category = $${i++}`; params.push(category); }
    if (stateFilter) { query += ` AND s.name = $${i++}`; params.push(stateFilter); }
    if (region) { query += ` AND s.region = $${i++}`; params.push(region); }
    query += ` ORDER BY d.rating DESC, d.name`;

    const [destResult, statesAll, regions] = await Promise.all([
      pool.query(query, params),
      pool.query(`SELECT DISTINCT name FROM states ORDER BY name`),
      pool.query(`SELECT DISTINCT region FROM states WHERE region IS NOT NULL ORDER BY region`)
    ]);

    res.render('pages/explore-hub', {
      destinations: destResult.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) })),
      allStates: statesAll.rows,
      regions: regions.rows.map((row) => row.region),
      categories: CATEGORIES,
      filters: { q: q || '', category: category || '', state: stateFilter || '', region: region || '' }
    });
  } catch (err) {
    console.error(err);
    res.render('pages/explore-hub', {
      destinations: [],
      allStates: [],
      regions: [],
      categories: CATEGORIES,
      filters: {}
    });
  }
});

// Categories
app.get('/categories', async (req, res) => {
  try {
    const data = {};
    for (const cat of CATEGORIES) {
      const r = await pool.query(
        `SELECT d.*, s.name AS state_name FROM destinations d
         JOIN states s ON d.state_id = s.id
         WHERE d.category = $1 ORDER BY d.rating DESC LIMIT 6`, [cat]
      );
      data[cat] = r.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) }));
    }
    res.render('pages/categories-hub', { categoryData: data, categories: CATEGORIES });
  } catch (err) {
    console.error(err);
    res.render('pages/categories-hub', { categoryData: {}, categories: CATEGORIES });
  }
});

app.get('/categories/:slug', async (req, res, next) => {
  try {
    const category = CATEGORIES.find((item) => slugify(item) === req.params.slug);
    if (!category) return next();

    const [destinations, topStates] = await Promise.all([
      pool.query(
        `SELECT d.*, s.name AS state_name, s.region
         FROM destinations d
         JOIN states s ON d.state_id = s.id
         WHERE d.category = $1
         ORDER BY d.rating DESC, d.name`,
        [category]
      ),
      pool.query(
        `SELECT s.name, COUNT(*)::int AS total
         FROM destinations d
         JOIN states s ON d.state_id = s.id
         WHERE d.category = $1
         GROUP BY s.name
         ORDER BY total DESC, s.name
         LIMIT 6`,
        [category]
      )
    ]);

    res.render('pages/category-detail', {
      category,
      categorySlug: slugify(category),
      categoryMeta: CATEGORY_META[category],
      destinations: destinations.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) })),
      topStates: topStates.rows.map((row) => ({ ...row, url: buildStateUrl(row.name) }))
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.get(['/destinations/:id', '/destinations/:id/:slug'], async (req, res, next) => {
  try {
    const destination = await fetchDestinationById(req.params.id);
    if (!destination) return next();

    const canonicalSlug = slugify(destination.name);
    if (req.params.slug && req.params.slug !== canonicalSlug) {
      return res.redirect(301, `/destinations/${destination.id}/${canonicalSlug}`);
    }

    const [nearby, gallery] = await Promise.all([
      pool.query(
        `SELECT d.*, s.name AS state_name
         FROM destinations d
         JOIN states s ON s.id = d.state_id
         WHERE d.state_id = $1 AND d.id <> $2
         ORDER BY d.rating DESC, d.name
         LIMIT 4`,
        [destination.state_id, destination.id]
      ),
      pool.query(
        `SELECT *
         FROM gallery_images
         WHERE state = $1 OR title ILIKE $2
         ORDER BY id
         LIMIT 6`,
        [destination.state_name, `%${destination.name}%`]
      )
    ]);

    res.render('pages/destination-detail', {
      destination: {
        ...destination,
        slug: canonicalSlug,
        stateSlug: slugify(destination.state_name),
        mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${destination.name}, ${destination.state_name}`)}`
      },
      nearby: nearby.rows.map((row) => ({ ...row, detailUrl: buildDestinationUrl(row) })),
      galleryImages: gallery.rows
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Gallery
app.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    let qry = 'SELECT * FROM gallery_images';
    const params = [];
    if (category) { qry += ' WHERE category = $1'; params.push(category); }
    qry += ' ORDER BY id';
    const images = await pool.query(qry, params);
    const cats   = await pool.query('SELECT DISTINCT category FROM gallery_images ORDER BY category');
    res.render('pages/gallery', {
      images: images.rows,
      categories: cats.rows.map(r => r.category),
      activeCategory: category || 'All'
    });
  } catch (err) {
    console.error(err);
    res.render('pages/gallery', { images: [], categories: [], activeCategory: 'All' });
  }
});

// About
app.get('/about', async (req, res) => {
  try {
    const stats = await getSiteStats();
    res.render('pages/about', { stats });
  } catch (err) {
    console.error(err);
    res.render('pages/about', {
      stats: { states: 0, destinations: 0, categories: 0, galleryImages: 0 }
    });
  }
});

// Admin
app.get('/admin', requireAdmin, (req, res) => res.redirect('/admin/dashboard'));

app.get('/admin/login', (req, res) => {
  if (req.session.user?.role === 'admin') return res.redirect('/admin/dashboard');
  res.render('pages/admin-login');
});

app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE (username = $1 OR email = $1) AND role = $2',
      [username, 'admin']
    );

    if (!result.rows.length) {
      setFlash(req, 'error', 'Invalid admin credentials.');
      return res.redirect('/admin/login');
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      setFlash(req, 'error', 'Invalid admin credentials.');
      return res.redirect('/admin/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role
    };

    setFlash(req, 'success', `Welcome to the admin dashboard, ${user.full_name.split(' ')[0]}.`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to sign in as admin.');
    res.redirect('/admin/login');
  }
});

app.get('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const data = await getAdminDashboardData();
    res.render('pages/admin-dashboard', data);
  } catch (err) {
    console.error(err);
    res.render('pages/admin-dashboard', {
      stats: { states: 0, destinations: 0, categories: 0, galleryImages: 0 },
      recentDestinations: [],
      recentUsers: []
    });
  }
});

app.get('/admin/states', requireAdmin, async (req, res) => {
  try {
    const states = await pool.query('SELECT * FROM states ORDER BY type, name');
    res.render('pages/admin-states', { states: states.rows });
  } catch (err) {
    console.error(err);
    res.render('pages/admin-states', { states: [] });
  }
});

app.post('/admin/states', requireAdmin, async (req, res) => {
  const payload = normalizeStatePayload(req.body);
  try {
    if (!payload.name || !payload.capital || !payload.region) {
      setFlash(req, 'error', 'State name, capital, and region are required.');
      return res.redirect('/admin/states');
    }

    await pool.query(
      `INSERT INTO states (name, type, capital, region, description, image_url, best_time, language, famous_for, destinations_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        payload.name,
        payload.type,
        payload.capital,
        payload.region,
        payload.description,
        payload.image_url,
        payload.best_time,
        payload.language,
        payload.famous_for,
        payload.destinations_count
      ]
    );

    setFlash(req, 'success', `${payload.name} added successfully.`);
    res.redirect('/admin/states');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to create state.');
    res.redirect('/admin/states');
  }
});

app.post('/admin/states/:id/update', requireAdmin, async (req, res) => {
  const payload = normalizeStatePayload(req.body);
  try {
    await pool.query(
      `UPDATE states
       SET name = $1, type = $2, capital = $3, region = $4, description = $5,
           image_url = $6, best_time = $7, language = $8, famous_for = $9, destinations_count = $10
       WHERE id = $11`,
      [
        payload.name,
        payload.type,
        payload.capital,
        payload.region,
        payload.description,
        payload.image_url,
        payload.best_time,
        payload.language,
        payload.famous_for,
        payload.destinations_count,
        req.params.id
      ]
    );
    setFlash(req, 'success', `${payload.name} updated.`);
    res.redirect('/admin/states');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to update state.');
    res.redirect('/admin/states');
  }
});

app.post('/admin/states/:id/delete', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM states WHERE id = $1', [req.params.id]);
    setFlash(req, 'success', 'State deleted.');
    res.redirect('/admin/states');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to delete state.');
    res.redirect('/admin/states');
  }
});

app.get('/admin/destinations', requireAdmin, async (req, res) => {
  try {
    const [destinations, states] = await Promise.all([
      pool.query(
        `SELECT d.*, s.name AS state_name
         FROM destinations d
         JOIN states s ON s.id = d.state_id
         ORDER BY d.id DESC`
      ),
      pool.query('SELECT id, name FROM states ORDER BY name')
    ]);

    res.render('pages/admin-destinations', {
      destinations: destinations.rows,
      states: states.rows,
      categories: CATEGORIES
    });
  } catch (err) {
    console.error(err);
    res.render('pages/admin-destinations', {
      destinations: [],
      states: [],
      categories: CATEGORIES
    });
  }
});

app.post('/admin/destinations', requireAdmin, async (req, res) => {
  const payload = normalizeDestinationPayload(req.body);
  try {
    if (!payload.state_id || !payload.name || !payload.description) {
      setFlash(req, 'error', 'State, destination name, and description are required.');
      return res.redirect('/admin/destinations');
    }

    await pool.query(
      `INSERT INTO destinations (state_id, name, location, category, description, image_url, entry_fee, best_time, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        payload.state_id,
        payload.name,
        payload.location,
        payload.category,
        payload.description,
        payload.image_url,
        payload.entry_fee,
        payload.best_time,
        payload.rating
      ]
    );

    setFlash(req, 'success', `${payload.name} added successfully.`);
    res.redirect('/admin/destinations');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to create destination.');
    res.redirect('/admin/destinations');
  }
});

app.post('/admin/destinations/:id/update', requireAdmin, async (req, res) => {
  const payload = normalizeDestinationPayload(req.body);
  try {
    await pool.query(
      `UPDATE destinations
       SET state_id = $1, name = $2, location = $3, category = $4, description = $5,
           image_url = $6, entry_fee = $7, best_time = $8, rating = $9
       WHERE id = $10`,
      [
        payload.state_id,
        payload.name,
        payload.location,
        payload.category,
        payload.description,
        payload.image_url,
        payload.entry_fee,
        payload.best_time,
        payload.rating,
        req.params.id
      ]
    );
    setFlash(req, 'success', `${payload.name} updated.`);
    res.redirect('/admin/destinations');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to update destination.');
    res.redirect('/admin/destinations');
  }
});

app.post('/admin/destinations/:id/delete', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM destinations WHERE id = $1', [req.params.id]);
    setFlash(req, 'success', 'Destination deleted.');
    res.redirect('/admin/destinations');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to delete destination.');
    res.redirect('/admin/destinations');
  }
});

app.get('/admin/gallery', requireAdmin, async (req, res) => {
  try {
    const images = await pool.query('SELECT * FROM gallery_images ORDER BY id DESC');
    res.render('pages/admin-gallery', { images: images.rows, categories: CATEGORIES });
  } catch (err) {
    console.error(err);
    res.render('pages/admin-gallery', { images: [], categories: CATEGORIES });
  }
});

app.post('/admin/gallery', requireAdmin, async (req, res) => {
  const payload = normalizeGalleryPayload(req.body);
  try {
    if (!payload.title || !payload.image_url) {
      setFlash(req, 'error', 'Gallery title and image URL are required.');
      return res.redirect('/admin/gallery');
    }

    await pool.query(
      `INSERT INTO gallery_images (title, location, state, image_url, category)
       VALUES ($1,$2,$3,$4,$5)`,
      [payload.title, payload.location, payload.state, payload.image_url, payload.category]
    );
    setFlash(req, 'success', `${payload.title} added to the gallery.`);
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to add gallery image.');
    res.redirect('/admin/gallery');
  }
});

app.post('/admin/gallery/:id/update', requireAdmin, async (req, res) => {
  const payload = normalizeGalleryPayload(req.body);
  try {
    await pool.query(
      `UPDATE gallery_images
       SET title = $1, location = $2, state = $3, image_url = $4, category = $5
       WHERE id = $6`,
      [payload.title, payload.location, payload.state, payload.image_url, payload.category, req.params.id]
    );
    setFlash(req, 'success', `${payload.title} updated.`);
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to update gallery image.');
    res.redirect('/admin/gallery');
  }
});

app.post('/admin/gallery/:id/delete', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM gallery_images WHERE id = $1', [req.params.id]);
    setFlash(req, 'success', 'Gallery image deleted.');
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error(err);
    setFlash(req, 'error', 'Unable to delete gallery image.');
    res.redirect('/admin/gallery');
  }
});

app.get('/admin/categories', requireAdmin, async (req, res) => {
  try {
    const counts = await pool.query(
      `SELECT category, COUNT(*)::int AS total, AVG(rating)::numeric(3,2) AS avg_rating
       FROM destinations
       GROUP BY category
       ORDER BY category`
    );
    const lookup = Object.fromEntries(counts.rows.map((row) => [row.category, row]));
    res.render('pages/admin-categories', {
      categories: CATEGORIES.map((category) => ({
        name: category,
        slug: slugify(category),
        intro: CATEGORY_META[category]?.intro || '',
        total: lookup[category]?.total || 0,
        avg_rating: lookup[category]?.avg_rating || null
      }))
    });
  } catch (err) {
    console.error(err);
    res.render('pages/admin-categories', {
      categories: CATEGORIES.map((category) => ({
        name: category,
        slug: slugify(category),
        intro: CATEGORY_META[category]?.intro || '',
        total: 0,
        avg_rating: null
      }))
    });
  }
});

// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).render('pages/404'));

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`TravelBharat running at http://localhost${PORT === 80 ? '' : ':' + PORT}`);
});
