'use client';
import { OptimizedImage } from '@/components/ui/OptimizedImage';


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

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="min-h-screen bg-muted py-8 md:py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-[1.6]">
            We'd love to hear from you. Please fill out this form or shoot us an email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4 leading-[1.5]">Contact Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5 leading-[1.4]">Email</p>
                    <p className="text-muted-foreground text-sm leading-[1.6]">support@smart24.com</p>
                    <p className="text-muted-foreground text-xs mt-1">We'll respond within 24 hours.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-3">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5 leading-[1.4]">Phone</p>
                    <p className="text-muted-foreground text-sm leading-[1.6]">+880 1234 567890</p>
                    <p className="text-muted-foreground text-xs mt-1">Sat-Thu from 9am to 6pm.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary/90 flex-shrink-0 mr-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5 leading-[1.4]">Office</p>
                    <p className="text-muted-foreground text-sm leading-[1.6]">123 Business Avenue,<br/>Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border">
              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-success-bg text-success-text rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2 leading-[1.5]">Message Sent!</h3>
                  <p className="text-muted-foreground text-lg mb-6 leading-[1.6]">
                    Thanks for reaching out. A member of our support team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2.5 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Your Name</label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Email Address</label>
                      <input 
                        required
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Subject</label>
                    <select
                      required
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
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
                    <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Message</label>
                    <textarea 
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {formData.subject === 'Order Issue' && user && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Select Order (Optional)</label>
                      <select
                        name="orderId"
                        value={formData.orderId}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none bg-white"
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
                    <label className="block text-sm font-medium text-foreground mb-1.5 leading-[1.4]">Attachment Image (Optional)</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          setFormData(prev => ({ ...prev, attachmentUrl: objectUrl }));
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {formData.attachmentUrl && (
                      <div className="mt-3">
                        <OptimizedImage src={formData.attachmentUrl} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px' }} 
                          className="rounded border" />
                      </div>
                    )}
                  </div>
                  
                  {status === 'error' && (
                    <div className="p-3 bg-danger-bg text-destructive rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 mt-4"
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
