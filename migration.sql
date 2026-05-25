-- ============================================
-- MIGRATION: Auth, Comments, Q&A, Settings
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles RLS
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ( public.is_admin() );
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING ( public.is_admin() );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');
CREATE POLICY "Users read own comments"
  ON comments FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own pending"
  ON comments FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admin full access comments"
  ON comments FOR ALL
  USING ( public.is_admin() );


-- 3. ALTER QA_ENTRIES
ALTER TABLE qa_entries
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_answer text,
  ADD COLUMN IF NOT EXISTS answered_by text,
  ADD COLUMN IF NOT EXISTS answered_at timestamptz;

-- Mark existing seed data as answered so it stays visible
UPDATE qa_entries SET status = 'answered' WHERE status IS NULL;

-- Drop existing QA read policy and replace with status-aware ones
DROP POLICY IF EXISTS "Public read qa" ON qa_entries;

CREATE POLICY "Public read answered qa"
  ON qa_entries FOR SELECT
  USING (status = 'answered');
CREATE POLICY "Users see own questions"
  ON qa_entries FOR SELECT
  USING (auth.uid() = submitted_by);
CREATE POLICY "Users submit qa"
  ON qa_entries FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admin full qa access"
  ON qa_entries FOR ALL
  USING ( public.is_admin() );


-- 4. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings"
  ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings"
  ON site_settings FOR ALL
  USING ( public.is_admin() );

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Islamic Scholarly Resource'),
  ('site_tagline', 'A comprehensive hub for Islamic sciences'),
  ('hero_quote', 'رَبِّ زِدْنِي عِلْمًا'),
  ('contact_email', ''),
  ('social_twitter', ''),
  ('social_github', ''),
  ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;


-- 5. ADMIN WRITE POLICIES FOR CONTENT TABLES
-- Articles
CREATE POLICY "Admin manage articles"
  ON articles FOR ALL
  USING ( public.is_admin() );

-- Books
CREATE POLICY "Admin manage books"
  ON books FOR ALL
  USING ( public.is_admin() );

-- Scholars
CREATE POLICY "Admin manage scholars"
  ON scholars FOR ALL
  USING ( public.is_admin() );

-- Quotes
CREATE POLICY "Admin manage quotes"
  ON quotes FOR ALL
  USING ( public.is_admin() );

-- Proofs
CREATE POLICY "Admin manage proofs"
  ON proofs FOR ALL
  USING ( public.is_admin() );

-- Contentions
CREATE POLICY "Admin manage contentions"
  ON contentions FOR ALL
  USING ( public.is_admin() );

-- Lectures
CREATE POLICY "Admin manage lectures"
  ON lectures FOR ALL
  USING ( public.is_admin() );

-- Newsletter
CREATE POLICY "Admin manage newsletter"
  ON newsletter_subscribers FOR ALL
  USING ( public.is_admin() );

-- ============================================================
-- RUN THIS COMMAND AFTER SIGNING UP TO MAKE YOURSELF AN ADMIN:
-- UPDATE profiles SET role = 'admin';
-- ============================================================
