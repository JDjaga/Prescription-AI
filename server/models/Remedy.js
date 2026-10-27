const mongoose = require('mongoose');

const RemedySchema = new mongoose.Schema({
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
  vectorEmbedding: [Number] // For vector search
});

module.exports = mongoose.model('Remedy', RemedySchema);
