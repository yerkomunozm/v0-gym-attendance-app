-- Script para actualizar las URLs de los QR codes de los entrenadores
-- Reemplaza 'TU_NUEVO_DOMINIO' con el dominio real de producción
-- Ejemplo: 'https://gym-attendance-app.vercel.app'

UPDATE trainers
SET qr_code = REPLACE(
  qr_code,
  SUBSTRING(qr_code FROM '^https?://[^/]+'),
  'https://preview-gym-attendance-app-3-kzmr0mx3ns3xbu1g47sb.vusercontent.net'
)
WHERE qr_code LIKE 'http%';

-- Verificar los resultados
SELECT id, name, qr_code FROM trainers;
