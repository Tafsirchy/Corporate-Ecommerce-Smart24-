'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export const dynamic = 'force-dynamic';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/audit-log');
      setLogs(res.data);
    } catch (err: any) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-border">
          <table className="w-full text-left">
            <thead className="bg-muted text-sm font-medium">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Admin ID</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Type</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-xs font-mono">{log.adminId}</td>
                  <td className="p-4 font-semibold text-primary">{log.action}</td>
                  <td className="p-4">{log.targetType}</td>
                  <td className="p-4 text-xs font-mono">{log.targetId}</td>
                  <td className="p-4">{log.reason || 'N/A'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
