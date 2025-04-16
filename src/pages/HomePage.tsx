
import React from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Zap, BarChart, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-brand-teal py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
                Track Location With Precision
              </h1>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                Real-time location tracking solutions for individuals and businesses. 
                Simple, secure, and accurate.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                
                <Button variant="outline" className="border-white text-black hover:bg-white/10 text-lg px-8 py-6" asChild>
                  <Link to="/contact">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md relative">
                <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 transform rotate-3">
                  <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-brand-blue" />
                    <span className="sr-only">Location map illustration</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-brand-blue rounded-lg shadow-xl p-4 md:p-8 transform -rotate-3">
                  <div className="bg-white/10 rounded-lg aspect-video w-32 md:w-48 flex items-center justify-center">
                    <span className="font-bold text-xl md:text-2xl">Accurate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Tracking Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive location tracking platform provides everything you need to monitor 
              and manage locations effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <MapPin className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">
                Track locations in real-time with high accuracy and minimal battery consumption.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                End-to-end encryption ensures your location data stays private and secure.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Low Power Consumption</h3>
              <p className="text-gray-600">
                Optimized algorithms that minimize battery usage while maintaining accuracy.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <BarChart className="h-6 w-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Gain insights with detailed reports and analytics on location history.
              </p>
            </div>
            
            {/* More features */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Family Sharing</h3>
              <p className="text-gray-600">
                Share location with family members and create safe zones for added security.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Mobile Apps</h3>
              <p className="text-gray-600">
                Available on iOS and Android with seamless cross-platform synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
