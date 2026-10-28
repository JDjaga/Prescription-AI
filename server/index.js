// ==================================================================
// TOP-LEVEL ERROR HANDLERS
// ==================================================================
process.on('unhandledRejection', (reason, promise) => {
  // Log but DO NOT crash: transient errors (e.g. brief MongoDB connectivity
  // blips) surface as unhandled rejections, and the driver reconnects on its
  // own. A production server must ride these out instead of exiting.
  console.error('UNHANDLED_REJECTION (server kept alive):', reason);
});
process.on('uncaughtException', (err, origin) => {
  console.error(`CRITICAL_CRASH: Uncaught Exception: ${err}\n` + `Exception origin: ${origin}`);
  process.exit(1);
});

// ==================================================================
// IMPORTS & BASIC CONFIG
// ==================================================================
console.log('LOG: Loading dependencies...');
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ai = require('./ai');


const app = express();
const PORT = process.env.PORT || 5001;
// Overridable via env; defaults to the current recommended Flash model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// --- CORS CONFIGURATION ---
// By default (no ALLOWED_ORIGIN set) all origins are allowed.
// In production, set ALLOWED_ORIGIN to a comma-separated whitelist, e.g.
// ALLOWED_ORIGIN=https://medask.example.com,https://www.medask.example.com
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim()) : true,
}));

// --- HEALTH CHECK (for uptime monitoring / load balancers) ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- BODY PARSER MIDDLEWARE (MUST BE BEFORE ROUTES) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ENVIRONMENT VARIABLE CHECK ---
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error('FATAL CONFIG ERROR: Missing required environment variables:', missingVars);
  app.use((req, res, next) => {
    res.status(500).json({ success: false, message: `Server misconfigured. Missing env vars: ${missingVars.join(', ')}` });
  });
  app.listen(PORT, () => {
    console.log(`LOG: MedaskAI Backend running in ERROR MODE on port ${PORT}`);
  });
  // Exit here to prevent further execution
  process.exit(1);
}

