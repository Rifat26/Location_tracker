
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import emailjs from '@emailjs/browser';

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("qm0eKZLNmh8IY_UQL");
  }, []);
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Have questions about our services? Our team is here to help you with any inquiries.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <p className="font-medium">Error</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
            <form className="space-y-6" onSubmit={(e) => {
              setErrorMessage(null);
              e.preventDefault();
              
              // Basic validation
              if (!name || !email || !message) {
                toast({
                  title: "Error",
                  description: "Please fill in all fields",
                  variant: "destructive"
                });
                return;
              }
              
              setLoading(true);
              
              // Log form data for debugging
              console.log('Sending form data:', {
                from_name: name,
                from_email: email,
                message
              });
              
              // Prepare template parameters
              const templateParams = {
                from_name: name,
                from_email: email,
                message: message,
                to_email: "mahmudurrahmanrifat96@gmail.com"
              };
              
              // Send email using EmailJS
              emailjs
                .send(
                  'service_joi3ism', 
                  'template_oxw6a6u', 
                  templateParams
                )
                .then(
                  () => {
                    // Reset form
                    setName('');
                    setEmail('');
                    setMessage('');
                    
                    // Show success message
                    toast({
                      title: "Success",
                      description: "Your message has been sent successfully!",
                      variant: "default"
                    });
                    setLoading(false);
                  },
                  (error) => {
                    console.error('Email sending failed:', error);
                    const errorMsg = error.text || 'Unknown error occurred';
                    setErrorMessage(`Failed to send message: ${errorMsg}. Please try again later.`);
                    toast({
                      title: "Error",
                      description: `Failed to send message: ${errorMsg}`,
                      variant: "destructive"
                    });
                    setLoading(false);
                  }
                );
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="from_name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="from_email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="Your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <div>
                <Button 
                  type="submit" 
                  className="w-full bg-brand-blue hover:bg-brand-teal text-white py-6 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
