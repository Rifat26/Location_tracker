import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkIsAdmin } from "@/services/adminService";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Check if user is admin
  useEffect(() => {
    const verifyAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MapPin className="h-8 w-8 text-brand-blue" />
              <span className="ml-2 text-xl font-bold text-brand-dark">LocationTracker</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`text-gray-600 hover:text-brand-blue transition-colors px-3 py-2 ${
                location.pathname === '/' ? 'font-medium text-brand-blue' : ''
              }`}
            >
              Home
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`text-gray-600 hover:text-brand-blue transition-colors px-3 py-2 ${
                  location.pathname === '/dashboard' ? 'font-medium text-brand-blue' : ''
                }`}
              >
                Dashboard
              </Link>
            )}
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1 text-gray-600 hover:text-brand-blue transition-colors px-3 py-2 ${
                  location.pathname === '/admin' ? 'font-medium text-brand-blue' : ''
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Link 
              to="/contact" 
              className={`text-gray-600 hover:text-brand-blue transition-colors px-3 py-2 ${
                location.pathname === '/contact' ? 'font-medium text-brand-blue' : ''
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Authentication buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center mr-2">
                  <User className="h-5 w-5 text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  className="border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline" className="border-brand-blue text-brand-blue hover:text-brand-blue hover:bg-blue-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-brand-blue hover:bg-brand-teal text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button - Explicitly visible on mobile */}
          <div className="block md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-8 w-8" />
              ) : (
                <Menu className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Full screen overlay */}
      {isMobile && (
        <div 
          className={`fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '64px' }}
        >
          <div className="h-full overflow-y-auto pb-20">
            <div className="px-4 pt-4 space-y-3">
              <Link
                to="/"
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === '/' 
                    ? 'bg-blue-50 text-brand-blue' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'
                }`}
              >
                Home
              </Link>
              
              {user && (
                <Link
                  to="/dashboard"
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'bg-blue-50 text-brand-blue' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              
              {user && isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1 text-gray-700 py-2 hover:text-brand-blue ${
                    location.pathname === '/admin' ? 'text-brand-blue font-medium' : ''
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              <Link
                to="/contact"
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === '/contact' 
                    ? 'bg-blue-50 text-brand-blue' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-blue'
                }`}
              >
                Contact
              </Link>
            </div>
            
            <div className="px-4 pt-5 pb-3 border-t border-gray-200 mt-5">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center px-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="ml-3 text-base font-medium text-gray-700 truncate">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/signin" className="block w-full">
                    <Button variant="outline" className="w-full border-brand-blue text-brand-blue hover:text-brand-blue hover:bg-blue-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="block w-full mt-3">
                    <Button className="w-full bg-brand-blue hover:bg-brand-teal text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
