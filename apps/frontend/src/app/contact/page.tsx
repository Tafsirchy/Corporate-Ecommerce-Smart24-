'use client';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    try {
      // In production, use process.env.NEXT_PUBLIC_API_URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success('Thank you! Your message has been sent. We will get back to you shortly.');
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Contact Us</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question about our business packages? Need a custom quotation? We'd love to hear from you.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-8">Get in Touch</h3>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary/90" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">Our Office</h4>
                  <p className="mt-1 text-muted-foreground">Level 4, Corporate Heights<br />Banani, Dhaka 1213<br />Bangladesh</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary/90" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">Phone</h4>
                  <p className="mt-1 text-muted-foreground">+880 1XXX-XXXXXX<br />+880 2-XXXXXXX</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary/90" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-foreground">Email</h4>
                  <p className="mt-1 text-muted-foreground">business@smart24.com.bd<br />support@smart24.com.bd</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-primary-50 p-6 rounded-xl border border-primary-100">
              <h4 className="text-lg font-medium text-primary-900 mb-2">Business Sales Hours</h4>
              <p className="text-primary-800">Sunday - Thursday: 9:00 AM to 6:00 PM</p>
              <p className="text-primary-800">Friday & Saturday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 sm:p-10">
            <h3 className="text-2xl font-bold text-foreground mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">Full Name</label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" required className="block w-full rounded-md border-border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border" />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-foreground">Company Name</label>
                <div className="mt-1">
                  <input type="text" name="company" id="company" className="block w-full rounded-md border-border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
                <div className="mt-1">
                  <input type="email" name="email" id="email" required className="block w-full rounded-md border-border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground">Phone Number</label>
                <div className="mt-1">
                  <input type="tel" name="phone" id="phone" className="block w-full rounded-md border-border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground">Message</label>
                <div className="mt-1">
                  <textarea id="message" name="message" rows={4} required className="block w-full rounded-md border-border shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"></textarea>
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
