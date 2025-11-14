-- Update existing trainer QR codes to use URL format
-- This script updates all existing trainers to have proper URL-based QR codes
-- Run this once to migrate existing data

-- Note: You'll need to replace 'YOUR_DOMAIN' with your actual domain
-- For development, use: http://localhost:3000
-- For production, use: https://yourdomain.com

UPDATE trainers
SET qr_code = 'YOUR_DOMAIN/scan/register?trainerId=' || id || '&trainerName=' || REPLACE(name, ' ', '%20')
WHERE qr_code NOT LIKE '%/scan/register%';

-- Example for localhost:
-- UPDATE trainers
-- SET qr_code = 'http://localhost:3000/scan/register?trainerId=' || id || '&trainerName=' || REPLACE(name, ' ', '%20')
-- WHERE qr_code NOT LIKE '%/scan/register%';
