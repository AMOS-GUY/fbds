import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm">{product.category}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-primary font-bold">{product.price} XOF</span>
          <Link to={`/products/${product._id}`} className="text-sm text-blue-600 hover:underline">View</Link>
        </div>
        <button onClick={() => addToCart(product)} className="btn-primary w-full mt-3">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;