npm install --legacy-peer-deps
npm run dev

database password: 1234562020

https://www.emailjs.com/


# Location Tracking with Supabase

This document explains how to set up and use the location tracking features of the LocationTracker app.

## Database Setup

### 1. Create the Location History Table

To store location data in Supabase, you need to run the migration script included in the project:

```sql
-- Create location_history table
CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own location
CREATE POLICY "Users can insert their own location" 
  ON location_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to select only their own locations
CREATE POLICY "Users can view their own locations" 
  ON location_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own locations
CREATE POLICY "Users can delete their own locations" 
  ON location_history FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS location_history_user_id_idx ON location_history(user_id);
CREATE INDEX IF NOT EXISTS location_history_timestamp_idx ON location_history(timestamp);
```

You can run this SQL in the Supabase SQL Editor or use the Supabase CLI for migrations.

### 2. Optional: Set Up PostGIS for Advanced Geo-Queries

For more advanced geographic queries, you can enable the PostGIS extension in your Supabase project:

1. Go to your Supabase dashboard
2. Navigate to Database > Extensions
3. Enable the "postgis" extension

Then add these spatial indexes to your table:

```sql
-- Add a spatial index for geographical querying (requires PostGIS extension)
CREATE INDEX IF NOT EXISTS location_history_geo_idx ON location_history USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
```

### 3. Optional: Automatic Data Cleanup

To automatically clean up old location data (e.g., older than 30 days), you can set up a cleanup function and schedule it to run periodically:

```sql
-- Add function to automatically clean up old location data
CREATE OR REPLACE FUNCTION cleanup_old_location_history() RETURNS void AS $$
BEGIN
  DELETE FROM location_history
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Add a cron job to clean up old location data every day (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled in Supabase
SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_old_location_history()');
```

Note: The pg_cron extension may not be available in all Supabase tiers.

## How It Works

The location tracking system consists of the following components:

1. **locationService.ts**: Service file with functions to interact with the Supabase database
2. **useLocationTracker.ts**: React hook that manages location data and history
3. **MapContainer.tsx**: Component for displaying the map and location history as a path
4. **Dashboard.tsx**: Main page that integrates all components

### Key Features

- **User-Specific Data**: Location history is stored and retrieved based on the authenticated user
- **Path Visualization**: Display a red path showing the user's movement over time
- **Daily Tracking**: Option to view only the current day's location history
- **Privacy Controls**: Row-level security ensures users can only access their own data
- **Satellite/Standard Views**: Toggle between map views while viewing location history

## Usage

1. Users must be signed in to save location history
2. When a user clicks "Update Location", their position is saved to the database
3. Location history is displayed as a red path on the map
4. Users can toggle the visibility of their location history path

## Implementation Details

### Saving Location Data

When a user updates their location, the data is saved to Supabase:

```typescript
// Save a location to Supabase
const saveLocation = async (latitude, longitude, accuracy) => {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session.user.id;
  
  await supabase
    .from('location_history')
    .insert({
      user_id: userId,
      latitude,
      longitude,
      accuracy,
      timestamp: new Date().toISOString(),
    });
};
```

### Retrieving Location History

Location history is fetched when the component mounts or when requested:

```typescript
// Get location history for the current user
const getLocationHistory = async (limit = 100, days = 1) => {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session.user.id;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data } = await supabase
    .from('location_history')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: true })
    .limit(limit);
    
  return data.map(entry => ({
    position: [entry.latitude, entry.longitude],
    timestamp: new Date(entry.timestamp).getTime(),
  }));
};
```

## Troubleshooting

### Common Issues

1. **Location history not appearing**: Make sure you're signed in and have granted location permissions.
2. **Path not displaying**: Check that you have at least two location points saved.
3. **Database errors**: Verify that your Supabase tables and policies are set up correctly.

### Debug Tips

- Check browser console for any errors related to Supabase
- Verify location permissions are enabled in your browser
- Ensure your Supabase URL and API key are correctly configured in the environment 


Admin SQL Editor:
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

-- REMOVE THIS LINE AND THE THREE BELOW IT
-- CREATE POLICY "Only admins can view admin_location_view" 
--   ON admin_location_view
--   FOR SELECT 
--   USING (is_admin() = true);

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


SELECT add_admin('your-email@example.com');