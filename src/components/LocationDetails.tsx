import React from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { RefreshCw, Clock } from "lucide-react";

interface LocationDetailsProps {
  position: [number, number];
  accuracy: number;
  className?: string;
  updating?: boolean;
  lastUpdated?: string;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({ 
  position, 
  accuracy, 
  className = "", 
  updating = false,
  lastUpdated = "Just now"
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`rounded-lg p-3 sm:p-4 bg-white shadow-lg border border-gray-200 ${className}`}>
      <h3 className="font-bold text-blue-800 mb-2 text-left text-sm sm:text-base flex items-center gap-2">
        Location Details
        {updating && <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="w-full">
          <p className="text-xs sm:text-sm font-medium text-left">
            <span className="text-gray-500">Latitude:</span> 
            <span className="text-gray-700 ml-1 break-words">{position[0].toFixed(6)}</span>
          </p>
        </div>
        <div className="w-full">
          <p className="text-xs sm:text-sm font-medium text-left">
            <span className="text-gray-500">Longitude:</span>
            <span className="text-gray-700 ml-1 break-words">{position[1].toFixed(6)}</span>
          </p>
        </div>
      </div>
      <p className="text-xs sm:text-sm font-medium text-left mt-1 pt-1 border-t border-gray-100">
        <span className="text-gray-500">Accuracy:</span>
        <span className="text-gray-700 ml-1">±{accuracy.toFixed(0)} meters</span>
      </p>
      
      {updating ? (
        <p className="text-xs text-blue-500 mt-1 animate-pulse flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Updating location...
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
};

export default LocationDetails;
