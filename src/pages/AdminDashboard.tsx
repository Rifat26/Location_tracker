import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminMapContainer from "@/components/AdminMapContainer";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  RefreshCw, 
  Shield, 
  User, 
  Users,
  X 
} from "lucide-react";
import { 
  checkIsAdmin, 
  getAllUsersLocationHistory, 
  getUserLocationHistory,
  UserLocationData
} from "@/services/adminService";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [usersData, setUsersData] = useState<UserLocationData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<number>(1); // days
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Check if user is admin on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }
      
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
      
      if (!adminStatus) {
        navigate('/dashboard');
      } else {
        // Load initial data
        loadUserData();
      }
    };
    
    verifyAdmin();
  }, [user, navigate]);

  // Load user location data
  const loadUserData = async () => {
    setLoading(true);
    
    try {
      const data = await getAllUsersLocationHistory(timePeriod);
      setUsersData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Handle user selection
  const handleSelectUser = async (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      return;
    }
    
    setSelectedUserId(userId);
    
    try {
      // Get detailed history for selected user
      const history = await getUserLocationHistory(userId, timePeriod);
      
      // Update the selected user's history in the usersData state
      setUsersData(prevData => 
        prevData.map(userData => 
          userData.userId === userId 
            ? { ...userData, locations: history } 
            : userData
        )
      );
    } catch (error) {
      console.error('Error loading user history:', error);
    }
  };

  // Change time period filter
  const handleTimePeriodChange = (days: number) => {
    setTimePeriod(days);
    // Reset selected user
    setSelectedUserId(null);
    // Load new data with the new time period
    loadUserData();
  };

  // If not admin or still loading admin status, show loading
  if (loading && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Render user details sidebar/modal based on device type
  const renderUserDetails = () => {
    if (!selectedUserId) return null;

    const userData = usersData.find(u => u.userId === selectedUserId);
    if (!userData) return null;

    const content = (
      <>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            User Details
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUserId(null)}
            className="h-8 w-8 p-0 rounded-full"
          >
            {isMobile ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        
        <h3 className="font-bold text-xl mb-2">{userData.userName || userData.email.split('@')[0]}</h3>
        <p className="text-gray-600 mb-4">{userData.email}</p>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Location Points</h4>
            <p className="text-2xl font-bold">{userData.locations.length}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-sm text-gray-700 mb-1">Last Update</h4>
            <p className="text-sm">
              {userData.lastLocation 
                ? new Date(userData.lastLocation.timestamp).toLocaleString() 
                : 'No data'
              }
            </p>
          </div>
          
          {userData.locations.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-sm text-gray-700 mb-1">Location History</h4>
              <div className="max-h-48 overflow-y-auto mt-2">
                {userData.locations.map((loc, index) => (
                  <div key={index} className="text-xs py-1 border-t border-gray-100 first:border-t-0">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {new Date(loc.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-mono">
                        {loc.position[0].toFixed(5)}, {loc.position[1].toFixed(5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );

    if (isMobile) {
      // Full-height bottom sheet for mobile
      return (
        <div className="fixed inset-x-0 bottom-0 z-[1001] bg-white rounded-t-xl shadow-lg" 
             style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="p-4">
            {/* Visual handle for the modal */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            {content}
          </div>
        </div>
      );
    } else {
      // Sidebar for desktop
      return (
        <div className="absolute right-4 top-32 bottom-4 w-80 bg-white rounded-lg shadow-lg z-[1000] overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            {content}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          
          {!isMobile && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{usersData.length} users</span>
              </div>
              
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile-only controls in a second row */}
        {isMobile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{usersData.length} users</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''} mr-1`} />
                <span className="text-xs">Refresh</span>
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <Filter className="h-3 w-3 mr-1" />
                <span className="text-xs">Filters</span>
              </Button>
            </div>
          </div>
        )}
      </header>
      
      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-3 shadow-sm">
          <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-4`}>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Time Period:</span>
            </div>
            
            <div className={`flex items-center gap-2 ${isMobile ? 'flex-wrap mt-2' : ''}`}>
              {[
                { label: "Today", days: 1 },
                { label: "3 Days", days: 3 },
                { label: "Week", days: 7 },
                { label: "Month", days: 30 }
              ].map(period => (
                <Button
                  key={period.days}
                  onClick={() => handleTimePeriodChange(period.days)}
                  variant={timePeriod === period.days ? "default" : "outline"}
                  size={isMobile ? "sm" : undefined}
                  className={`${timePeriod === period.days ? "bg-blue-600" : ""} ${isMobile ? "flex-1" : ""}`}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Loading location data...</p>
            </div>
          </div>
        ) : (
          <AdminMapContainer 
            usersData={usersData}
            isLoading={loading}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
        )}
      </div>
      
      {/* User Details Sidebar/Modal */}
      {renderUserDetails()}
    </div>
  );
};

export default AdminDashboard; 