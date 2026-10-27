-- MIGRATION: Change user_id column in journal_entries from uuid to text
-- This will allow any string (email, uuid, etc) as user_id and prevent Supabase from returning HTML errors

ALTER TABLE journal_entries
ALTER COLUMN user_id TYPE text USING user_id::text;

-- Optional: If you want to allow nulls (not recommended for user_id)
-- ALTER TABLE journal_entries ALTER COLUMN user_id DROP NOT NULL;

-- After running this migration, all backend and frontend journal fetches will work for any user_id string.
