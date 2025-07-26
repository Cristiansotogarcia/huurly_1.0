-- Migration: Update Cloudflare R2 URLs to Custom Domain (Version 2)
-- Date: January 3, 2025
-- Purpose: Update existing profile picture and cover photo URLs from old R2 domain to new custom domain

-- Update profile photos (profiel_foto) to use beelden.huurly.nl
UPDATE public.huurders 
SET profiel_foto = REPLACE(
    profiel_foto, 
    'https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/', 
    'https://beelden.huurly.nl/'
)
WHERE profiel_foto IS NOT NULL 
  AND profiel_foto LIKE '%5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com%';

-- Update cover photos (cover_foto) to use beelden.huurly.nl
UPDATE public.huurders 
SET cover_foto = REPLACE(
    cover_foto, 
    'https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/', 
    'https://beelden.huurly.nl/'
)
WHERE cover_foto IS NOT NULL 
  AND cover_foto LIKE '%5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com%';

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

-- Log the migration
INSERT INTO migration_log (migration_name, executed_at, description)
VALUES (
    '20250103000010_update_r2_urls_to_custom_domain_v2',
    NOW(),
    'Updated Cloudflare R2 URLs from old domain to custom domain (beelden.huurly.nl for profile pictures and cover photos)'
) ON CONFLICT DO NOTHING;