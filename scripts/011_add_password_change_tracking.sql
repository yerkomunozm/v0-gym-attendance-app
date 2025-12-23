-- Script 011: Add password change tracking and update user creation workflow
-- This script adds support for forcing password change on first login

-- Add password_change_required field to users table
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_password_change_required 
  ON public.users(password_change_required);

-- Add comment to explain the field
COMMENT ON COLUMN public.users.password_change_required IS 
  'Indicates if the user must change their password on next login. Set to true when admin creates trainer/student accounts.';

-- Update the handle_new_user trigger function to set password_change_required
-- based on metadata passed during user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, active, password_change_required, branch_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    true,
    COALESCE((new.raw_user_meta_data->>'password_change_required')::boolean, false),
    COALESCE((new.raw_user_meta_data->>'branch_id')::uuid, NULL)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to authenticated users to read their password_change_required status
-- (already covered by existing RLS policies that allow users to view their own profile)

-- Note: Edge Functions will use the service role to create users in auth.users
-- The trigger will automatically create the users record with appropriate metadata
