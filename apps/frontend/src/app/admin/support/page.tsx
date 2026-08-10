'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/context/AuthContext';
import { Loader2, Mail, MessageSquare, Clock, CheckCircle2, Trash2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  orderId?: string;
  attachments?: string[];
}

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function fetchTickets() {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const res = await apiClient.get(`/support-tickets?${params.toString()}`);
      
      // If the backend returned paginated data (has .data array)
      if (res.data && Array.isArray(res.data.data)) {
        setTickets(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      } else {
        // Fallback for old flat array
        setTickets(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, searchTerm, statusFilter]);

  async function updateStatus(id: string, status: string) {
    try {
      await apiClient.patch(`/support-tickets/${id}/status`, { status });
      fetchTickets(); // Refresh
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  async function deleteTicket(id: string) {
    if (!confirm('Are you sure you want to delete this support ticket?')) return;
    try {
      await apiClient.delete(`/support-tickets/${id}`);
      fetchTickets(); // Refresh
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('Failed to delete ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-danger-bg text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-success-bg text-green-800';
      case 'CLOSED': return 'bg-muted text-foreground';
      default: return 'bg-muted text-foreground';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary/90" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
      </div>

      <div className="bg-white p-4 rounded-t-lg border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets by subject, name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 text-sm font-semibold text-muted-foreground">Ticket Details</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Customer</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No support tickets found.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-md mt-1">{ticket.message}</p>
                          {ticket.orderId && (
                            <p className="text-xs text-primary/90 font-medium mt-2">
                              Linked Order: #{ticket.orderId.substring(0,8).toUpperCase()}
                            </p>
                          )}
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {ticket.attachments.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs bg-muted text-foreground px-2 py-1 rounded hover:bg-muted/80">
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-foreground">{ticket.name}</p>
                      <a href={`mailto:${ticket.email}`} className="text-sm text-primary/90 flex items-center gap-1 mt-1 hover:underline">
                        <Mail className="w-3 h-3" />
                        {ticket.email}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => updateStatus(ticket.id, e.target.value)}
                          className="text-sm border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="p-1.5 text-destructive hover:bg-danger-bg rounded-lg transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted">
            <span className="text-sm text-muted-foreground">
              Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
