import React, { useEffect, useState } from "react";
import useLocationTracker from "@/hooks/useLocationTracker";
import MapContainer from "@/components/MapContainer";
import LocationDetails from "@/components/LocationDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { position, accuracy, loading, error, locationHistory, updating, updateLocation } = useLocationTracker();
  const isMobile = useIsMobile();
  const [navbarHeight, setNavbarHeight] = useState(64); // Default navbar height
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showHistoryPath, setShowHistoryPath] = useState(false);

  // Get actual navbar height after component mounts
  useEffect(() => {
    const navbar = document.querySelector('nav');
    if (navbar) {
      const height = navbar.getBoundingClientRect().height;
      setNavbarHeight(height);
    }

    // Re-measure on window resize
    const handleResize = () => {
      if (navbar) {
        const height = navbar.getBoundingClientRect().height;
        setNavbarHeight(height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set last updated time when location is first loaded or manually updated
  useEffect(() => {
    if (!loading && !updating && position[0] !== 0) {
      setLastUpdated(new Date());
    }
  }, [loading, updating, position]);

  // Format the last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Just now";
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
    }
  };

  // Handle manual location update
  const handleUpdateLocation = () => {
    updateLocation();
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleHistoryPath = () => {
    setShowHistoryPath(!showHistoryPath);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading location data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 sm:py-24 md:py-32" 
           style={{ minHeight: `calc(100vh - ${navbarHeight}px)` }}>
        <div className="w-full max-w-md bg-red-50 rounded-lg p-5 sm:p-6 text-center shadow-sm border border-red-200">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-red-600">Location Error</h1>
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg sm:text-xl text-red-700 mb-2">{error}</p>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Please ensure location services are enabled in your browser.
          </p>
          <div className="mt-6">
            <Button 
              onClick={handleUpdateLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div 
        className="flex flex-col h-full overflow-hidden"
        style={{ height: `calc(100vh - ${navbarHeight}px)` }}
      >
        {/* Map Container - Fixed height on mobile */}
        <div className="h-[60vh] w-full relative">
          <MapContainer 
            locationData={position[0] !== 0 ? { position, accuracy } : null}
            isLoading={loading}
            locationHistory={locationHistory}
            showHistory={showHistoryPath}
          />
          
          {/* Update Location Button */}
          <div className="absolute bottom-20 left-4 z-[1001]">
            <Button 
              onClick={handleUpdateLocation} 
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-1.5 px-3 py-2"
              size="sm"
            >
              {updating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Update Location</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Collapsible Details Section */}
        {position[0] !== 0 && (
          <div className="flex-1 w-full bg-white border-t border-gray-200 overflow-hidden flex flex-col">
            {/* Header with toggle button */}
            <div 
              className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer"
              onClick={toggleDetails}
            >
              <h3 className="font-medium text-gray-800">Location Details</h3>
              <button className="text-gray-500 focus:outline-none">
                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {/* Scrollable content */}
            {showDetails && (
              <div className="flex-1 overflow-y-auto p-3">
                <LocationDetails 
                  position={position} 
                  accuracy={accuracy} 
                  className="w-full mt-0"
                  updating={updating}
                  lastUpdated={formatLastUpdated()}
                />
                
                {/* Location History */}
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Location History</h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Current position logged at {lastUpdated ? new Date(lastUpdated.getTime()).toLocaleTimeString() : 'Unknown time'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Latitude: {position[0].toFixed(6)}</p>
                    <p className="text-xs text-gray-500">Longitude: {position[1].toFixed(6)}</p>
                    
                    {user ? (
                      <>
                        <p className="text-xs text-gray-500 mt-2">
                          {locationHistory.length} location points saved for your account.
                        </p>
                        <div className="mt-3">
                          <Button
                            onClick={toggleHistoryPath}
                            size="sm"
                            variant={showHistoryPath ? "destructive" : "outline"}
                            className="w-full flex items-center justify-center gap-2"
                          >
                            <History className="h-4 w-4" />
                            {showHistoryPath ? "Hide Path" : "Show Daily Path"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 mt-2">Sign in to track and save your location history.</p>
                    )}
                  </div>
                </div>
                
                {/* Map Options */}
                <div className="mt-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Map Options</h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">You can toggle between standard and satellite map views using the button in the top-right corner of the map.</p>
                    <p className="text-xs text-gray-500 mt-2">
                      • Standard view shows streets and landmarks.
                    </p>
                    <p className="text-xs text-gray-500">
                      • Satellite view shows aerial imagery.
                    </p>
                  </div>
                </div>

                {/* Accuracy Information */}
                <div className="mt-4 mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Accuracy Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-600">Your location is accurate to within {accuracy.toFixed(0)} meters.</p>
                    <p className="text-xs text-gray-500 mt-2">
                      The blue circle on the map represents the accuracy radius of your current position.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      className="h-full w-full flex relative overflow-auto" 
      style={{ height: `calc(100vh - ${navbarHeight}px)` }}
    >
      {/* Main Map Container */}
      <div className="flex-1 relative">
        <MapContainer 
          locationData={position[0] !== 0 ? { position, accuracy } : null}
          isLoading={loading}
          locationHistory={locationHistory}
          showHistory={showHistoryPath}
        />
        
        {/* Desktop Update Location Button */}
        <div className="absolute bottom-5 left-20 z-[1001]">
          <Button 
            onClick={handleUpdateLocation} 
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md px-4 py-2 flex items-center gap-2"
          >
            {updating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Updating Location...</span>
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5" />
                <span>Update Location</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Side Panel */}
      {position[0] !== 0 && (
        <div className="absolute top-4 left-4 z-[1000] max-h-[calc(100vh-96px)] overflow-y-auto">
          <div className="max-w-xs">
            <LocationDetails 
              position={position} 
              accuracy={accuracy} 
              className="shadow-xl"
              updating={updating}
              lastUpdated={formatLastUpdated()}
            />
            
            {/* Location History Panel */}
            {user && locationHistory.length > 0 && (
              <div className="mt-3 bg-white rounded-lg p-3 shadow-xl border border-gray-200">
                <h3 className="font-bold text-blue-800 mb-2 text-left text-sm">Location History</h3>
                <p className="text-xs text-gray-600 mb-2">
                  You have {locationHistory.length} location points tracked today.
                </p>
                <Button
                  onClick={toggleHistoryPath}
                  size="sm"
                  variant={showHistoryPath ? "destructive" : "outline"}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <History className="h-4 w-4" />
                  {showHistoryPath ? "Hide Path" : "Show Daily Path"}
                </Button>
              </div>
            )}
            
            {/* Map Options Info */}
            <div className="mt-3 bg-white rounded-lg p-3 shadow-xl border border-gray-200">
              <h3 className="font-bold text-blue-800 mb-2 text-left text-sm">Map Options</h3>
              <p className="text-xs text-gray-600">
                Toggle between standard and satellite views using the button in the top-right corner of the map.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
