// =============================================================================
// server/ai.js — Multi-provider AI with automatic failover
//
// Primary:   OpenRouter free tier (OPENROUTER_API_KEY) — generous rate limits
//            1st choice:  nvidia/nemotron-3.5-super-vl:free  (text + vision)
//            2nd choice:  google/gemma-4-31b-it:free         (text)
// Fallback:  Google Gemini        (GEMINI_API_KEY) — free tier is 20 req/day
//
// Every function resolves to { text, provider } so callers never crash on a
// single provider outage — the switch is transparent to the rest of the app.
// Works identically in local dev and in production (plain HTTPS calls).
// =============================================================================
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const FALLBACK_MODELS = [
  process.env.AI_FALLBACK_MODEL || 'nvidia/nemotron-3.5-super-vl:free',
  process.env.AI_FALLBACK_MODEL_2 || 'google/gemma-4-31b-it:free',
];

let genAI = null;
function geminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function callGemini(promptOrParts, timeoutMs) {
  const client = geminiClient();
  if (!client) throw new Error('GEMINI_API_KEY not configured');
  const model = client.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await withTimeout(model.generateContent(promptOrParts), timeoutMs, 'Gemini');
  const text = result.response.text().trim();
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

async function callOpenRouter(content, timeoutMs) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not configured');

  let lastError = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'X-Title': 'MedASK AI',
          },
          body: JSON.stringify({ model, messages: [{ role: 'user', content }] }),
          signal: controller.signal,
        });
        if (!resp.ok) {
          const body = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${body.substring(0, 160)}`);
        }
        const data = await resp.json();
        const text = (data.choices?.[0]?.message?.content || '').trim();
        if (!text) throw new Error('empty response');
        console.log(`[AI] OpenRouter (${model}) responded OK`);
        return text;
      } finally {
        clearTimeout(timer);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[AI] OpenRouter model ${model} failed: ${err.message}`);
    }
  }
  throw lastError || new Error('All OpenRouter fallback models failed');
}

// Plain-text generation. Returns { text, provider }.
// Order: OpenRouter free tier first (generous limits), Gemini as fallback.
async function generateText(prompt, { timeoutMs = 25000 } = {}) {
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const text = await callOpenRouter(prompt, timeoutMs);
      return { text, provider: 'openrouter' };
    } catch (err) {
      console.warn(`[AI] OpenRouter failed (${err.message}) -> trying Gemini fallback`);
    }
  }
  const text = await callGemini(prompt, timeoutMs);
  return { text, provider: 'gemini' };
}

// Image (vision) generation, e.g. prescription OCR. Returns { text, provider }.
async function generateFromImage(buffer, mimeType, prompt, { timeoutMs = 30000 } = {}) {
  const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  const content = [
    { type: 'image_url', image_url: { url: dataUrl } },
    { type: 'text', text: prompt },
  ];
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const text = await callOpenRouter(content, timeoutMs);
      return { text, provider: 'openrouter' };
    } catch (err) {
      console.warn(`[AI] OpenRouter vision failed (${err.message}) -> trying Gemini fallback`);
    }
  }
  const parts = [
    { inlineData: { mimeType: mimeType || 'image/jpeg', data: buffer.toString('base64') } },
    prompt,
  ];
  const text = await callGemini(parts, timeoutMs);
  return { text, provider: 'gemini' };
}

module.exports = { generateText, generateFromImage };
