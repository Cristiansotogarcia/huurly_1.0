// Dynamic CORS headers for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:9999',
  'https://huurly.nl',
  'https://www.huurly.nl',
  'https://huurly-1-0-cristiansotogarcia-4472s-projects.vercel.app',
];

export const corsHeaders = (origin?: string) => {
  const requestOrigin = origin || '';
  const isAllowedOrigin = allowedOrigins.includes(requestOrigin);
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? requestOrigin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin',
  };
};
