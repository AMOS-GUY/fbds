import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <nav className="bg-secondary text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">🛒 E-Commerce BF</Link>
        <div className="flex items-center space-x-4">
          <Link to="/products" className="hover:text-accent">Products</Link>
          <Link to="/request" className="hover:text-accent">Request Item</Link>
          <Link to="/cart" className="relative">🛒 Cart <span className="bg-accent text-white text-xs rounded-full px-2 absolute -top-2 -right-2">{cart.length}</span></Link>
          {user ? (
            <div className="flex items-center space-x-2">
              {user.role === 'admin' && <Link to="/admin" className="hover:text-accent">Admin</Link>}
              <span className="text-sm">{user.name}</span>
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
            </div>
          ) : (
            <div className="space-x-2">
              <Link to="/login" className="hover:text-accent">Login</Link>
              <Link to="/register" className="bg-primary px-3 py-1 rounded hover:bg-blue-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;