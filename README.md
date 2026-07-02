# CampusClaim (FoundIt)

> A lost & found board for college campuses — report lost items, find what you're looking for, and reunite belongings with their owners.

![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20Express%20%2B%20PostgreSQL-6366f1)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Report lost or found items** with photos, categories, and verification questions
- **Search & filter** by keyword, category, and item type
- **Verification flow** — claimers must answer a secret question set by the reporter
- **Email notifications** when an item is claimed
- **Image uploads** via Cloudinary
- **JWT authentication** with bcrypt password hashing
- **Auto-expiry** — items expire after 30 days

---

## Project Structure

```
campusclaim/
├── backend/
│   ├── server.js           # Express entry point
│   ├── db.js               # PostgreSQL Pool
│   ├── middleware/
│   │   └── auth.js         # JWT verification
│   ├── routes/
│   │   ├── auth.js         # /api/auth/*
│   │   ├── items.js        # /api/items/*
│   │   └── matches.js      # /api/matches/*
│   ├── services/
│   │   ├── cloudinary.js   # Image upload helper
│   │   └── email.js        # Email notifications
│   ├── schema.sql          # CREATE TABLE statements
│   ├── seed.sql            # 6 sample items
│   ├── .env.example        # Environment template
│   ├── railway.json        # Railway deploy config
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    ├── app.js
    └── vercel.json         # Vercel SPA rewrite
```

---

## Local Setup

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ running locally
- (Optional) Cloudinary account for image uploads
- (Optional) Gmail App Password or SendGrid key for email notifications

### 1. Clone & Install

```bash
cd campusclaim/backend
npm install
```

### 2. Create the Database

```bash
createdb campusclaim
psql -d campusclaim -f schema.sql
psql -d campusclaim -f seed.sql
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

At minimum, set:
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random string for signing tokens |
| `PORT` | | Server port (default: 3000) |
| `CLIENT_URL` | | Frontend origin for CORS |
| `CLOUDINARY_CLOUD_NAME` | | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | | Cloudinary API secret |
| `EMAIL_USER` | | Gmail address |
| `EMAIL_PASS` | | Gmail App Password |
| `SENDGRID_API_KEY` | | SendGrid API key (overrides Gmail) |

### 4. Start the Backend

```bash
npm start
# or for dev with auto-reload:
npm run dev
```

Server runs at `http://localhost:3000`.

### 5. Serve the Frontend

Open `frontend/index.html` with VS Code Live Server (port 5500) or any static file server.

> **Tip:** The backend CORS config allows `localhost:5500` and `127.0.0.1:5500` by default.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account → `{ token, user }` |
| POST | `/api/auth/login` | No | Sign in → `{ token, user }` |
| GET | `/api/auth/me` | JWT | Get current user |

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | No | List items (query: `type`, `category`, `q`, `status`) |
| GET | `/api/items/:id` | No | Get single item |
| POST | `/api/items` | JWT | Create item (multipart/form-data with optional `image`) |
| PATCH | `/api/items/:id/claim` | JWT | Verify answer & claim item |

### Matches

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/my` | JWT | Items claimed by current user |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server status check |

---

## Deployment

### Backend → Railway

1. Push the `backend/` folder to a GitHub repo
2. Create a new project on [Railway](https://railway.app)
3. Add a **PostgreSQL** plugin
4. Connect your GitHub repo
5. Set environment variables in the Railway dashboard:
   - `DATABASE_URL` — provided automatically by the Postgres plugin
   - `JWT_SECRET` — generate a random string
   - `CLIENT_URL` — your Vercel frontend URL
   - Cloudinary & email vars as needed
6. Railway will auto-detect `railway.json` and deploy

### Frontend → Vercel

1. Push the `frontend/` folder to a GitHub repo (or the same repo)
2. Import on [Vercel](https://vercel.com)
3. Set the root directory to `frontend/`
4. Update `API_BASE` in `app.js` to your Railway backend URL
5. Deploy — `vercel.json` handles SPA routing

---

## License

MIT
