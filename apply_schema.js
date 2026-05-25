const { Client } = require('pg');

const connectionString = 'postgresql://postgres:27082007Raza%40@db.sfptgsaaqvgqsjiomkfs.supabase.co:5432/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = `
-- 1. Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  content_type text,
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
    `;

    console.log('Executing SQL script...');
    await client.query(sql);
    console.log('SQL script executed successfully!');

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

migrate();
