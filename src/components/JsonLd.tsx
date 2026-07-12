/**
 * Reusable JSON-LD Schema components for SEO structured data.
 * These inject <script type="application/ld+json"> into the page head.
 */

// ── WebSite + Organization (Homepage) ──
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://islam360.ridawiway.com/#website",
        url: "https://islam360.ridawiway.com",
        name: "Islam360",
        description:
          "A comprehensive encyclopaedia and educational platform for Islamic sciences, jurisprudence, theology, and Sunni scholarly tradition.",
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://islam360.ridawiway.com/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://islam360.ridawiway.com/#organization",
        name: "Islam360",
        url: "https://islam360.ridawiway.com",
        logo: {
          "@type": "ImageObject",
          url: "https://islam360.ridawiway.com/icon.png",
        },
        sameAs: [
          "https://x.com/sugemadinah",
          "https://www.instagram.com/q.sunnahh_/",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Article Schema ──
export function ArticleSchema({
  title,
  description,
  slug,
  author,
  datePublished,
  dateModified,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: `https://islam360.ridawiway.com/articles/${slug}`,
    image: image || "https://islam360.ridawiway.com/icon.png",
    datePublished: datePublished || undefined,
    dateModified: dateModified || datePublished || undefined,
    author: {
      "@type": "Person",
      name: author || "Islam360",
    },
    publisher: {
      "@type": "Organization",
      name: "Islam360",
      logo: {
        "@type": "ImageObject",
        url: "https://islam360.ridawiway.com/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://islam360.ridawiway.com/articles/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── BreadcrumbList Schema ──
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Person Schema (Scholar) ──
export function PersonSchema({
  name,
  slug,
  description,
  birthDate,
  deathDate,
  birthPlace,
  image,
  notableWorks,
}: {
  name: string;
  slug: string;
  description: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  image?: string;
  notableWorks?: string[];
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    url: `https://islam360.ridawiway.com/scholars/${slug}`,
    description: description,
    image: image || undefined,
    birthDate: birthDate || undefined,
    deathDate: deathDate || undefined,
    birthPlace: birthPlace
      ? { "@type": "Place", name: birthPlace }
      : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://islam360.ridawiway.com/scholars/${slug}`,
    },
  };

  if (notableWorks && notableWorks.length > 0) {
    schema.knowsAbout = notableWorks;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── FAQPage Schema (for Q&A page) ──
export function FAQPageSchema({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
