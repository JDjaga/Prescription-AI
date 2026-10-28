# 🧠 MedASK AI (PrescriptionAI) — Intelligent Medical Document Analysis Platform

[![CI](https://github.com/JDjaga/Prescription-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/JDjaga/Prescription-AI/actions/workflows/ci.yml)

**PrescriptionAI** is a full-stack, AI-powered health platform that helps users understand prescriptions, discover natural remedies, and track their health using cutting-edge technologies like **MongoDB Atlas**, **Google Gemini AI**, and **Google Vision API**.


---

## 🌟 Features

- 🔍 **Natural Remedy Finder**
  Search 500+ public natural remedies by ailment, ingredient, or keyword using **MongoDB Atlas Search**.

- 📷 **AI Prescription Reader**
  Upload a prescription image and receive a simplified AI-generated summary using **Google Cloud Vision OCR + Gemini AI**.

- 💬 **AI Health Chat**
  Ask health questions, get remedy suggestions, and receive AI-driven explanations using Gemini Pro.

- 📓 **Personal Health Journal**
  Log symptoms, moods, medications, and notes. Data is securely stored with **Supabase** and visualized with insightful charts.

- 🔧 **Extensible Platform**
  Future-ready structure for adding nutrition, wearable integration, symptom checker, or telehealth modules.

---

## ⚙️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn-ui (UI components)
- React Router (routing)
- Recharts (data visualization)

**Backend:**
- Node.js + Express
- MongoDB Atlas (remedies database)
- Mongoose (ODM)
- Google Gemini AI (AI reasoning)
- Google Cloud Vision API (OCR)
- Supabase (authentication & journaling)
- Multer (file uploads)

---

## 🏗️ Architecture

```
[ React Frontend ]  <-->  [ Node.js/Express Backend ]  <-->  [ MongoDB Atlas ]
        |                          |                          |
        |--- Google Gemini AI -----|--- Google Vision OCR ----|
        |                          |                          |
        |                          |                          |
        |---------- Supabase (Auth + Journal) --------------|
```

---

## 📦 Prerequisites

Before running this project, you need accounts and API keys from:

1. **MongoDB Atlas** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
   - Create a free cluster
   - Get connection string (choose "Connect your application" → "Mongoose")

2. **Google Cloud Platform** - [Sign up](https://cloud.google.com/)
   - Enable Vision API
   - Create service account with Vision API permissions
   - Download JSON key file

3. **Google AI Studio** - [Sign up](https://aistudio.google.com/)
   - Get Gemini API key

4. **Supabase** - [Sign up](https://supabase.com/)
   - Create a new project
   - Get Project URL, anon key, and service_role key from [API Keys](https://supabase.com/dashboard/project/_/settings/api-keys)

---

## 🚀 Deployment & Maintenance

The app is self-hosted and running in Docker on a VPS (or Google Cloud Run — both are supported).

### One-command deploy (VPS / any Docker host)

```bash
# 1. Configure secrets
cp server/.env.example server/.env       # backend secrets (MongoDB, Gemini, Supabase)
cp .env.example .env                     # frontend build vars (Supabase keys)

# 2. Build & start both services
docker compose up -d --build

# 3. Verify
curl http://localhost:8080/api/health    # → {"status":"ok",...}
```

What `docker compose` gives you:
- **`frontend`** — nginx container on port `8080` serving the built React app, proxying `/api` to the backend (same-origin, no CORS issues)
- **`server`** — Node/Express API with a `/api/health` endpoint and a built-in healthcheck
- Both containers restart automatically (`restart: unless-stopped`)

### Day-to-day maintenance

| Task | Command |
|---|---|
| Deploy an update | `git pull && docker compose up -d --build` |
| View live logs | `docker compose logs -f` |
| Restart stack | `docker compose restart` |
| Check status | `docker compose ps` / `curl http://<host>:8080/api/health` |

Uptime is monitored externally (e.g. UptimeRobot hitting `/api/health`), so failures are noticed within minutes, not days.

### Google Cloud Run alternative

Both Dockerfiles are Cloud Run-ready (nginx listens on `8080`, the server reads `PORT` from the environment). Build each image and deploy with `gcloud run deploy`. The Vision API uses Application Default Credentials, so it authenticates to the built-in Cloud Run service account with zero configuration.

### CI

Every push runs [GitHub Actions](.github/workflows/ci.yml): the frontend is built, and the backend is syntax-checked plus smoke-tested against the `/api/health` endpoint.

---



## 🧑‍💻 Quick Start (development)

### 1. Clone the Repository

```bash
git clone https://github.com/JDjaga/Prescription-AI.git
cd Prescription-AI
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/medaskai?retryWrites=true&w=majority

# Google AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=5001
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5001
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

Open your browser and navigate to `http://localhost:8080`

> **Alternative:** you can also run the frontend from the repo root with `npm install && npm run dev` (a root-level Vite config points at `frontend/`). Both approaches use the same source.
>
> **Note:** if port `8080` is taken (e.g. by Docker Desktop), Vite automatically uses `8081` — check the terminal output.

---

## � Project Structure

```
Prescription-AI/
├── frontend/                 # React frontend (self-contained build)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utility functions
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets (favicon, robots.txt)
│   ├── Dockerfile            # Multi-stage build → nginx
│   ├── default.conf          # nginx config (SPA + /api proxy)
│   ├── package.json
│   └── vite.config.js
├── server/                   # Node.js backend
│   ├── index.js              # Main server + /api/health
│   ├── remedyRoutes.js       # Remedy API routes
│   ├── journalRoutes.js      # Journal API routes
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example          # Environment variables template
├── docker-compose.yml        # One-command full-stack deployment
├── .github/workflows/ci.yml  # CI: build frontend, verify server
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔑 Environment Variables Reference

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `PORT` | Server port (default: 5001) | No |

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `VITE_API_BASE_URL` | Backend API URL | Yes |

---

## 🧪 How It Works

1. **Prescription Upload**: User uploads a prescription image
2. **OCR Processing**: Google Vision API extracts text from the image
3. **AI Analysis**: Gemini AI processes the text and generates a structured summary
4. **Remedy Search**: MongoDB Atlas Search queries the natural remedies database
5. **Journal Storage**: Health entries are securely stored in Supabase
6. **Results Display**: Frontend presents insights, charts, and recommendations

---

## 🔒 Privacy & Security

- All health data is processed in-memory only; not stored by AI services
- Supabase Row-Level Security (RLS) ensures users can only access their own data
- Environment variables are never committed to git
- Service role keys are only used in the backend
- No third-party tracking or sharing

---

## 🧩 Future Enhancements

- [ ] Symptom checker with AI diagnostics
- [ ] Wearable device integration
- [ ] Telehealth consultation scheduling
- [ ] Vector search for semantic remedy queries
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **MongoDB Atlas** — blazing fast search and flexible document storage
- **Google Cloud + Gemini AI** — intelligent inference + OCR
- **Supabase** — frictionless auth and DB
- **Open Health Data Community** — for public remedy knowledge
- **shadcn-ui** — beautiful, accessible UI components

---

**Built with ❤️ for healthcare clarity, empowerment, and AI innovation.**
