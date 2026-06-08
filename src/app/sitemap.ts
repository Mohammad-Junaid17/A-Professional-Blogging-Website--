import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = 'https://scholarlyresource.dpdns.org';

  // Fetch dynamic content to add to sitemap
  const { data: articles } = await supabase.from('articles').select('slug, created_at').eq('status', 'published');
  const { data: books } = await supabase.from('books').select('id, updated_at').eq('status', 'published');
  const { data: scholars } = await supabase.from('scholars').select('slug, created_at').eq('status', 'published');
  const { data: qa } = await supabase.from('qa_entries').select('id, created_at').eq('status', 'answered');
  const { data: lectures } = await supabase.from('lectures').select('id, created_at').eq('status', 'published');
  const { data: contentions } = await supabase.from('contentions').select('id, created_at').eq('status', 'published');

  // Build the static routes
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/books`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/scholars`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/qa`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/lectures`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contentions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // Add Article URLs
  if (articles) {
    articles.forEach((item) => {
      if (item.slug) {
        routes.push({ url: `${baseUrl}/articles/${item.slug}`, lastModified: item.created_at ? new Date(item.created_at) : new Date(), changeFrequency: 'weekly', priority: 0.7 });
      }
    });
  }

  // Add Book URLs
  if (books) {
    books.forEach((item) => {
      routes.push({ url: `${baseUrl}/books/${item.id}`, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: 'monthly', priority: 0.6 });
    });
  }

  // Add Scholar URLs
  if (scholars) {
    scholars.forEach((item) => {
      if (item.slug) {
        routes.push({ url: `${baseUrl}/scholars/${item.slug}`, lastModified: item.created_at ? new Date(item.created_at) : new Date(), changeFrequency: 'monthly', priority: 0.7 });
      }
    });
  }

  // Add QA URLs
  if (qa) {
    qa.forEach((item) => {
      routes.push({ url: `${baseUrl}/qa/${item.id}`, lastModified: item.created_at ? new Date(item.created_at) : new Date(), changeFrequency: 'weekly', priority: 0.6 });
    });
  }

  // Add Lecture URLs
  if (lectures) {
    lectures.forEach((item) => {
      routes.push({ url: `${baseUrl}/lectures/${item.id}`, lastModified: item.created_at ? new Date(item.created_at) : new Date(), changeFrequency: 'monthly', priority: 0.6 });
    });
  }

  // Add Contention URLs
  if (contentions) {
    contentions.forEach((item) => {
      routes.push({ url: `${baseUrl}/contentions/${item.id}`, lastModified: item.created_at ? new Date(item.created_at) : new Date(), changeFrequency: 'weekly', priority: 0.6 });
    });
  }

  return routes;
}
