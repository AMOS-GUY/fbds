import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, total } = useCart();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          {cart.map(item => (
            <div key={item._id} className="flex justify-between items-center py-2 border-b">
              <span>{item.name} x{item.quantity}</span>
              <span>{item.price * item.quantity} XOF</span>
              <button onClick={() => removeFromCart(item._id)} className="text-red-500">Remove</button>
            </div>
          ))}
          <div className="flex justify-between mt-4 text-xl font-bold">
            <span>Total:</span>
            <span>{total} XOF</span>
          </div>
          <Link to="/checkout" className="btn-primary mt-4 inline-block">Proceed to Checkout</Link>
        </>
      )}
    </div>
  );
};

export default Cart;