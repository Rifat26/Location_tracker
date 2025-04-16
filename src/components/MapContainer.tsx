import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useIsMobile } from "@/hooks/use-mobile";
import { Layers, Map, History } from "lucide-react";

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
`;

interface LocationData {
  position: [number, number];
  accuracy: number;
}

interface LocationHistoryPoint {
  position: [number, number];
  timestamp: number;
}

interface MapContainerProps {
  locationData: LocationData | null;
  isLoading: boolean;
  locationHistory?: LocationHistoryPoint[];
  showHistory?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  locationData, 
  isLoading, 
  locationHistory = [],
  showHistory = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const standardLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const pathLayerRef = useRef<L.Polyline | null>(null);
  const isMobile = useIsMobile();
  const [mapReady, setMapReady] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('standard');
  const [showPath, setShowPath] = useState(showHistory);

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
    if (mapInstanceRef.current && locationData) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          // Re-center the map on the current location
          const { position } = locationData;
          const zoomLevel = isMobile ? 14 : 15;
          mapInstanceRef.current.setView(position, zoomLevel);
          
          // Update marker and circle on layer switch to ensure they remain visible
          updateLocationMarker(locationData);

          // Redraw path if active
          if (showPath && locationHistory.length > 0) {
            drawLocationPath();
          }
        }
      }, 100);
    }
  };
  
  // Toggle history path visibility
  const toggleHistoryPath = () => {
    setShowPath(!showPath);
    
    if (!showPath) {
      // Path is being turned on
      drawLocationPath();
    } else {
      // Path is being turned off
      removeLocationPath();
    }
  };

  // Draw location history path on the map
  const drawLocationPath = () => {
    if (!mapInstanceRef.current || locationHistory.length < 2) return;
    
    // Remove existing path if any
    removeLocationPath();
    
    // Extract positions from location history
    const positions = locationHistory.map(point => point.position);
    
    // Create polyline
    pathLayerRef.current = L.polyline(positions, {
      color: 'red',
      weight: 4,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(mapInstanceRef.current);
    
    // Fit map bounds to show the entire path if we have enough points
    if (positions.length > 1) {
      mapInstanceRef.current.fitBounds(positions);
    }
  };
  
  // Remove location history path from the map
  const removeLocationPath = () => {
    if (pathLayerRef.current && mapInstanceRef.current) {
      pathLayerRef.current.remove();
      pathLayerRef.current = null;
    }
  };
  
  // Helper function to update location marker and circle
  const updateLocationMarker = (locData: LocationData) => {
    if (!mapInstanceRef.current) return;
    
    const { position, accuracy } = locData;
    
    // Always remove existing marker and circle before creating new ones
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
    
    // Create new marker
    markerRef.current = L.marker(position, {
      icon: DefaultIcon,
      zIndexOffset: 1000,
    }).addTo(mapInstanceRef.current);
    
    // Create new accuracy circle
    circleRef.current = L.circle(position, {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.1,
      radius: accuracy,
      weight: 2,
    }).addTo(mapInstanceRef.current);
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

    // Make sure map renders properly by triggering a resize after a short delay
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);

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
      
      if (markerRef.current) {
        markerRef.current = null;
      }
      
      if (circleRef.current) {
        circleRef.current = null;
      }
      
      if (pathLayerRef.current) {
        pathLayerRef.current = null;
      }
    };
  }, [isMobile]);

  // Update map when location data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !locationData || !mapReady) return;
    
    const { position, accuracy } = locationData;
    const [lat, lon] = position;
    
    // Update map view with appropriate zoom level - desktop needs higher zoom
    const zoomLevel = isMobile ? 14 : 15;
    mapInstanceRef.current.setView([lat, lon], zoomLevel);

    // Update location marker and circle
    updateLocationMarker(locationData);

    // Force a map redraw to ensure everything is visible
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
    
  }, [locationData, isLoading, isMobile, mapReady]);

  // Update location history path when history changes or visibility toggled
  useEffect(() => {
    if (showPath && locationHistory.length > 0 && mapReady) {
      drawLocationPath();
    } else if (!showPath) {
      removeLocationPath();
    }
  }, [locationHistory, showPath, mapReady]);

  // Re-render map on container size changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        
        // If we have a marker and the map changes size, make sure it remains visible
        if (markerRef.current && locationData) {
          const { position } = locationData;
          mapInstanceRef.current.setView(position, isMobile ? 14 : 15);
        }
      }
    });
    
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [mapReady, isMobile, locationData]);

  return (
    <div ref={mapRef} className="w-full h-full relative">
      {/* Map control buttons */}
      <div className="absolute mx-6 my-5 top-20 right-9 z-[1000] flex flex-col gap-2">
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
        
        {/* History Path Toggle Button (only shown if history exists) */}
        {locationHistory.length > 1 && (
          <button
            onClick={toggleHistoryPath}
            className={`p-2 rounded-md shadow-md flex items-center justify-center focus:outline-none ${
              showPath ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
            }`}
            title={showPath ? 'Hide Location History' : 'Show Location History'}
          >
            <History className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MapContainer;
