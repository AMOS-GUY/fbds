import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data));
    api.get('/products').then(res => setRequests(res.data.filter(p => p.status === 'requested')));
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status: { status } });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Product Requests</h3>
        {requests.length === 0 ? <p>No requests.</p> : requests.map(r => (
          <div key={r._id} className="border-b py-2">{r.name} - {r.category} (Requested by {r.requestedBy.length} users)</div>
        ))}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Orders</h3>
        {orders.map(o => (
          <div key={o._id} className="border-b py-2 flex justify-between items-center">
            <div>
              <p><strong>ID:</strong> {o._id}</p>
              <p><strong>Total:</strong> {o.total} XOF | <strong>Method:</strong> {o.paymentMethod}</p>
              <p><strong>Status:</strong> {o.status}</p>
            </div>
            <select className="input-field w-40" value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
              <option value="pending_payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;