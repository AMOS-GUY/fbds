import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = cart.map(i => ({ product: i._id, quantity: i.quantity, price: i.price }));
    try {
      await api.post('/orders', { items, total, paymentMethod, shippingAddress: address, phone });
      clearCart();
      alert('Order placed successfully! Check your WhatsApp/Email for updates.');
      navigate('/');
    } catch (err) {
      alert('Failed to place order.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-field" placeholder="Full Address" value={address} onChange={e => setAddress(e.target.value)} required />
        <input className="input-field" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="cod">Cash on Delivery</option>
          <option value="whatsapp">Pay via WhatsApp</option>
          <option value="wechat">Pay via WeChat</option>
        </select>
        <div className="font-bold text-lg">Total: {total} XOF</div>
        <button type="submit" className="btn-primary w-full">Place Order</button>
      </form>
    </div>
  );
};

export default Checkout;