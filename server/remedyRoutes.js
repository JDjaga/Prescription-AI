const express = require('express');
const Remedy = require('./models/Remedy');
const ai = require('./ai');

// Overridable via env; defaults to the current recommended Flash model.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Dependency Injection: Export a function that takes the initialized genAI client.
module.exports = function(genAI) {
  const router = express.Router();

  router.post('/search-and-summarize', async (req, res) => {
    const { conditions } = req.body;

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one ailment or condition to search for.' 
      });
    }

    try {
      // 1. Enhanced Atlas Search with multiple strategies
      console.log(`[RemedySearch] Searching for conditions: ${JSON.stringify(conditions)}`);
      
      let remedies = [];

      // Atlas Search (primary) — the "default" index covers the schema fields
      // plus the legacy fields (ailment/remedy/ingredients/preparation).
      try {
        const SEARCH_PATHS = ['ailment', 'remedy', 'ingredients', 'preparation', 'name', 'category', 'description', 'relatedConditions'];
        const searchQueries = conditions.map(condition => ({
          text: { query: condition, path: SEARCH_PATHS, fuzzy: { maxEdits: 1, prefixLength: 2 } }
        }));
        const wildcardQueries = conditions.map(condition => ({
          wildcard: { query: `*${condition}*`, path: ['ailment', 'remedy', 'ingredients', 'preparation', 'name'], allowAnalyzedField: true }
        }));

        remedies = await Remedy.aggregate([
          {
            $search: {
              index: 'default',
              compound: {
                should: [
                  ...searchQueries,
                  ...wildcardQueries,
                  { phrase: { query: conditions.join(' '), path: 'ailment' } }
                ],
                minimumShouldMatch: 1
              }
            }
          },
          { $addFields: { searchScore: { $meta: 'searchScore' } } },
          { $sort: { searchScore: -1 } },
          { $limit: 15 },
          {
            $project: {
              _id: 1, ailment: 1, name: '$remedy', remedy: 1, ingredients: 1,
              preparation: 1, dosage: 1, source: 1, category: 1, description: 1,
              benefits: 1, usageInstructions: 1, potentialRisks: 1,
              scientificEvidence: 1, effectivenessScore: 1, userRating: 1,
              imageUrl: 1, relatedConditions: 1, sources: 1, searchScore: 1
            }
          }
        ]);
        console.log(`[RemedySearch] Atlas Search returned ${remedies.length} remedies${remedies.length === 0 ? ' -> falling back to native text/regex search' : ''}`);
      } catch (dbError) {
        console.error('[RemedySearch] Atlas Search error (falling back):', dbError.message);
        remedies = [];
      }

      // Fallback (native Mongo text + regex). Runs when Atlas errors OR returns
      // empty — Atlas Search can silently match nothing if the index doesn't
      // cover these fields, so an empty Atlas result is treated as a miss too.
      if (remedies.length === 0) {
        try {
          const searchRegex = new RegExp(conditions.join('|'), 'i');
          remedies = await Remedy.find({
            $or: [
              { ailment: searchRegex },
              { remedy: searchRegex },
              { ingredients: { $in: [searchRegex] } },
              { preparation: searchRegex },
              { name: searchRegex },
              { category: searchRegex },
              { description: searchRegex },
              { relatedConditions: { $in: [searchRegex] } }
            ]
          }).limit(6).lean();
          // Normalise name so the AI step always has a label
          remedies = remedies.map(r => ({ ...r, name: r.name || r.remedy }));
          console.log(`[RemedySearch] Fallback search returned ${remedies.length} remedies`);
        } catch (fallbackError) {
          console.error('[RemedySearch] Fallback search also failed:', fallbackError);
          return res.status(500).json({
            success: false,
            message: 'Search service temporarily unavailable. Please try again later.'
          });
        }
      }

      if (remedies.length === 0) {
        return res.json({ 
          success: true, 
          remedies: [], 
          summary: `No natural remedies found for ${conditions.join(', ')}. Try using different or more general terms.` 
        });
      }

      // 2. Enhanced AI Processing
      if (!genAI) {
        console.log("AI client not available. Returning raw search results.");
        return res.json({ 
          success: true, 
          remedies: remedies.map(remedy => ({
            ...remedy,
            name: remedy.name || remedy.remedy,
            description: remedy.preparation || 'No description available',
            benefits: remedy.ingredients ? [`Contains: ${remedy.ingredients.join(', ')}`] : [],
            usageInstructions: remedy.dosage || 'Follow preparation instructions',
            potentialRisks: ['Consult healthcare provider before use'],
            scientificEvidence: remedy.source || 'Traditional remedy'
          })), 
          summary: `Found ${remedies.length} remedies for ${conditions.join(', ')}.` 
        });
      }

      const model = genAI ? genAI.getGenerativeModel({ model: GEMINI_MODEL }) : null;
      const processedRemedies = [];

      // Bounded AI call: never let a single slow generation hang the request.
      const withTimeout = (promise, ms, label) => Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
        )
      ]);

      const MAX_AI_REMEDIES = 3; // Only enrich the top N remedies with AI to stay fast.
      const toEnrich = remedies.slice(0, MAX_AI_REMEDIES);

      const enrichmentResults = await Promise.all(toEnrich.map(async (remedy) => {
        try {
          const remedyName = remedy.name || remedy.remedy;
          const ailment = remedy.ailment;
          const ingredients = Array.isArray(remedy.ingredients) 
            ? remedy.ingredients.join(', ') 
            : remedy.ingredients || 'Not specified';
          const preparation = remedy.preparation || 'Not specified';
          const dosage = remedy.dosage || 'Not specified';
          const source = remedy.source || 'Traditional remedy';

          const detailPrompt = `You are a medical information assistant. Based on this natural remedy data, provide a structured, patient-friendly response in JSON format.

Remedy: "${remedyName}"
Ailment: "${ailment}"
Ingredients: ${ingredients}
Preparation: ${preparation}
Dosage: ${dosage}
Source: ${source}

Please generate a comprehensive but concise JSON response. Focus on accuracy and safety. The response MUST be valid JSON only, no markdown formatting.

{
  "description": "Clear, 1-2 sentence description of what this remedy is and how it works",
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "usageInstructions": "Step-by-step instructions combining preparation and dosage",
  "potentialRisks": ["Risk 1", "Risk 2"],
  "scientificEvidence": "Brief summary of scientific support or traditional use"
}`;

          const aiGen = await withTimeout(ai.generateText(detailPrompt, { timeoutMs: 20000 }), 25000, `Remedy AI (${remedyName})`);
          const aiResponseText = aiGen.text;
          
          // Clean and parse AI response
          const cleanedJson = aiResponseText
            .replace(/```json|```/g, '')
            .replace(/^[^{]*/, '')
            .replace(/[^}]*$/, '')
            .trim();
          
          let aiDetails;
          try {
            aiDetails = JSON.parse(cleanedJson);
          } catch (parseError) {
            console.warn(`JSON parse failed for remedy "${remedyName}". Using fallback.`);
            aiDetails = {
              description: `Natural remedy using ${ingredients}`,
              benefits: [`May help with ${ailment}`],
              usageInstructions: `${preparation}. ${dosage}`,
              potentialRisks: ['Consult healthcare provider before use'],
              scientificEvidence: source
            };
          }

          return {
            ...remedy,
            name: remedyName,
            ...aiDetails,
            // Preserve original fields
            originalData: {
              ailment: remedy.ailment,
              ingredients: remedy.ingredients,
              preparation: remedy.preparation,
              dosage: remedy.dosage,
              source: remedy.source
            },
            aiEnhanced: true
          };

        } catch (err) {
          console.error(`AI processing failed for remedy "${remedy.name || remedy.remedy}":`, err);
          
          // Fallback processing without AI
          const remedyName = remedy.name || remedy.remedy;
          return {
            ...remedy,
            name: remedyName,
            description: remedy.preparation || `Natural remedy for ${remedy.ailment}`,
            benefits: remedy.ingredients ? [`Contains: ${remedy.ingredients.join(', ')}`] : [],
            usageInstructions: `${remedy.preparation || 'Prepare as directed'}. ${remedy.dosage || 'Use as needed'}`,
            potentialRisks: ['Consult healthcare provider before use'],
            scientificEvidence: remedy.source || 'Traditional remedy',
            originalData: {
              ailment: remedy.ailment,
              ingredients: remedy.ingredients,
              preparation: remedy.preparation,
              dosage: remedy.dosage,
              source: remedy.source
            },
            aiEnhanced: false
          };
        }
      }));

      // AI-enriched remedies first, then the remaining search results as-is.
      const enriched = enrichmentResults.filter(Boolean);
      const remainder = remedies.slice(MAX_AI_REMEDIES).map((remedy) => ({
        ...remedy,
        name: remedy.name || remedy.remedy,
        description: remedy.preparation || `Natural remedy for ${remedy.ailment}`,
        benefits: remedy.ingredients ? [`Contains: ${remedy.ingredients.join(', ')}`] : [],
        usageInstructions: `${remedy.preparation || 'Prepare as directed'}. ${remedy.dosage || 'Use as needed'}`,
        potentialRisks: ['Consult healthcare provider before use'],
        scientificEvidence: remedy.source || 'Traditional remedy',
        aiEnhanced: false
      }));
      processedRemedies.push(...enriched, ...remainder);

      // 3. Generate overall summary
      let generalSummary = `Found ${processedRemedies.length} potential natural remedies for ${conditions.join(', ')}.`;
      
      if (processedRemedies.length > 0) {
        try {
          const topRemedies = processedRemedies.slice(0, 5).map(r => r.name).join(', ');
          const overallSummaryPrompt = `Based on these natural remedies for "${conditions.join(', ')}": ${topRemedies}. 

Write a brief, professional 2-3 sentence summary that:
1. Acknowledges the search results
2. Mentions they are traditional/natural approaches
3. Emphasizes consulting healthcare providers

Keep it helpful but appropriately cautious.`;

          const summaryGen = await withTimeout(ai.generateText(overallSummaryPrompt, { timeoutMs: 20000 }), 25000, 'Overall summary AI');
          generalSummary = summaryGen.text;
        } catch (err) {
          console.error('Error generating AI summary:', err);
          generalSummary = `Found ${processedRemedies.length} traditional remedies for ${conditions.join(', ')}. Please consult with a healthcare provider before trying any new remedies.`;
        }
      }

      res.json({ 
        success: true, 
        remedies: processedRemedies, 
        summary: generalSummary,
        searchInfo: {
          searchTerms: conditions,
          totalResults: processedRemedies.length,
          searchMethod: 'Atlas Search with AI Enhancement'
        }
      });

    } catch (error) {
      console.error('Error in /search-and-summarize route:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching for remedies.', 
        error: error.message 
      });
    }
  });

  // POST /chat - Gemini AI chat endpoint (unchanged)
  router.post('/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }
      const chatSystem = 'You are MedASK AI, a helpful assistant for medications, prescriptions and natural remedies. Be concise. For anything beyond general information, advise consulting a healthcare professional.';
      const aiGen = await ai.generateText(`${chatSystem}\n\nUser message: ${message}`, { timeoutMs: 25000 });
      res.json({ success: true, reply: aiGen.text });
    } catch (error) {
      console.error('Error in /chat:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Updated seed route with your JSON structure
  router.get('/seed', async (req, res) => {
    try {
      const existingRemedies = await Remedy.countDocuments();
      if (existingRemedies > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'Database already contains remedy data. Seed operation aborted.' 
        });
      }

      const seedRemedies = [
        {
          ailment: "Eye Strain",
          remedy: "Warm Tea Bag Compress",
          ingredients: ["Chamomile tea bags", "Warm water"],
          preparation: "Steep tea bags in hot water for 3-5 minutes, then cool slightly.",
          dosage: "Place over closed eyes for 10 minutes.",
          source: "American Academy of Ophthalmology"
        },
        {
          ailment: "Headache",
          remedy: "Peppermint Oil Application",
          ingredients: ["Peppermint essential oil", "Carrier oil (coconut or jojoba)"],
          preparation: "Dilute 2-3 drops of peppermint oil with 1 tablespoon of carrier oil.",
          dosage: "Apply small amount to temples and forehead. Avoid eye area.",
          source: "National Center for Complementary and Integrative Health"
        },
        {
          ailment: "Insomnia",
          remedy: "Chamomile Tea",
          ingredients: ["Chamomile tea bags or dried chamomile flowers", "Hot water"],
          preparation: "Steep chamomile in hot water for 5-10 minutes.",
          dosage: "Drink 1 cup 30-60 minutes before bedtime.",
          source: "Sleep Foundation"
        },
        {
          ailment: "Sore Throat",
          remedy: "Warm Salt Water Gargle",
          ingredients: ["Salt", "Warm water"],
          preparation: "Mix 1/2 teaspoon salt in 1 cup of warm water.",
          dosage: "Gargle for 30 seconds, then spit out. Repeat 2-3 times daily.",
          source: "Mayo Clinic"
        },
        {
          ailment: "Nausea",
          remedy: "Ginger Tea",
          ingredients: ["Fresh ginger root or ginger tea bags", "Hot water", "Honey (optional)"],
          preparation: "Steep fresh ginger slices or tea bag in hot water for 5-10 minutes.",
          dosage: "Drink 1-2 cups daily as needed.",
          source: "National Institutes of Health"
        }
      ];

      await Remedy.insertMany(seedRemedies);
      res.json({ 
        success: true, 
        message: `Successfully seeded the database with ${seedRemedies.length} remedies using the correct JSON structure.` 
      });

    } catch (error) {
      console.error('Error in /seed route:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while seeding the database.', 
        error: error.message 
      });
    }
  });

  // --- DIAGNOSTIC ROUTE TO FIND ROOT CAUSE ---
  router.get('/diagnose', async (req, res) => {
    const diagnostics = {};
    try {
      // 1. Check DB connection and document count
      diagnostics.connection = 'Attempting to connect...';
      const remedyCount = await Remedy.countDocuments();
      diagnostics.connection = 'Success';
      diagnostics.remedyCount = remedyCount;

      if (remedyCount > 0) {
        const sampleRemedy = await Remedy.findOne().lean();
        diagnostics.sampleRemedy = sampleRemedy;
      } else {
        diagnostics.sampleRemedy = 'Collection is empty, cannot fetch a sample.';
      }

      // 2. Test basic Atlas Search
      diagnostics.atlasSearch = 'Attempting basic search...';
      const testQuery = 'tea'; // A simple, common term
      const searchResult = await Remedy.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: testQuery,
              path: { wildcard: '*' }
            }
          }
        },
        { $limit: 1 }
      ]);
      
      if (searchResult.length > 0) {
        diagnostics.atlasSearch = `Success: Found at least one result for the basic query '${testQuery}'.`;
        diagnostics.atlasSearchResult = searchResult[0];
      } else {
        diagnostics.atlasSearch = `Failure: Basic search for '${testQuery}' returned 0 results. This strongly suggests the Atlas Search Index is misconfigured, not built, or the data does not contain the term.`;
      }

      res.json({ success: true, diagnostics });

    } catch (error) {
      console.error('[Diagnose] Error:', error);
      diagnostics.error = error.message;
      res.status(500).json({ success: false, diagnostics });
    }
  });

  return router;
};