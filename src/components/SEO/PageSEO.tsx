import { Helmet } from 'react-helmet-async';

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  keywords?: string;
}

/**
 * PageSEO Component
 * 
 * Dynamically manages page-specific SEO meta tags using react-helmet-async.
 * This component fixes Google Search Console issues by providing unique
 * titles, descriptions, and canonical URLs for each route.
 * 
 * @param title - Page title (will be appended with " - Huurly")
 * @param description - Meta description for the page
 * @param canonical - Canonical URL (should be the full URL of the current page)
 * @param ogImage - Open Graph image URL (optional, defaults to site default)
 * @param ogType - Open Graph type (optional, defaults to "website")
 * @param noindex - If true, adds noindex meta tag (optional)
 * @param keywords - Meta keywords (optional)
 */
export const PageSEO = ({
  title,
  description,
  canonical,
  ogImage = "https://imagedelivery.net/KE7oljFadxNqgUvpxIG0Zg/fd0e7199-ed19-4bdd-599d-1e268807ee00/public",
  ogType = "website",
  noindex = false,
  keywords,
}: PageSEOProps) => {
  const fullTitle = `${title} - Huurly`;
  const siteUrl = "https://huurly.nl";
  const fullCanonical = canonical || siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical URL - Critical for fixing duplicate content issues */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Robots Meta Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Huurly" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
