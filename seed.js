const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:27082007Raza%40@db.sfptgsaaqvgqsjiomkfs.supabase.co:5432/postgres';

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, '..', '..', '.gemini', 'antigravity-ide', 'brain', 'e0a048c8-dcf9-4b5e-9044-3142132f943d', 'schema.sql');
    
    // Instead of relying on absolute artifact path which might be tricky in the script context,
    // I will just read the artifact from the known absolute path.
    const sql = fs.readFileSync('C:\\Users\\85chh\\.gemini\\antigravity-ide\\brain\\e0a048c8-dcf9-4b5e-9044-3142132f943d\\schema.sql', 'utf8');

    console.log('Executing SQL script...');
    await client.query(sql);
    console.log('SQL script executed successfully!');

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

seed();
