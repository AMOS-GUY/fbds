import { useContext, useEffect, useState } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { Loader } from '../components/ui/Loader';
import { SocketContext } from '../contexts/SocketContext';
import { useProducts } from '../hooks/useProducts';

export default function Products() {
  const { products, loading, fetchProducts } = useProducts();
  const [filters, setFilters] = useState({});
  const socket = useContext(SocketContext);
  
  useEffect(() => {
    fetchProducts(filters);
    
    // Listen for real-time product updates
    if (socket) {
      socket.on('product:created', (newProduct) => {
        // Add new product to local state without full refetch
        setProducts(prev => [newProduct, ...prev]);
      });
      
      socket.on('product:updated', (updatedProduct) => {
        setProducts(prev => 
          prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
        );
      });
    }
    
    return () => {
      if (socket) {
        socket.off('product:created');
        socket.off('product:updated');
      }
    };
  }, [filters]);
  
  if (loading) return <Loader fullPage />;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Products
          </h2>
          {/* Filter components here */}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        
        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found. Try adjusting filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}