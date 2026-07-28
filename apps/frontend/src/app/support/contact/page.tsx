'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';

export default function ContactPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    orderId: '',
    attachmentUrl: '',
    message: ''
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  // Fetch orders when subject is Order Issue
  useEffect(() => {
    if (formData.subject === 'Order Issue' && user) {
      setFetchingOrders(true);
      apiClient.get('/orders')
        .then(res => setOrders(res.data))
        .catch(err => console.error(err))
        .finally(() => setFetchingOrders(false));
    }
  }, [formData.subject, user]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };
      if (formData.orderId) payload.orderId = formData.orderId;
      if (formData.attachmentUrl) payload.attachments = [formData.attachmentUrl];

      await apiClient.post('/support-tickets', payload);
      setStatus('success');
      setFormData(prev => ({ ...prev, subject: '', message: '', orderId: '', attachmentUrl: '' }));
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12 md:py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you. Please fill out this form or shoot us an email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-8">Contact Info</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Email</p>
                    <p className="text-muted-foreground text-sm">support@smart24.com</p>
                    <p className="text-muted-foreground text-xs mt-1">We'll respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-4">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Phone</p>
                    <p className="text-muted-foreground text-sm">+880 1234 567890</p>
                    <p className="text-muted-foreground text-xs mt-1">Sat-Thu from 9am to 6pm.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Office</p>
                    <p className="text-muted-foreground text-sm">123 Business Avenue,<br/>Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border">
              {status === 'success' ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-success-bg text-success-text rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-4">Message Sent!</h3>
                  <p className="text-muted-foreground text-lg mb-8">
                    Thanks for reaching out. A member of our support team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-8 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                    <select
                      required
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
                    >
                      <option value="" disabled>Select a topic</option>
                      <option value="Order Issue">Order Issue</option>
                      <option value="Returns & Refunds">Returns & Refunds</option>
                      <option value="Product Inquiry">Product Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                    <textarea 
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {formData.subject === 'Order Issue' && user && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Select Order (Optional)</label>
                      <select
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
                      >
                        <option value="">-- I don't see my order / Not related to a specific order --</option>
                        {fetchingOrders ? (
                          <option disabled>Loading orders...</option>
                        ) : (
                          orders.map(order => (
                            <option key={order.id} value={order.id}>
                              Order #{order.id.substring(0,8).toUpperCase()} - ৳{order.totalAmount} ({new Date(order.createdAt).toLocaleDateString()})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Attachment / Image URL (Optional)</label>
                    <input 
                      type="url" 
                      name="attachmentUrl"
                      value={formData.attachmentUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="e.g., https://i.ibb.co/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Paste a link to your image (e.g. ImgBB, Google Drive)</p>
                  </div>
                  
                  {status === 'error' && (
                    <div className="p-4 bg-danger-bg text-destructive rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
