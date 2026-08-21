-- Public sign-up is always a customer. Only the server-side privileged
-- account function may request a driver/admin profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
BEGIN
  requested_role := CASE
    WHEN NEW.raw_user_meta_data->>'privileged_creator' = 'true'
         AND NEW.raw_user_meta_data->>'role' IN ('driver', 'admin')
      THEN NEW.raw_user_meta_data->>'role'
    ELSE 'customer'
  END;

  INSERT INTO public.profiles (
    auth_user_id, full_name, email, phone, role, status, created_at, updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    requested_role,
    'active', NOW(), NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
