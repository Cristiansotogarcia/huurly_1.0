// Dynamic CORS headers for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://huurly.nl',
  'https://www.huurly.nl',
];

export const corsHeaders = (origin?: string) => {
  const requestOrigin = origin || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(requestOrigin) ? requestOrigin : '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};