-- ============================================
-- TRANSLATIONS AND TRANSLATION REQUESTS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. TRANSLATIONS TABLE
CREATE TABLE IF NOT EXISTS translations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL, -- 'article' or 'qa'
  content_id uuid NOT NULL,
  language text NOT NULL, -- 'urdu' or 'roman_urdu'
  content text,
  external_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure only one translation per language per content exists
CREATE UNIQUE INDEX IF NOT EXISTS translations_unique_idx 
  ON translations (content_type, content_id, language);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read translations"
  ON translations FOR SELECT USING (true);
CREATE POLICY "Admin manage translations"
  ON translations FOR ALL USING ( public.is_admin() );


-- 2. TRANSLATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS translation_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL, -- 'article' or 'qa'
  content_id uuid NOT NULL,
  language text NOT NULL, -- 'urdu' or 'roman_urdu'
  user_id uuid REFERENCES profiles(id), -- optional, for logged in users
  created_at timestamptz DEFAULT now()
);

-- Prevent spamming identical requests by same user (or anonymous) on same content
CREATE UNIQUE INDEX IF NOT EXISTS translation_requests_unique_idx 
  ON translation_requests (content_type, content_id, language, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid));

ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request (even guests, user_id can be null)
CREATE POLICY "Anyone can submit translation requests"
  ON translation_requests FOR INSERT WITH CHECK (true);

-- Only admins can view all requests
CREATE POLICY "Admins can view requests"
  ON translation_requests FOR SELECT USING ( public.is_admin() );
CREATE POLICY "Admins can manage requests"
  ON translation_requests FOR ALL USING ( public.is_admin() );
