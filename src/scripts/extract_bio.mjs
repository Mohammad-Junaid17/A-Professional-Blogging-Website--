import fs from 'fs';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Fetching URL...');
  const res = await fetch('https://alahazrat.net/personalities/mufti-muhammad-akhtar-raza-khan/introduction-of-mufti-akhtar-raza-khan/');
  const html = await res.text();

  console.log('Parsing HTML...');
  const $ = cheerio.load(html);
  
  // Find the main article content (typically inside .entry-content or similar)
  // According to standard WP themes it's often .entry-content, .post-content, etc.
  const contentNode = $('.entry-content, .post-content, article, main').first();
  if (!contentNode.length) {
    console.error('Could not find content node');
    return;
  }

  // Clean up unwanted elements before converting to markdown
  contentNode.find('script, style, .sharedaddy, .jp-relatedposts').remove();

  const turndownService = new TurndownService({ headingStyle: 'atx' });
  let markdown = turndownService.turndown(contentNode.html());
  
  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  
  console.log(`Extracted ${markdown.length} characters of markdown.`);

  const newScholar = {
    name_english: 'Mufti Akhtar Raza Khan (Taajush Shariah)',
    name_arabic: 'مفتي اختر رضا خان',
    slug: 'mufti-akhtar-raza-khan',
    bio: markdown,
    madhab: 'HANAFI',
    birth_year: '1943', // 1943 Gregorian
    death_year_ah: '1439', // 2018 Gregorian
    origin: 'Bareilly Sharif, India',
    status: 'published'
  };

  console.log('Inserting into database...');
  const { data, error } = await supabase
    .from('scholars')
    .insert(newScholar)
    .select()
    .single();

  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Success! Inserted scholar ID:', data.id);
  }
}

run().catch(console.error);
