import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = 'https://scholarlyresource.vercel.app';

  // Fetch dynamic content to add to sitemap
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, created_at')
    .eq('status', 'published');

  const { data: books } = await supabase
    .from('books')
    .select('id, updated_at')
    .eq('status', 'published');

  // Build the routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/scholars`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/qa`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }
  ];

  // Add Article URLs
  if (articles) {
    articles.forEach((article) => {
      if (article.slug) {
        routes.push({
          url: `${baseUrl}/articles/${article.slug}`,
          lastModified: article.created_at ? new Date(article.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  }

  // Add Book URLs
  if (books) {
    books.forEach((book) => {
      routes.push({
        url: `${baseUrl}/books/${book.id}`,
        lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  }

  return routes;
}
