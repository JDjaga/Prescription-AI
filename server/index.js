// ==================================================================
// TOP-LEVEL ERROR HANDLERS
// ==================================================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL_CRASH: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
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
const vision = require('@google-cloud/vision');


const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS CONFIGURATION ---
app.use(cors()); // WARNING: Allow all origins for debugging purposes.

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
    // 1. CONNECT TO DATABASE FIRST
    console.log('LOG: Attempting to connect to MongoDB...');
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medaskai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('✅ MongoDB connection established successfully.');
    })
    .catch(err => {
      console.error('❌ FATAL ERROR: Could not connect to MongoDB.');
      console.error(err);
      process.exit(1); // Exit the process with an error code
    });

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
          console.log('[VISION] Initializing Vision client...');
          const visionClient = new vision.ImageAnnotatorClient();
          console.log('[VISION] Vision client initialized. Performing text detection...');
          const { buffer } = req.file;
          const [visionResult] = await visionClient.textDetection(buffer);
          console.log('[VISION] Text detection complete.');
          const detections = visionResult.textAnnotations;
          if (detections && detections.length > 0) {
            prescriptionText = detections[0].description;
            console.log('[VISION] Text extracted successfully.');
          } else {
            prescriptionText = '';
            console.log('[VISION] No text found in image.');
          }
        } catch (visionError) {
          console.error('[VISION API ERROR] Failed during Vision API processing:', visionError);
          return res.status(500).json({ 
            success: false, 
            message: 'Google Vision API failed. Please check service account permissions and ensure the API is enabled.', 
            error: visionError.message 
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
        
        let aiResult, aiResponse, codeBlockMatch, jsonString, analysis;
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          aiResult = await model.generateContent(analysisPrompt);
          const response = aiResult.response;

          console.log('[UPLOAD] Full Gemini Response:', JSON.stringify(response, null, 2));

          if (!response || typeof response.text !== 'function') {
            const blockReason = response?.promptFeedback?.blockReason || 'Invalid response structure';
            console.error('[UPLOAD] Gemini AI content blocked or invalid. Reason:', blockReason);
            return res.status(500).json({ success: false, message: 'AI content generation failed or was blocked.', reason: blockReason });
          }
          
          aiResponse = response.text();
          console.log('[UPLOAD] Gemini AI raw response:', aiResponse.substring(0, 400));
          
          codeBlockMatch = aiResponse.match(/```(?:json)?([\s\S]*?)```/i);
          jsonString = codeBlockMatch ? codeBlockMatch[1].trim() : aiResponse.trim();
          analysis = JSON.parse(jsonString);
          analysis.fileName = req.file.originalname;
          analysis.uploadDate = new Date().toISOString();
        } catch (err) {
          console.error('[UPLOAD] Gemini AI or JSON parsing failed:', err);
          return res.status(500).json({ success: false, message: 'AI response is not valid JSON or Gemini failed', error: err.message });
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
