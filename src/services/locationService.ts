import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Define the structure of a location history entry
export interface LocationHistoryEntry {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

// Convert location history to points for the map
export interface LocationHistoryPoint {
  position: [number, number];
  timestamp: number;
}

/**
 * Save a new location point to the database
 */
export const saveLocation = async (latitude: number, longitude: number, accuracy: number): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    // Insert the location into the database
    const { error } = await supabase
      .from('location_history')
      .insert({
        user_id: userId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving location:', error);
    throw error;
  }
};

/**
 * Get location history for the current user
 * @param limit Number of history points to fetch (default: 100)
 * @param days Number of days to look back (default: 1)
 */
export const getLocationHistory = async (limit = 100, days = 1): Promise<LocationHistoryPoint[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    // Calculate the date for the time range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Query the database for location history
    const { data, error } = await supabase
      .from('location_history')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })
      .limit(limit);
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match LocationHistoryPoint format
    return data.map((entry: LocationHistoryEntry) => ({
      position: [entry.latitude, entry.longitude],
      timestamp: new Date(entry.timestamp).getTime(),
    }));
  } catch (error) {
    console.error('Error fetching location history:', error);
    return [];
  }
};

/**
 * Get location history for the current day
 */
export const getDailyLocationHistory = async (): Promise<LocationHistoryPoint[]> => {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    // Query the database for today's location history
    const { data, error } = await supabase
      .from('location_history')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', today.toISOString())
      .order('timestamp', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match LocationHistoryPoint format
    return data.map((entry: LocationHistoryEntry) => ({
      position: [entry.latitude, entry.longitude],
      timestamp: new Date(entry.timestamp).getTime(),
    }));
  } catch (error) {
    console.error('Error fetching daily location history:', error);
    return [];
  }
};

/**
 * Clear all location history for the current user
 */
export const clearLocationHistory = async (): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;
    
    // Delete all location history for this user
    const { error } = await supabase
      .from('location_history')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error clearing location history:', error);
    throw error;
  }
}; 