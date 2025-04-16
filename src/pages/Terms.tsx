import React from "react";
import { Link } from "react-router-dom";

const Terms: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-brand-blue">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Welcome to LocationTracker. These terms and conditions outline the rules and regulations for the use of our website and services.
          </p>
          
          <p className="text-gray-600 mb-6">
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use LocationTracker if you do not accept all of the terms and conditions stated on this page.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">1. License to Use</h2>
          <p className="text-gray-600 mb-4">
            Unless otherwise stated, LocationTracker and/or its licensors own the intellectual property rights for all material on LocationTracker. All intellectual property rights are reserved. You may view and/or print pages from our website for your own personal use subject to restrictions set in these terms and conditions.
          </p>
          
          <p className="text-gray-600 mb-6">You must not:</p>
          <ul className="list-disc pl-6 mb-6 text-gray-600">
            <li>Republish material from this website</li>
            <li>Sell, rent or sub-license material from this website</li>
            <li>Reproduce, duplicate or copy material from this website</li>
            <li>Redistribute content from LocationTracker (unless content is specifically made for redistribution)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">2. User Account</h2>
          <p className="text-gray-600 mb-4">
            When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the service.
          </p>
          
          <p className="text-gray-600 mb-4">
            You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">3. Privacy Policy</h2>
          <p className="text-gray-600 mb-4">
            Your privacy is important to us. It is LocationTracker's policy to respect your privacy regarding any information we may collect from you across our website. We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
          </p>
          
          <p className="text-gray-600 mb-4">
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">4. Location Data</h2>
          <p className="text-gray-600 mb-4">
            LocationTracker collects and processes location data when you use our services. This data is used to provide you with location-based features and services. We do not share your precise location data with third parties without your explicit consent.
          </p>
          
          <p className="text-gray-600 mb-4">
            You can control the collection and use of your location data through your device settings and permissions. Please note that disabling location services may affect the functionality of certain features of our application.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">5. Limitations</h2>
          <p className="text-gray-600 mb-4">
            In no event shall LocationTracker be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LocationTracker's website, even if LocationTracker or a LocationTracker authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">6. Governing Law</h2>
          <p className="text-gray-600 mb-4">
            These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">7. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            LocationTracker reserves the right to modify these terms of service at any time. We will notify users of any changes by posting the new terms and conditions on this page. Changes are effective immediately after they are posted on this page.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">8. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-600">
            <li>By email: support@locationtracker.com</li>
            <li>By visiting our <Link to="/contact" className="text-brand-blue hover:underline">contact page</Link></li>
          </ul>
          
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Last updated: April 3, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
