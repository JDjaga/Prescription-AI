// Script to ingest a remedies dataset into MongoDB
// Usage: node scripts/ingest_remedies.js <path_to_json>
const mongoose = require('mongoose');
const fs = require('fs');
const Remedy = require('../models/Remedy');

if (process.argv.length < 3) {
  console.error('Usage: node ingest_remedies.js <path_to_json>');
  process.exit(1);
}

const remediesFile = process.argv[2];
const remediesData = JSON.parse(fs.readFileSync(remediesFile, 'utf-8'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medaskai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected. Ingesting remedies...');
  try {
    // Remove old remedies
    await Remedy.deleteMany({});
    // Insert new remedies
    await Remedy.insertMany(remediesData);
    console.log(`Inserted ${remediesData.length} remedies.`);
    process.exit(0);
  } catch (err) {
    console.error('Ingestion error:', err);
    process.exit(1);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
