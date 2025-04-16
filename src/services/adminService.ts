import { supabase } from "@/lib/supabase";
import { LocationHistoryPoint } from "./locationService";

export interface UserLocationData {
  userId: string;
  email: string;
  userName: string | null;
  locations: LocationHistoryPoint[];
  lastLocation: LocationHistoryPoint | null;
}

/**
 * Check if current user is an admin
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get a list of all users with their latest location
 */
export const getAllUsersWithLocation = async (): Promise<UserLocationData[]> => {
  try {
    // First, check if user is admin
    const isAdmin = await checkIsAdmin();
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Get all users with their latest location
    const { data, error } = await supabase
      .from('admin_location_view')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Group by user_id
    const userMap = new Map<string, UserLocationData>();
    
    data.forEach(entry => {
      const userId = entry.user_id;
      const location: LocationHistoryPoint = {
        position: [entry.latitude, entry.longitude],
        timestamp: new Date(entry.timestamp).getTime()
      };
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          email: entry.email,
          userName: entry.user_name,
          locations: [location],
          lastLocation: location
        });
      } else {
        const userData = userMap.get(userId)!;
        userData.locations.push(location);
      }
    });
    
    return Array.from(userMap.values());
  } catch (error) {
    console.error('Error fetching users with location:', error);
    return [];
  }
};

/**
 * Get location history for a specific user (admin only)
 */
export const getUserLocationHistory = async (userId: string, days = 1): Promise<LocationHistoryPoint[]> => {
  try {
    // First, check if user is admin
    const isAdmin = await checkIsAdmin();
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Calculate the date for the time range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Query the database for user's location history
    const { data, error } = await supabase
      .from('location_history')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match LocationHistoryPoint format
    return data.map(entry => ({
      position: [entry.latitude, entry.longitude],
      timestamp: new Date(entry.timestamp).getTime(),
    }));
  } catch (error) {
    console.error('Error fetching user location history:', error);
    return [];
  }
};

/**
 * Get all users with their location histories for the specified time period
 */
export const getAllUsersLocationHistory = async (days = 1): Promise<UserLocationData[]> => {
  try {
    // First, check if user is admin
    const isAdmin = await checkIsAdmin();
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    // Calculate the date for the time range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all location data within the time range
    const { data, error } = await supabase
      .from('admin_location_view')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Group by user_id
    const userMap = new Map<string, UserLocationData>();
    
    data.forEach(entry => {
      const userId = entry.user_id;
      const location: LocationHistoryPoint = {
        position: [entry.latitude, entry.longitude],
        timestamp: new Date(entry.timestamp).getTime()
      };
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          email: entry.email,
          userName: entry.user_name,
          locations: [location],
          lastLocation: location
        });
      } else {
        const userData = userMap.get(userId)!;
        userData.locations.push(location);
        // Update last location if this one is newer
        if (location.timestamp > userData.lastLocation!.timestamp) {
          userData.lastLocation = location;
        }
      }
    });
    
    return Array.from(userMap.values());
  } catch (error) {
    console.error('Error fetching all users location history:', error);
    return [];
  }
}; 