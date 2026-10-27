const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');


// POST /api/journal/add
router.post('/add', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database service is unavailable.' });
  }
  let responded = false;
  try {
    console.log('[POST] /api/journal/add - body:', req.body);
    let { user_id, date, mood, symptoms, medications, notes } = req.body;
    if (!user_id || !date || !mood) {
      console.warn('Missing required fields:', { user_id, date, mood });
      responded = true;
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    // Defensive: Ensure symptoms and medications are arrays
    if (typeof symptoms === 'string') {
      try { symptoms = JSON.parse(symptoms); } catch { symptoms = symptoms.split(',').map(s => s.trim()).filter(Boolean); }
    }
    if (!Array.isArray(symptoms)) symptoms = [];
    if (typeof medications === 'string') {
      try { medications = JSON.parse(medications); } catch { medications = medications.split('\n').map(m => m.trim()).filter(Boolean); }
    }
    if (!Array.isArray(medications)) medications = [];
    const { data, error } = await supabase.from('journal_entries').insert([
      {
        user_id,
        date,
        mood,
        symptoms,
        medications,
        notes
      }
    ]).select();
    if (error) throw error;
    console.log('Journal entry inserted:', data && data[0]);
    responded = true;
    return res.json({ success: true, entry: data && data[0] });
  } catch (err) {
    console.error('Error in /api/journal/add:', err);
    if (!responded) {
      responded = true;
      try {
        res.status(500).json({ success: false, message: err.message || 'Unknown error' });
      } catch (e) {
        // Final fallback
        res.end('{"success":false,"message":"Server error (fallback)"}');
      }
    }
  }
  // Final catch-all fallback
  if (!responded) {
    try {
      res.status(500).json({ success: false, message: 'Unknown server error (final fallback)' });
    } catch (e) {
      res.end('{"success":false,"message":"Server error (final fallback)"}');
    }
  }
});


// GET /api/journal/:user_id
router.get('/:user_id', async (req, res) => {
  if (!supabase) {
    console.error('[GET] /api/journal/:user_id - Supabase unavailable');
    return res.status(503).json({ success: false, message: 'Database service is unavailable.' });
  }
  const { user_id } = req.params;
  if (!user_id) {
    console.warn('[GET] /api/journal/:user_id - Missing user_id');
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }
  try {
    // No type check, just pass as string
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user_id)
      .order('date', { ascending: false });
    if (error) {
      console.error('[GET] /api/journal/:user_id - Supabase error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Unknown DB error' });
    }
    if (!data) {
      console.warn('[GET] /api/journal/:user_id - No data returned');
      return res.json({ success: true, entries: [] });
    }
    res.json({ success: true, entries: data });
  } catch (err) {
    console.error('[GET] /api/journal/:user_id - Unexpected error:', err);
    res.status(500).json({ success: false, message: err.message || 'Unknown error' });
  }
});


// DELETE /api/journal/delete/:id
router.delete('/delete/:id', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Database service is unavailable.' });
  }
  try {
    const { id } = req.params;
    console.log('Deleting journal entry with id:', id);
    if (!id) return res.status(400).json({ success: false, message: 'Missing entry id' });
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete route error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health check endpoint for journal
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Journal routes healthy' });
});

module.exports = router;
