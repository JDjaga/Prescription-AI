// Ensures the Mongo text index used by remedy search exists.
// Usage: node -r dotenv/config scripts/ensure_search_index.js
const mongoose = require('mongoose');
require('dotenv').config();
const Remedy = require('../models/Remedy');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Creating text index on searchable fields...');
  try {
    await Remedy.createIndex(
      {
        ailment: 'text', remedy: 'text', name: 'text',
        ingredients: 'text', preparation: 'text',
        category: 'text', description: 'text', relatedConditions: 'text'
      },
      { name: 'remedy_text_index', weights: { ailment: 10, remedy: 8, name: 8, relatedConditions: 5, ingredients: 3, preparation: 2, category: 2, description: 1 } }
    );
    console.log('Text index ready.');
  } catch (e) {
    console.error('Index creation failed:', e.message);
  }
  const n = await Remedy.countDocuments();
  console.log('Remedy documents in DB:', n);
  await mongoose.disconnect();
})();