// ==================================================================
// ASYNC STARTUP FUNCTION
// ==================================================================
async function startServer() {
  try {
    // 1. CONNECT TO DATABASE FIRST (with retries — Atlas connectivity can be flaky)
    console.log('LOG: Attempting to connect to MongoDB...');
    const MONGO_OPTS = { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 };
    const connectWithRetry = async (attempt = 1) => {
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medaskai', MONGO_OPTS);
        console.log('✅ MongoDB connection established successfully.');
      } catch (err) {
        if (attempt >= 5) {
          // Do NOT exit — the background retry loop below keeps trying, and the
          // server stays up serving whatever doesn't need the database.
          console.error(`⚠️ MongoDB still unreachable after ${attempt} attempts — will keep retrying in the background.`);
          console.error(`   Common cause: this IP is not in the Atlas Network Access list (${err.message.split('\n')[0]})`);
          return;
        }
        const delay = Math.min(1000 * 2 ** attempt, 15000);
        console.warn(`⚠️ MongoDB connect failed (attempt ${attempt}/5): ${err.message}. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return connectWithRetry(attempt + 1);
      }
    };
    connectWithRetry();

    // Ride out transient disconnects — the driver auto-reconnects.
    mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected — driver will auto-reconnect...'));
    mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected.'));

    // Background reconnect loop: if the initial connect (or a later drop)
    // persists, keep retrying forever instead of exiting. The server stays up
    // and serves whatever it can; /api/health reports the DB state.
    setInterval(() => {
      if (mongoose.connection.readyState !== 1) {
        mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
          .then(() => console.log('✅ MongoDB reconnected via background loop.'))
          .catch(err => console.warn(`⚠️ Background MongoDB retry failed: ${err.message.split('\n')[0]}`));
      }
    }, 30000);

    // 2. INITIALIZE SERVICES (AFTER DB)
    console.log('LOG: Initializing Google Gemini AI client...');
    let genAI;
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set.');
      }
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('LOG: Google Gemini AI client initialized successfully.');
    } catch (err) {
      console.error('CRITICAL: Failed to initialize Gemini AI client. AI features will be unavailable.', err);
      genAI = null;
    }

    // 3. CONFIGURE MIDDLEWARE
    console.log('LOG: Configuring middleware...');

    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    console.log('LOG: Middleware configured.');




    // 4. LOAD & MOUNT ROUTES (AFTER DB & SERVICES)
    console.log('LOG: Loading and mounting API routes...');
    const createRemedyRoutes = require('./remedyRoutes');
    const journalRoutes = require('./journalRoutes');
    app.use('/api', createRemedyRoutes(genAI));
    app.use('/api/remedies', createRemedyRoutes(genAI));
    app.use('/api/journal', journalRoutes);
    console.log('LOG: API routes mounted.');

    // --- Other Routes ---
    let analysisStore = {};
    
    const handleUpload = upload.single('image');

    app.post('/api/prescriptions/upload', (req, res, next) => {
  console.log(`[UPLOAD] Request received for /api/prescriptions/upload at ${new Date().toISOString()}`);
  handleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.error('[MULTER ERROR] A Multer error occurred:', err);
          return res.status(500).json({ success: false, message: `File upload error: ${err.message}` });
        } else if (err) {
          console.error('[UNKNOWN UPLOAD ERROR] An unknown error occurred:', err);
          return res.status(500).json({ success: false, message: 'An unknown file upload error occurred.' });
        }
        next();
      });
    }, async (req, res) => {
      console.log('[UPLOAD] Route hit after successful upload.');
      try {
        if (!req.file) {
          console.error('[UPLOAD] Logic error: Multer succeeded but req.file is missing.');
          return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        let prescriptionText;
        try {
          console.log('[OCR] Extracting prescription text via multimodal AI...');
          const ocrPrompt = 'Extract ALL text from this prescription image verbatim (medicine names, dosages, frequencies, doctor and patient details). Return ONLY the extracted text with no commentary. If there is no readable prescription text, return exactly: NO_TEXT_FOUND';
          const ocrResult = await ai.generateFromImage(req.file.buffer, req.file.mimetype, ocrPrompt, { timeoutMs: 30000 });
          const ocrText = ocrResult.text;
          prescriptionText = ocrText === 'NO_TEXT_FOUND' ? '' : ocrText;
          console.log(`[OCR] Text extracted successfully via ${ocrResult.provider}.`);
        } catch (ocrError) {
          console.error('[OCR ERROR] Gemini multimodal extraction failed:', ocrError);
          return res.status(500).json({
            success: false,
            message: 'Text extraction from the image failed. Please try a clearer image.',
            error: ocrError.message
          });
        }

        if (!prescriptionText) {
          return res.status(400).json({ success: false, message: 'No text found in image.' });
        }

        const analysisPrompt = `
    Analyze the following prescription text extracted by OCR. Your task is to act as a medical information AI and return a well-structured JSON object. Do not include any explanatory text or markdown formatting around the JSON.

    The JSON object must have the following structure:
    {
      "summary": "A brief, one-to-two sentence summary of the prescription's purpose. For example: 'This prescription is for managing hypertension and high cholesterol.'",
      "medicines": [
        {
          "name": "The full name of the medication.",
          "type": "The class or type of medication (e.g., 'Beta-blocker', 'Statin').",
          "description": "A concise, easy-to-understand explanation of what the medication does.",
          "dosage": "The prescribed dosage (e.g., '50mg', '1 tablet').",
          "frequency": "How often the medication should be taken (e.g., 'Once daily', 'Twice daily with meals').",
          "sideEffects": ["A list of 3-5 common potential side effects.", "List each as a separate string."],
          "warnings": ["A list of 2-3 important warnings or contraindications.", "List each as a separate string."],
          "interactions": ["A list of 2-3 notable drug or food interactions.", "List each as a separate string."]
        }
      ],
      "overallRiskLevel": "Assess the overall potential for interactions and side effects from the combination of medicines. Categorize as 'Low', 'Moderate', or 'High'.",
      "recommendations": [
        "Provide 3-5 key recommendations for the patient. These should be actionable and easy to understand.",
        "Examples: 'Always take this medication with food to reduce stomach upset.' or 'Avoid grapefruit juice while taking this medication.'",
        "List each recommendation as a separate string."
      ]
    }

    Here is the prescription text to analyze:
    ---
    ${prescriptionText}
    ---
    `;
        
        let aiResponse, codeBlockMatch, jsonString, analysis;
        try {
          const aiGen = await ai.generateText(analysisPrompt, { timeoutMs: 30000 });
          aiResponse = aiGen.text;
          console.log(`[UPLOAD] AI (${aiGen.provider}) raw response:`, aiResponse.substring(0, 400));
          
          codeBlockMatch = aiResponse.match(/```(?:json)?([\s\S]*?)```/i);
          jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : aiResponse.trim();
          analysis = JSON.parse(jsonString);
          analysis.fileName = req.file.originalname;
          analysis.uploadDate = new Date().toISOString();
        } catch (err) {
          console.error('[UPLOAD] AI analysis or JSON parsing failed:', err);
          return res.status(500).json({ success: false, message: 'AI response is not valid JSON or the AI service failed', error: err.message });
        }

        const analysisId = `analysis_${Date.now()}`;
        analysisStore[analysisId] = analysis;

        res.json({ success: true, analysisId, analysis });

      } catch (error) {
        console.error('[UPLOAD] FULL ERROR STACK:', error);
        res.status(500).json({ success: false, message: 'Error processing prescription', error: error.stack || error.message });
      }
    });

    app.get('/api/analysis/:prescriptionId', async (req, res) => {
      const prescription = analysisStore[req.params.prescriptionId];
      if (!prescription) {
        return res.status(404).json({ success: false, message: 'Prescription not found' });
      }
      res.json({ success: true, analysis: prescription });
    });

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ success: true, message: 'Backend healthy' });
    });

    // --- LOGGING TEST ROUTE ---
    app.get('/api/logtest', (req, res) => {
      console.log('[LOGTEST] This is a test log from /api/logtest at', new Date().toISOString());
      res.json({ success: true, message: 'Log test route hit!' });
    });

    // --- FALLBACK 404 HANDLER ---
    app.use((req, res, next) => {
      res.status(404).json({ success: false, message: 'API route not found' });
    });

    // --- GLOBAL ERROR HANDLER ---
    app.use((err, req, res, next) => {
      console.error('GLOBAL ERROR HANDLER:', err);
      res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    });

    // 5. START LISTENING
    app.listen(PORT, () => {
      console.log(`LOG: MedaskAI Backend Server is running and listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('CRITICAL_STARTUP_FAILURE:', error);
    process.exit(1);
  }
}

// ==================================================================
// LOGTEST ROUTE FOR CLOUD RUN HEALTH AND DEBUGGING
// ==================================================================
app.get('/api/logtest', (req, res) => {
  console.log('[LOGTEST] /api/logtest route hit');
  res.json({ success: true, message: 'Logtest route working' });
});

// ==================================================================
// EXECUTE STARTUP
// ==================================================================
startServer();
