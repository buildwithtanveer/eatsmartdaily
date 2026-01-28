/**
 * Schema.org utilities for structured data
 */

interface FAQ {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(faqItems: FAQ[]) {
  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.replace(/<[^>]*>/g, ""), // Strip HTML tags
      },
    })),
  };
}

/**
 * Generate Breadcrumb Schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: BreadcrumbItem[],
  baseUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate Article Schema
 */
export function generateArticleSchema(data: {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: string;
  authorUrl?: string;
  publisherName: string;
  publisherLogo?: string;
  articleUrl: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.headline,
    description: data.description || data.headline,
    image: data.image ? [data.image] : undefined,
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    author: {
      "@type": "Person",
      name: data.author,
      url: data.authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: data.publisherName,
      logo: data.publisherLogo
        ? {
            "@type": "ImageObject",
            url: data.publisherLogo,
          }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.articleUrl,
    },
    keywords: data.keywords?.join(", "),
  };
}

/**
 * Generate Person Schema (Author)
 */
export function generatePersonSchema(data: {
  name: string;
  url: string;
  image?: string;
  jobTitle?: string;
  bio?: string;
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    url: data.url,
    image: data.image,
    jobTitle: data.jobTitle,
    description: data.bio,
    sameAs: Object.values(data.socialProfiles || {}).filter(Boolean),
  };
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  socialProfiles?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    pinterest?: string;
    youtube?: string;
  };
  contactPoint?: {
    email: string;
    telephone?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description,
    sameAs: Object.values(data.socialProfiles || {}).filter(Boolean),
    contactPoint: data.contactPoint
      ? {
          "@type": "ContactPoint",
          contactType: "Customer Service",
          email: data.contactPoint.email,
          telephone: data.contactPoint.telephone,
        }
      : undefined,
  };
}

/**
 * Generate Website Search Schema
 */
export function generateWebsiteSearchSchema(data: {
  name: string;
  url: string;
  searchUrl: string; // e.g., "https://example.com/search?q={search_term_string}"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: data.searchUrl,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Review Schema
 */
export function generateReviewSchema(data: {
  ratingValue: number;
  reviewCount: number;
  ratingDescription: string;
  reviewerName: string;
  reviewDate?: string;
  reviewText?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    ratingValue: data.ratingValue,
    reviewCount: data.reviewCount,
    description: data.ratingDescription,
    reviewRating: {
      "@type": "Rating",
      ratingValue: data.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: data.reviewerName,
    },
    reviewDate: data.reviewDate || new Date().toISOString(),
    reviewBody: data.reviewText || data.ratingDescription,
  };
}

/**
 * Combine multiple schemas into @graph format
 */
export function combineSchemas(...schemas: any[]) {
  const validSchemas = schemas.filter(Boolean);

  if (validSchemas.length === 0) {
    return null;
  }

  if (validSchemas.length === 1) {
    return validSchemas[0];
  }

  return {
    "@context": "https://schema.org",
    "@graph": validSchemas,
  };
}
