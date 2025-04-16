import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { Layers, Map, User, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { UserLocationData } from "@/services/adminService";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Set up default icon
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Ensure the default icon is set for all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Map layer types
type MapLayerType = 'standard' | 'satellite';

// URLs for the map tiles
const STANDARD_MAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_MAP_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// Custom CSS for zoom controls
const customZoomControlStyles = `
.leaflet-control-zoom {
  margin-right: 60px !important;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
  border-radius: 4px;
}

.leaflet-control-zoom a {
  background-color: white;
  color: #555;
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  border-radius: 2px;
  display: block;
}

.leaflet-control-zoom a:hover {
  background-color: #f4f4f4;
  color: #333;
}

.leaflet-control-zoom-in {
  border-bottom: 1px solid #ccc;
}

.user-popup-content {
  padding: 5px 10px;
}

.user-popup-content h3 {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 5px 0;
}

.user-popup-content p {
  font-size: 12px;
  margin: 2px 0;
}
`;

// Generate a deterministic color based on a string (user ID in this case)
const getUserColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue between 0 and 360 degrees, avoiding red (which is used for selected users)
  const hue = Math.abs(hash) % 300; // Avoid red hues (300-360)
  
  return `hsl(${hue}, 70%, 40%)`;
};

interface AdminMapContainerProps {
  usersData: UserLocationData[];
  isLoading: boolean;
  selectedUserId?: string | null;
  onSelectUser?: (userId: string) => void;
}

