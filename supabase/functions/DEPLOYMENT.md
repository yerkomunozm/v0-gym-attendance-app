# Deployment Instructions for Edge Functions

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Deploy Edge Functions

### Deploy create-trainer function:
```bash
supabase functions deploy create-trainer
```

### Deploy create-student function:
```bash
supabase functions deploy create-student
```

### Deploy all functions at once:
```bash
supabase functions deploy
```

## Set Environment Variables

The Edge Functions need access to these environment variables:
- `SUPABASE_URL` (automatically provided)
- `SUPABASE_ANON_KEY` (automatically provided)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically provided)

These are automatically available in Supabase Edge Functions.

## Test the Functions

### Test create-trainer locally:
```bash
supabase functions serve create-trainer
```

Then make a POST request:
```bash
curl -X POST http://localhost:54321/functions/v1/create-trainer \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Trainer",
    "email": "trainer@test.com",
    "phone": "+1234567890",
    "specialty": "Fitness",
    "branch_id": "YOUR_BRANCH_ID",
    "password": "test123"
  }'
```

### Test create-student locally:
```bash
supabase functions serve create-student
```

Then make a POST request:
```bash
curl -X POST http://localhost:54321/functions/v1/create-student \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "phone": "+1234567890",
    "membership_status": "active",
    "branch_id": "YOUR_BRANCH_ID",
    "password": "test123"
  }'
```

## Verify Deployment

1. Go to Supabase Dashboard → Edge Functions
2. Verify both functions are listed and active
3. Check function logs for any errors

## Update Database

Before using the functions, ensure you've run the database migration:

```sql
-- Run this in Supabase SQL Editor
-- File: scripts/011_add_password_change_tracking.sql
```
