import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => { api.get(`/products/${id}`).then(res => setProduct(res.data)); }, [id]);
  if (!product) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row gap-6">
      <img src={product.image || 'https://via.placeholder.com/400'} className="w-full md:w-1/2 rounded-lg object-cover" />
      <div className="md:w-1/2">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-primary text-xl font-bold mt-4">{product.price} XOF</p>
        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
        <button onClick={() => addToCart(product)} className="btn-primary mt-4">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;