const AdminMapContainer: React.FC<AdminMapContainerProps> = ({ 
  usersData, 
  isLoading,
  selectedUserId,
  onSelectUser
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const standardLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkersRef = useRef<{ [userId: string]: L.Marker }>({});
  const userPathsRef = useRef<{ [userId: string]: L.Polyline }>({});
  const isMobile = useIsMobile();
  const [mapReady, setMapReady] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('standard');
  const [visibleUsers, setVisibleUsers] = useState<{ [userId: string]: boolean }>({});
  const [showUserList, setShowUserList] = useState(!isMobile); // Auto-hide on mobile

  // Add custom CSS for zoom controls
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = customZoomControlStyles;
    document.head.appendChild(styleElement);
    
    // Clean up style element on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Initialize visible users when usersData changes
  useEffect(() => {
    const initialVisibility = usersData.reduce<{ [userId: string]: boolean }>((acc, user) => {
      acc[user.userId] = true;
      return acc;
    }, {});
    
    setVisibleUsers(initialVisibility);
  }, [usersData]);

  // Toggle map layer between standard and satellite view
  const toggleMapLayer = () => {
    if (!mapInstanceRef.current) return;
    
    if (mapLayer === 'standard') {
      // Switching to satellite
      setMapLayer('satellite');
      
      // Add satellite layer if it doesn't exist
      if (!satelliteLayerRef.current) {
        satelliteLayerRef.current = L.tileLayer(SATELLITE_MAP_URL, {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        });
      }
      
      // Add satellite layer to map
      if (mapInstanceRef.current) {
        satelliteLayerRef.current.addTo(mapInstanceRef.current);
      }
      
      // Remove standard layer from map if it exists
      if (standardLayerRef.current) {
        standardLayerRef.current.remove();
      }
    } else {
      // Switching to standard
      setMapLayer('standard');
      
      // Create standard layer if it doesn't exist
      if (!standardLayerRef.current) {
        standardLayerRef.current = L.tileLayer(STANDARD_MAP_URL, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        });
      }
      
      // Add standard layer to map
      if (mapInstanceRef.current) {
        standardLayerRef.current.addTo(mapInstanceRef.current);
      }
      
      // Remove satellite layer from map if it exists
      if (satelliteLayerRef.current) {
        satelliteLayerRef.current.remove();
      }
    }
    
    // Ensure the map refreshes properly
    if (mapInstanceRef.current) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  };
  
  // Toggle user visibility
  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers(prev => {
      const newVisibility = {
        ...prev,
        [userId]: !prev[userId]
      };
      
      // Update map markers and paths based on new visibility
      if (mapInstanceRef.current) {
        const marker = userMarkersRef.current[userId];
        const path = userPathsRef.current[userId];
        
        if (newVisibility[userId]) {
          // Show user
          if (marker && !mapInstanceRef.current.hasLayer(marker)) {
            marker.addTo(mapInstanceRef.current);
          }
          if (path && !mapInstanceRef.current.hasLayer(path)) {
            path.addTo(mapInstanceRef.current);
          }
        } else {
          // Hide user
          if (marker && mapInstanceRef.current.hasLayer(marker)) {
            marker.remove();
          }
          if (path && mapInstanceRef.current.hasLayer(path)) {
            path.remove();
          }
        }
      }
      
      return newVisibility;
    });
  };

  // Handle user selection
  const handleUserClick = (userId: string) => {
    if (onSelectUser) {
      onSelectUser(userId);
    }
  };

  // Draw all users on the map
  const updateUsersOnMap = () => {
    if (!mapInstanceRef.current || !mapReady) return;
    
    // Clear existing markers and paths
    Object.values(userMarkersRef.current).forEach(marker => marker.remove());
    Object.values(userPathsRef.current).forEach(path => path.remove());
    
    userMarkersRef.current = {};
    userPathsRef.current = {};
    
    // Add new markers and paths for each user
    usersData.forEach(userData => {
      if (!userData.lastLocation) return;
      
      const userId = userData.userId;
      const isSelected = selectedUserId === userId;
      const isVisible = visibleUsers[userId] !== false;
      const color = isSelected ? 'red' : getUserColor(userId);
      
      // Create marker for user's last position
      const position = userData.lastLocation.position;
      const marker = L.marker(position, {
        icon: DefaultIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      });
      
      // Add popup with user info
      const popupContent = `
        <div class="user-popup-content">
          <h3>${userData.userName || userData.email}</h3>
          <p>Email: ${userData.email}</p>
          <p>Last updated: ${new Date(userData.lastLocation.timestamp).toLocaleString()}</p>
          <p>Locations: ${userData.locations.length}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.on('click', () => handleUserClick(userId));
      
      // Store reference to marker
      userMarkersRef.current[userId] = marker;
      
      // Create path if user has more than one location
      if (userData.locations.length > 1) {
        const positions = userData.locations.map(loc => loc.position);
        const path = L.polyline(positions, {
          color: color,
          weight: isSelected ? 5 : 3,
          opacity: isSelected ? 0.8 : 0.6,
          lineJoin: 'round'
        });
        
        // Store reference to path
        userPathsRef.current[userId] = path;
        
        // Add to map if visible
        if (isVisible && mapInstanceRef.current) {
          path.addTo(mapInstanceRef.current);
        }
      }
      
      // Add to map if visible
      if (isVisible && mapInstanceRef.current) {
        marker.addTo(mapInstanceRef.current);
      }
    });
    
    // If there is a selected user, zoom to their path
    if (selectedUserId) {
      const selectedUser = usersData.find(u => u.userId === selectedUserId);
      if (selectedUser && selectedUser.locations.length > 0 && mapInstanceRef.current) {
        const positions = selectedUser.locations.map(loc => loc.position);
        mapInstanceRef.current.fitBounds(positions, { padding: [50, 50] });
      }
    } else if (usersData.length > 0) {
      // Fit all visible users in the view
      const visiblePositions: [number, number][] = [];
      usersData.forEach(userData => {
        if (visibleUsers[userData.userId] && userData.lastLocation) {
          visiblePositions.push(userData.lastLocation.position);
        }
      });
      
      if (visiblePositions.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(visiblePositions, { padding: [50, 50] });
      }
    }
  };

  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance with appropriate options
    const map = L.map(mapRef.current, {
      zoomControl: false, // We'll add custom zoom controls
      attributionControl: true,
      scrollWheelZoom: true,
      dragging: true,
      tap: true,
    }).setView([0, 0], 2);
    
    // Add standard tile layer
    standardLayerRef.current = L.tileLayer(STANDARD_MAP_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom controls in appropriate position with margin
    L.control.zoom({
      position: isMobile ? 'bottomright' : 'topright'
    }).addTo(map);

    // Store reference to map instance
    mapInstanceRef.current = map;
    setMapReady(true);

    // Handle window resize
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (standardLayerRef.current) {
        standardLayerRef.current = null;
      }
      
      if (satelliteLayerRef.current) {
        satelliteLayerRef.current = null;
      }
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      userMarkersRef.current = {};
      userPathsRef.current = {};
    };
  }, [isMobile]);

  // Update users on map when data changes
  useEffect(() => {
    if (mapReady && !isLoading) {
      updateUsersOnMap();
    }
  }, [usersData, mapReady, isLoading, selectedUserId, visibleUsers]);

  // Re-render map on container size changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [mapReady]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="w-full h-full"></div>
      
      {/* Map control buttons - Adjusted position for mobile */}
      <div className={`absolute ${isMobile ? 'bottom-20' : 'top-20'} right-4 z-[1000] flex flex-col gap-2`}>
        {/* Map Layer Toggle Button */}
        <button
          onClick={toggleMapLayer}
          className="bg-white p-2 rounded-md shadow-md flex items-center justify-center hover:bg-gray-100 focus:outline-none"
          title={mapLayer === 'standard' ? 'Switch to Satellite View' : 'Switch to Standard View'}
        >
          {mapLayer === 'standard' ? (
            <Layers className="h-5 w-5 text-gray-700" />
          ) : (
            <Map className="h-5 w-5 text-gray-700" />
          )}
        </button>
        
        {/* User List Toggle Button (Mobile Only) */}
        {isMobile && (
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="bg-white p-2 rounded-md shadow-md flex items-center justify-center hover:bg-gray-100 focus:outline-none"
            title={showUserList ? 'Hide User List' : 'Show User List'}
          >
            <User className="h-5 w-5 text-gray-700" />
            {showUserList ? (
              <ChevronDown className="h-3 w-3 ml-1 text-gray-500" />
            ) : (
              <ChevronUp className="h-3 w-3 ml-1 text-gray-500" />
            )}
          </button>
        )}
      </div>
      
      {/* User List - Responsive positioning and sizing */}
      {showUserList && (
        <div 
          className={`${
            isMobile 
              ? 'absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-md shadow-md p-3 max-h-[30vh] overflow-y-auto' 
              : 'absolute top-4 left-4 z-[1000] bg-white rounded-md shadow-md p-3 max-h-[calc(100vh-120px)] overflow-y-auto max-w-xs'
          }`}
        >
          <h3 className="font-bold text-lg mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>Users ({usersData.length})</span>
            </div>
            
            {/* Close button for mobile */}
            {isMobile && (
              <button 
                onClick={() => setShowUserList(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ChevronDown className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </h3>
          
          {usersData.length === 0 ? (
            <p className="text-sm text-gray-500">No users with location data</p>
          ) : (
            <ul className={`space-y-2 ${isMobile ? 'pb-1' : ''}`}>
              {usersData.map(user => (
                <li 
                  key={user.userId}
                  className={`p-2 rounded-md flex items-center justify-between cursor-pointer ${selectedUserId === user.userId ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}
                  onClick={() => handleUserClick(user.userId)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedUserId === user.userId ? 'red' : getUserColor(user.userId) }}
                    ></div>
                    <div>
                      <p className="font-medium text-sm">{user.userName || user.email.split('@')[0]}</p>
                      <p className="text-xs text-gray-500">{user.locations.length} points</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUserVisibility(user.userId);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title={visibleUsers[user.userId] ? 'Hide on map' : 'Show on map'}
                  >
                    {visibleUsers[user.userId] ? (
                      <Eye className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMapContainer; 