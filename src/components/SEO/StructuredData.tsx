import { useEffect } from 'react';

/**
 * StructuredData component adds Schema.org JSON-LD structured data to the page
 * This helps search engines understand the content better and enables rich snippets
 */
export const StructuredData = () => {
  useEffect(() => {
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Huurly",
      "legalName": "CSG Online Specialist",
      "url": "https://huurly.nl",
      "logo": "https://huurly.nl/huurly-logo.svg",
      "description": "Het Nederlandse platform waar verhuurders huurders vinden op basis van geverifieerde profielen",
      "email": "team@huurly.nl",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "De Gouwe 42D",
        "postalCode": "8253 PA",
        "addressLocality": "Dronten",
        "addressCountry": "NL"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "team@huurly.nl",
        "contactType": "Customer Service",
        "availableLanguage": "Dutch"
      },
      "vatID": "NL004983001B44",
      "taxID": "92868401"
    };

    // Website Schema with Search Action
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Huurly",
      "url": "https://huurly.nl",
      "description": "Het Nederlandse platform waar verhuurders huurders vinden op basis van geverifieerde profielen",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://huurly.nl/zoek-woningen?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    // WebApplication Schema
    const webApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Huurly",
      "url": "https://huurly.nl",
      "applicationCategory": "Real Estate",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "category": "Subscription",
        "price": "89.00",
        "priceCurrency": "EUR",
        "priceValidUntil": "2025-12-31",
        "description": "Jaarlijks abonnement voor huurders"
      }
    };

    // Service Schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Huurly Matching Service",
      "provider": {
        "@type": "Organization",
        "name": "Huurly"
      },
      "serviceType": "Rental Housing Matching",
      "areaServed": {
        "@type": "Country",
        "name": "Netherlands"
      },
      "description": "Platform dat verhuurders en huurders op een veilige en efficiënte manier met elkaar verbindt"
    };

    // Add all schemas to the page
    const schemas = [
      organizationSchema,
      websiteSchema,
      webApplicationSchema,
      serviceSchema
    ];

    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      script.id = `structured-data-${index}`;
      document.head.appendChild(script);
    });

    // Cleanup function to remove scripts on unmount
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`structured-data-${index}`);
        if (script) {
          document.head.removeChild(script);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};
