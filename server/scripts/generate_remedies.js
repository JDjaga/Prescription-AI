// Generates a remedies dataset with Gemini and saves it to scripts/remedies.json
// Usage: node scripts/generate_remedies.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// topic, ailment
const TOPICS = [
  ['Digestive Health', ['nausea', 'indigestion', 'bloating', 'constipation', 'heartburn', 'motion sickness', 'loss of appetite']],
  ['Pain & Inflammation', ['headache', 'migraine', 'muscle pain', 'joint pain', 'back pain', 'menstrual cramps', 'toothache']],
  ['Respiratory Health', ['cough', 'common cold', 'sinus congestion', 'sore throat', 'wheezing', 'chest congestion', 'seasonal allergies']],
  ['Sleep & Stress', ['insomnia', 'anxiety', 'stress', 'restlessness', 'mental fatigue', 'tension', 'poor sleep quality']],
  ['Skin & Hair', ['acne', 'eczema', 'dry skin', 'dandruff', 'hair fall', 'sunburn', 'wounds']],
  ['Immunity & Energy', ['low immunity', 'fatigue', 'weakness', 'brain fog', 'poor concentration', 'recovery from illness', 'general wellness']],
  ['Cholesterol & Blood Sugar', ['high cholesterol', 'high blood sugar', 'insulin resistance', 'blood pressure', 'sugar cravings', 'fluid retention', 'weight management']],
  ['Women’s Health', ['PMS', 'menopause symptoms', 'morning sickness', 'urinary tract infection', 'heavy periods', 'iron deficiency', 'breast tenderness']],
];

const BATCH_SIZE = 4; // topics per API call
const RETRIES = 2;

function buildPrompt(topics) {
  const topicLines = topics.map(([cat, ailments]) => `- ${cat}: ${ailments.join(', ')}`).join('\n');
  return `You are a medical-content data author. For EACH ailment listed below, create ONE natural-remedy entry.
Return ONLY a valid JSON array — no markdown fences, no commentary.

Rules:
- "ailment" must be exactly the ailment string given above.
- "remedy" and "name": a short remedy title (e.g. "Peppermint Oil for Nausea").
- "ingredients": 2-4 real ingredients with rough amounts.
- "preparation": 1-2 sentence preparation method.
- "dosage": typical usage amount and frequency.
- "benefits": 2-4 short benefit strings.
- "usageInstructions": 1-2 sentences on how/when to use it.
- "potentialRisks": 1-3 honest risk/side-effect strings (write "Generally well tolerated when used as directed" only if truly accurate).
- "scientificEvidence": one sentence stating the evidence level honestly, e.g. "Moderate evidence from randomized trials", "Limited clinical evidence; widely used in traditional medicine", or "Well-established mechanism, commonly recommended by clinicians".
- "effectivenessScore": 1-5 (be conservative; only score 5 if strong clinical evidence).
- "userRating": 3.5-4.9 (simulated community rating).
- "category": the category from the list above.
- "relatedConditions": [the ailment] plus 1-2 closely related conditions.
- "sources": [] (leave empty — do not invent URLs).
- "imageUrl": "" (leave empty).
- "source": same as "preparation" (legacy field).
- Every entry must have ALL of these keys.

Ailments by category:
${topicLines}`;
}

(async () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });
  const all = [];

  for (let i = 0; i < TOPICS.length; i += BATCH_SIZE) {
    const batch = TOPICS.slice(i, i + BATCH_SIZE);
    const labels = batch.map(([c, a]) => `${c} (${a.length})`).join(', ');
    console.log(`[GEN] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${labels}`);

    let ok = false;
    for (let attempt = 1; attempt <= RETRIES && !ok; attempt++) {
      try {
        const result = await model.generateContent(buildPrompt(batch));
        const text = result.response.text().trim();
        const jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
        const items = JSON.parse(jsonStr);
        if (!Array.isArray(items) || items.length === 0) throw new Error('empty array');
        // Normalize: make sure remedy + name exist for the legacy mapping code
        for (const it of items) {
          it.remedy = it.remedy || it.name;
          it.name = it.name || it.remedy;
          it.source = it.source || it.preparation || 'Traditional remedy';
        }
        all.push(...items);
        console.log(`[GEN]   got ${items.length} entries (total ${all.length})`);
        ok = true;
      } catch (e) {
        console.error(`[GEN]   attempt ${attempt} failed: ${e.message.substring(0, 160)}`);
      }
    }
    if (!ok) console.error(`[GEN]   SKIP batch after ${RETRIES} attempts`);
  }

  if (all.length === 0) { console.error('No entries generated.'); process.exit(1); }
  const out = path.join(__dirname, 'remedies.json');
  fs.writeFileSync(out, JSON.stringify(all, null, 2));
  console.log(`[GEN] DONE. ${all.length} entries -> ${out}`);
  process.exit(0);
})().catch(e => { console.error('FATAL:', e); process.exit(1); });
