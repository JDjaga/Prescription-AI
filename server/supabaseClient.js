const { createClient } = require('@supabase/supabase-js');

// In production, env variables are injected by the cloud provider.
// dotenv is only needed for local development and is called in index.js.

let supabase = null; // Default to null to prevent crashes

console.log('LOG: Attempting to initialize Supabase client...');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not set. Supabase features will be disabled.');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('LOG: Supabase client initialized successfully.');
  } catch (error) {
    // This will catch any unexpected errors during client creation
    console.error('CRITICAL: Supabase client creation failed catastrophically.', error);
    supabase = null; // Ensure supabase is null on failure
  }
}

module.exports = supabase;
