import { useState, useEffect, useCallback } from "react";
import { saveLocation, getLocationHistory, LocationHistoryPoint } from "@/services/locationService";
import { useAuth } from "@/contexts/AuthContext";

interface LocationState {
  position: [number, number];
  accuracy: number;
  loading: boolean;
  error: string | null;
  locationHistory: LocationHistoryPoint[];
  updating: boolean;
}

const useLocationTracker = () => {
  const { user } = useAuth();
  const [locationState, setLocationState] = useState<LocationState>({
    position: [0, 0],
    accuracy: 0,
    loading: true,
    error: null,
    locationHistory: [],
    updating: false
  });

  // Function to get current position
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        loading: false,
        updating: false,
        error: "Geolocation is not supported by your browser"
      }));
      return;
    }

    setLocationState(prev => ({ ...prev, updating: true }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const accuracyMeters = pos.coords.accuracy;

        // Save location to Supabase if user is logged in
        if (user) {
          try {
            await saveLocation(lat, lon, accuracyMeters);
          } catch (error) {
            console.error("Error saving location:", error);
          }
        }

        setLocationState(prevState => {
          // Only add to history if position has changed significantly (more than 5 meters)
          const lastPos = prevState.locationHistory.length > 0 ? 
            prevState.locationHistory[prevState.locationHistory.length - 1].position : null;
          
          let newHistory = [...prevState.locationHistory];
          
          // If this is the first position or it's different from the last one by more than 5 meters
          if (!lastPos || calculateDistance(lastPos, [lat, lon]) > 5) {
            newHistory = [...newHistory, {
              position: [lat, lon],
              timestamp: Date.now()
            }];
          }
          
          return {
            position: [lat, lon],
            accuracy: accuracyMeters,
            loading: false,
            updating: false,
            error: null,
            locationHistory: newHistory
          };
        });
      },
      (err) => {
        setLocationState(prev => ({
          ...prev,
          loading: false,
          updating: false,
          error: err.message
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [user]);

  // Load location history from Supabase
  const loadLocationHistory = useCallback(async () => {
    if (!user) return;

    try {
      const history = await getLocationHistory();
      
      if (history.length > 0) {
        setLocationState(prev => ({
          ...prev,
          locationHistory: history
        }));
      }
    } catch (error) {
      console.error("Error loading location history:", error);
    }
  }, [user]);

  // Manual update function - can be called by the user
  const updateLocation = useCallback(() => {
    getPosition();
  }, [getPosition]);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser"
      }));
      return;
    }

    // Get initial position only when component mounts
    getPosition();

    // Load location history if user is logged in
    if (user) {
      loadLocationHistory();
    }

    // No automatic interval anymore - user will trigger updates manually
    
    // No cleanup needed since we're not setting up an interval
  }, [getPosition, loadLocationHistory, user]);

  return { ...locationState, updateLocation };
};

// Calculate distance between two points in meters using the Haversine formula
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[0] * Math.PI / 180; // φ, λ in radians
  const φ2 = point2[0] * Math.PI / 180;
  const Δφ = (point2[0] - point1[0]) * Math.PI / 180;
  const Δλ = (point2[1] - point1[1]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export default useLocationTracker;
