const mongoose = require('mongoose');

const RemedySchema = new mongoose.Schema({
  // --- Schema fields (used by the frontend) ---
  name: String,
  category: String,
  description: String,
  benefits: [String],
  usageInstructions: String,
  potentialRisks: [String],
  scientificEvidence: String,
  effectivenessScore: Number,
  userRating: Number,
  imageUrl: String,
  relatedConditions: [String],
  sources: [{ title: String, url: String }],
  vectorEmbedding: [Number], // For vector search
  // --- Legacy fields (used by the search strategies + AI summary in remedyRoutes.js) ---
  ailment: String,
  remedy: String,
  ingredients: [String],
  preparation: String,
  dosage: String,
  source: String,
});

module.exports = mongoose.model('Remedy', RemedySchema);
