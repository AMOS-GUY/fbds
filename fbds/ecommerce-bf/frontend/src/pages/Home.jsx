import { Link } from 'react-router-dom';

const Home = () => (
  <div className="text-center py-16">
    <h1 className="text-4xl font-bold mb-4">Order from China to Burkina Faso</h1>
    <p className="text-gray-600 max-w-2xl mx-auto mb-6">Discover quality products, request unavailable items, and pay securely via WhatsApp, WeChat, or Cash on Delivery.</p>
    <div className="space-x-4">
      <Link to="/products" className="btn-primary">Browse Products</Link>
      <Link to="/request" className="btn-primary bg-accent hover:bg-yellow-600">Request a Product</Link>
    </div>
  </div>
);

export default Home;