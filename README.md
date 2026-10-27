# 🧠 PrescriptionAI — Intelligent Medical Document Analysis Platform

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

## � Quick Start

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

Open your browser and navigate to `http://localhost:5173`

---

## � Project Structure

```
Prescription-AI/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utility functions
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts
├── server/                  # Node.js backend
│   ├── index.js             # Main server file
│   ├── remedyRoutes.js      # Remedy API routes
│   ├── journalRoutes.js     # Journal API routes
│   ├── package.json
│   └── .env.example         # Environment variables template
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
