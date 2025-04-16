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

-- Add a spatial index for geographical querying (if using PostGIS extension)
-- Note: Requires PostGIS extension to be enabled
-- CREATE INDEX IF NOT EXISTS location_history_geo_idx ON location_history USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- Add function to automatically clean up old location data (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_location_history() RETURNS void AS $$
BEGIN
  DELETE FROM location_history
  WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Add a cron job to clean up old location data every day (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('0 0 * * *', 'SELECT cleanup_old_location_history()'); 