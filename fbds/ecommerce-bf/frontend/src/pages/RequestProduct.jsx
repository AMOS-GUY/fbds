import { useState } from 'react';
import api from '../services/api';

const RequestProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products/request', { name, description, category });
      setMsg(res.data.msg);
      setName(''); setDescription(''); setCategory('');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Request failed');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Request a Product</h2>
      {msg && <p className="text-green-600 mb-2">{msg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-field" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input-field" placeholder="Description/Link" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="input-field" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <button type="submit" className="btn-primary w-full">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestProduct;