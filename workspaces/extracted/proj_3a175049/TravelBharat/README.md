# 🇮🇳 TravelBharat – Discover the Soul of India

**TravelBharat** is a unified, full-stack tourism information platform that provides state-wise and destination-wise details of tourist attractions across India. Developed as a showcase project for the **Unified Mentor Internship**, it offers an interactive, visually stunning, and highly responsive glassmorphism UI designed to help users explore India's 28 states and 8 union territories, browse destinations by category, search for landmarks, and manage content via a secure admin panel.

---

## 🌟 Features

- **Interactive India Map:** Hover over any state on a custom SVG map to see quick facts, and click to explore destinations.
- **Dynamic Content Discovery:** Explore curated lists of popular destinations across all 36 states and union territories.
- **Categorized Hubs:** Discover places categorized under **Heritage, Nature, Adventure, Religious, Beach, and Wildlife**.
- **Smart Autocomplete Search:** Fast, server-driven autocomplete search for states and destinations.
- **Staggered Scroll Animations:** Sleek scroll-triggered entrance reveals, numerical stat counters, and hover micro-interactions.
- **Cinematic Photo Gallery:** A category-filtered gallery with a masonry layout and built-in lightbox.
- **Robust Admin Portal:** A secure, password-protected admin dashboard featuring full CRUD capability for states, destinations, and gallery images.
- **Secure Authentication:** User registration and admin login powered by `bcryptjs` and session-based database storage.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | HTML5 + EJS Templates | Dynamic page structure and server-rendered HTML views |
| **Styling** | Vanilla CSS3 | Custom typography, glassmorphic card designs, animations |
| **Interactivity** | Vanilla JavaScript | Client-side map hovers, scroll reveal observers, API fetching |
| **Backend** | Node.js + Express.js | Robust routing, session handling, API endpoints, and controllers |
| **Database** | PostgreSQL | Relational storage for users, states, destinations, and gallery |
| **Session Store** | `connect-pg-simple` | PostgreSQL-backed persistent session storage |
| **Security** | `bcryptjs` | Salted password hashing for authentication |

---

## 📁 Project Structure

```
TravelBharat/
├── db/                              # Database logic and migrations
│   ├── index.js                     # PostgreSQL Pool connection pool
│   ├── schema.sql                   # Database table definitions
│   ├── seed.sql                     # Core states & initial seed data
│   ├── seed-extra.sql               # Additional destinations & gallery images
│   ├── seed.js                      # Main execution script to rebuild DB
│   └── fix-admin.js                 # Script to reset/create admin credentials
├── public/                          # Static assets served by Express
│   ├── css/
│   │   └── styles.css               # Core styling and animation rules
│   ├── img/
│   │   └── india-map.svg            # Custom interactive SVG of India
│   └── js/                          # Client-side dynamic functions
├── views/                           # EJS Server-Side templates
│   ├── pages/                       # Screen views (splash, home, states, admin, etc.)
│   └── partials/                    # Modular components (navbar, admin-nav, footer)
├── .env                             # Environment configuration variables
├── package.json                     # Node script commands and dependencies
├── server.js                        # Express app entry point
└── README.md                        # Project documentation
```

---

## 🚀 Local Installation & Setup

Follow these steps to run the application locally:

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (running locally or a cloud database e.g., Neon.tech)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd TravelBharat
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
1. Create a database in PostgreSQL named `travelbharat`:
   ```sql
   CREATE DATABASE travelbharat;
   ```
2. Create a `.env` file in the root directory and add the following parameters (adjust username/password/host as needed):
   ```env
   PORT=80
   DATABASE_URL=postgresql://postgres:your_password@127.0.0.1:5432/travelbharat
   SESSION_SECRET=your_secure_session_secret_key
   ```

### 5. Seed the Database
Run the seed script to compile the schema, truncate tables, and load all 36 states, 90+ tourist destinations, and photo assets:
```bash
npm run seed
```

### 6. Create Admin Account
Initialize the admin user with default credentials:
```bash
node db/fix-admin.js
```
- **Default Username:** `admin`
- **Default Password:** `bharat123`
*(Note: You can update credentials or add entries directly in the database or dashboard)*

### 7. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost](http://localhost) in your browser.

---

## 🎨 Design System & Aesthetics

- **Curated Color Palette:** Sleek dark-mode background (`#0a0a1a`), golden highlights (`#FFD700`), teal highlights (`#20E3B2`), and soft orange accents.
- **Glassmorphism Design:** Cards and overlays utilize modern `backdrop-filter: blur(20px)` styling with translucent white borders.
- **Tailored Typography:** Uses modern Google Fonts: **Outfit** for clear headings and **Inter** for responsive body copy.
- **Responsive Layout:** Grid systems wrap seamlessly onto tablet and mobile configurations.

---

## 🌐 Production Deployment

### 1. Render / Railway / Heroku
To deploy this application to cloud hosting:
1. Push your local repository to a remote GitHub repository.
2. Create a new service on your cloud provider pointing to the repository.
3. Add a PostgreSQL addon or link an external PostgreSQL database.
4. Set the environment variables in your deployment dashboard:
   - `DATABASE_URL` (your production database connection string)
   - `SESSION_SECRET` (a strong random string)
   - `PORT` (usually provided automatically by the platform)
5. Set the start script to `npm start`.

### 2. SSL/Secure Cookie Configuration
When deploying in a production environment, ensure the session cookie is secure. The Express app is pre-configured to automatically set `cookie.secure = true` if `NODE_ENV === 'production'`. Make sure to set `NODE_ENV=production` in your server environment variables.
