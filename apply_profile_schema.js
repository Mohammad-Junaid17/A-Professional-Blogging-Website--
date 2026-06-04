const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgresql://postgres:27082007Raza%40@db.sfptgsaaqvgqsjiomkfs.supabase.co:5432/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sql = fs.readFileSync('migration_profile.sql', 'utf8');

    console.log('Executing SQL script...');
    await client.query(sql);
    console.log('SQL script executed successfully!');

    // Now, assign existing items to the admin user.
    // Fetch an admin user
    const adminRes = await client.query("SELECT id FROM profiles WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1");
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      console.log('Found main admin ID:', adminId, '- assigning existing content to this admin.');

      const tables = ['articles', 'books', 'lectures', 'scholars', 'contentions'];
      for (const table of tables) {
        await client.query(`UPDATE ${table} SET created_by = $1 WHERE created_by IS NULL`, [adminId]);
        console.log(`Updated ${table}`);
      }
    } else {
      console.log('No admin user found to assign existing content to.');
    }

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

migrate();
