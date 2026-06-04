-- 1. SAVED ITEMS TABLE
CREATE TABLE IF NOT EXISTS saved_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL, -- 'article', 'book', 'lecture', 'qa'
  content_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can manage own saved items"
      ON saved_items FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Admin full access saved items"
      ON saved_items FOR ALL USING (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. ADD CREATED_BY TO CONTENT TABLES
ALTER TABLE articles ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE books ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE lectures ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE scholars ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE contentions ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. BACKFILL EXISTING CONTENT TO MAIN ADMIN
-- This assigns all previously created content to the first admin user created in the system.
DO $$ 
DECLARE
  main_admin_id uuid;
BEGIN
  -- Find the first admin
  SELECT id INTO main_admin_id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;
  
  IF main_admin_id IS NOT NULL THEN
    UPDATE articles SET created_by = main_admin_id WHERE created_by IS NULL;
    UPDATE books SET created_by = main_admin_id WHERE created_by IS NULL;
    UPDATE lectures SET created_by = main_admin_id WHERE created_by IS NULL;
    UPDATE scholars SET created_by = main_admin_id WHERE created_by IS NULL;
    UPDATE contentions SET created_by = main_admin_id WHERE created_by IS NULL;
  END IF;
END $$;
