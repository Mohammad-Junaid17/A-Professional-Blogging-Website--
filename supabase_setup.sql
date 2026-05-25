-- ─────────────────────────────────
-- PROFILES TABLE
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) 
    ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user',
  avatar_url text,
  disabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────
-- AUTO CREATE PROFILE ON SIGNUP
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION 
  handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS 
  on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE 
    handle_new_user();

-- ─────────────────────────────────
-- COMMENTS TABLE
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid()
    PRIMARY KEY,
  user_id uuid REFERENCES profiles(id)
    ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────
-- EXTEND QA TABLE
-- ─────────────────────────────────
ALTER TABLE qa_entries
  ADD COLUMN IF NOT EXISTS
    submitted_by uuid 
    REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS
    status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS
    admin_answer text,
  ADD COLUMN IF NOT EXISTS
    answered_by text,
  ADD COLUMN IF NOT EXISTS
    answered_at timestamptz;

-- ─────────────────────────────────
-- SITE SETTINGS TABLE
-- ─────────────────────────────────
CREATE TABLE IF NOT EXISTS 
  site_settings (
  key text PRIMARY KEY,
  value text
);

INSERT INTO site_settings (key, value)
VALUES
  ('site_name', 
   'Islamic Scholarly Resource'),
  ('site_tagline', 
   'A comprehensive knowledge hub'),
  ('hero_quote', 
   'And say: My Lord, increase me in knowledge.'),
  ('hero_quote_source', 
   'Quran 20:114'),
  ('contact_email', 
   'admin@islamicscholarly.com'),
  ('twitter_url', ''),
  ('github_url', ''),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────
-- is_admin() HELPER FUNCTION
-- ─────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
    AND disabled = false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ─────────────────────────────────
-- DROP ALL OLD POLICIES
-- ─────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, 
           policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END $$;

-- ─────────────────────────────────
-- RLS: PROFILES
-- ─────────────────────────────────
ALTER TABLE profiles 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR is_admin()
  );
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: ARTICLES
-- ─────────────────────────────────
ALTER TABLE articles 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles_public_read"
  ON articles FOR SELECT USING (true);
CREATE POLICY "articles_admin_insert"
  ON articles FOR INSERT
  WITH CHECK (is_admin());
CREATE POLICY "articles_admin_update"
  ON articles FOR UPDATE
  USING (is_admin());
CREATE POLICY "articles_admin_delete"
  ON articles FOR DELETE
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: BOOKS
-- ─────────────────────────────────
ALTER TABLE books 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_public_read"
  ON books FOR SELECT USING (true);
CREATE POLICY "books_admin_insert"
  ON books FOR INSERT
  WITH CHECK (is_admin());
CREATE POLICY "books_admin_update"
  ON books FOR UPDATE USING (is_admin());
CREATE POLICY "books_admin_delete"
  ON books FOR DELETE USING (is_admin());

-- ─────────────────────────────────
-- RLS: SCHOLARS
-- ─────────────────────────────────
ALTER TABLE scholars 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scholars_public_read"
  ON scholars FOR SELECT USING (true);
CREATE POLICY "scholars_admin_all"
  ON scholars FOR ALL USING (is_admin());

-- ─────────────────────────────────
-- RLS: QUOTES
-- ─────────────────────────────────
ALTER TABLE quotes 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quotes_public_read"
  ON quotes FOR SELECT USING (true);
CREATE POLICY "quotes_admin_all"
  ON quotes FOR ALL USING (is_admin());

-- ─────────────────────────────────
-- RLS: QA ENTRIES
-- ─────────────────────────────────
ALTER TABLE qa_entries 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qa_read"
  ON qa_entries FOR SELECT
  USING (
    status = 'answered'
    OR auth.uid() = submitted_by
    OR is_admin()
  );
CREATE POLICY "qa_user_insert"
  ON qa_entries FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = submitted_by
  );
CREATE POLICY "qa_admin_all"
  ON qa_entries FOR ALL
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: COMMENTS
-- ─────────────────────────────────
ALTER TABLE comments 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_read"
  ON comments FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR is_admin()
  );
CREATE POLICY "comments_user_insert"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );
CREATE POLICY "comments_user_delete"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );
CREATE POLICY "comments_admin_all"
  ON comments FOR ALL
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: PROOFS
-- ─────────────────────────────────
ALTER TABLE proofs 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proofs_public_read"
  ON proofs FOR SELECT USING (true);
CREATE POLICY "proofs_admin_all"
  ON proofs FOR ALL USING (is_admin());

-- ─────────────────────────────────
-- RLS: CONTENTIONS
-- ─────────────────────────────────
ALTER TABLE contentions 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contentions_public_read"
  ON contentions FOR SELECT USING (true);
CREATE POLICY "contentions_admin_all"
  ON contentions FOR ALL 
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: LECTURES
-- ─────────────────────────────────
ALTER TABLE lectures 
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lectures_public_read"
  ON lectures FOR SELECT USING (true);
CREATE POLICY "lectures_admin_all"
  ON lectures FOR ALL USING (is_admin());

-- ─────────────────────────────────
-- RLS: NEWSLETTER
-- ─────────────────────────────────
ALTER TABLE newsletter_subscribers
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_insert"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (is_admin());
CREATE POLICY "newsletter_admin_all"
  ON newsletter_subscribers FOR ALL
  USING (is_admin());

-- ─────────────────────────────────
-- RLS: SITE SETTINGS
-- ─────────────────────────────────
ALTER TABLE site_settings
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read"
  ON site_settings FOR SELECT
  USING (true);
CREATE POLICY "settings_admin_all"
  ON site_settings FOR ALL
  USING (is_admin());

-- ─────────────────────────────────
-- VERIFY SETUP (run after above)
-- ─────────────────────────────────
SELECT 
  tablename,
  count(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
