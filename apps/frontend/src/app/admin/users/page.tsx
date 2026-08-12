'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, UserCog } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await apiClient.get(`/users?page=${page}&limit=15`);
      setUsers(res.data.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  async function handleRoleChange(userId: string, newRole: string) {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  async function handleDelete(userId: string) {
    if (!window.confirm('Are you sure you want to ban/delete this user? This will anonymize their data.')) return;
    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">Name</th>
              <th className="p-4 font-medium text-muted-foreground">Email</th>
              <th className="p-4 font-medium text-muted-foreground">Role</th>
              <th className="p-4 font-medium text-muted-foreground">Status</th>
              <th className="p-4 font-medium text-muted-foreground">Joined</th>
              <th className="p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-muted">
                  <td className="p-4 font-medium">
                    {user.name}
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={!user.isActive}
                      className="border rounded px-2 py-1 text-sm bg-white disabled:opacity-50"
                    >
                      <option value="BUYER">BUYER</option>
                      <option value="BUSINESS">BUSINESS</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Deleted'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-3">
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      disabled={!user.isActive || user.role === 'ADMIN'}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30" 
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-border gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-muted-foreground">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
