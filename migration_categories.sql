-- ============================================
-- MIGRATION: Categories and YouTube
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  content_type text, -- 'books', 'articles', 'lectures', 'proofs', 'qa' or NULL for all
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create YouTube Channels table
CREATE TABLE IF NOT EXISTS youtube_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  handle text NOT NULL UNIQUE,
  channel_id text NOT NULL UNIQUE,
  name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "youtube_channels_public_read" ON youtube_channels FOR SELECT USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "youtube_channels_admin_all" ON youtube_channels FOR ALL USING (public.is_admin());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add columns
ALTER TABLE books
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS sub_category text;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS sub_category text;

ALTER TABLE lectures
  ADD COLUMN IF NOT EXISTS sub_category text;

ALTER TABLE proofs
  ADD COLUMN IF NOT EXISTS sub_category text;

-- 4. Migrate existing categories
INSERT INTO categories (name, content_type)
SELECT DISTINCT category, 'books' FROM books WHERE category IS NOT NULL AND category != '' AND category NOT IN (SELECT name FROM categories WHERE content_type = 'books' OR content_type IS NULL);

INSERT INTO categories (name, content_type)
SELECT DISTINCT category, 'articles' FROM articles WHERE category IS NOT NULL AND category != '' AND category NOT IN (SELECT name FROM categories WHERE content_type = 'articles' OR content_type IS NULL);

INSERT INTO categories (name, content_type)
SELECT DISTINCT category, 'lectures' FROM lectures WHERE category IS NOT NULL AND category != '' AND category NOT IN (SELECT name FROM categories WHERE content_type = 'lectures' OR content_type IS NULL);

INSERT INTO categories (name, content_type)
SELECT DISTINCT category, 'qa' FROM qa_entries WHERE category IS NOT NULL AND category != '' AND category NOT IN (SELECT name FROM categories WHERE content_type = 'qa' OR content_type IS NULL);