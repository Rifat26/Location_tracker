-- Create a custom admin_users table to track admin status
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies to admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view the admin_users table
CREATE POLICY "Admin users can view admin_users" 
  ON admin_users FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Create function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modify location_history policies to allow admins to view all users' data
DROP POLICY IF EXISTS "Users can view their own locations" ON location_history;
CREATE POLICY "Users can view their own locations" 
  ON location_history FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    is_admin() = true
  );

-- Create a view for admin dashboard that includes user information
CREATE OR REPLACE VIEW admin_location_view AS
SELECT 
  lh.id,
  lh.user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' AS user_name,
  lh.latitude,
  lh.longitude,
  lh.accuracy,
  lh.timestamp,
  lh.created_at
FROM 
  location_history lh
JOIN 
  auth.users u ON lh.user_id = u.id;

-- Grant permissions on the view
GRANT SELECT ON admin_location_view TO authenticated;

-- RLS policy for the view
CREATE POLICY "Only admins can view admin_location_view" 
  ON admin_location_view
  FOR SELECT 
  USING (is_admin() = true);

-- Function to add an admin
CREATE OR REPLACE FUNCTION add_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Insert into admin_users if not already an admin
  INSERT INTO admin_users (id)
  VALUES (user_id)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 