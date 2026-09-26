import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HeartCrack, ShoppingCart, Eye } from "lucide-react";

export default function Wishlist() {
  const { items: wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { data: allProducts, isLoading } = useListProducts();

  const wishlistedProducts = allProducts?.filter(p => wishlistIds.includes(p.id)) || [];

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.image,
      quantity: 1,
      size: product.sizes[0] || "Standard",
      unitPrice: product.price,
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground">Saved items you're keeping an eye on.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-muted aspect-[3/4] rounded-lg" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-24 max-w-md mx-auto">
          <HeartCrack className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
          <h2 className="text-2xl font-serif font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">You haven't saved any items yet. Start exploring our collection and find something you love.</p>
          <Link href="/products">
            <Button size="lg">Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistedProducts.map((product) => (
            <div key={product.id} className="group relative block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-muted">
                <Link href={`/products/${product.id}`}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </Link>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 hover:bg-background text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                >
                  <HeartCrack className="w-4 h-4" />
                </Button>
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[2px] pointer-events-none">
                    <span className="font-bold tracking-wider uppercase text-sm">Out of Stock</span>
                  </div>
                )}
              </div>
              
              <Link href={`/products/${product.id}`} className="block mb-3">
                <h3 className="font-medium mb-1 hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                <p className="text-muted-foreground">{product.price.toLocaleString()} CFA</p>
              </Link>

              <Button 
                className="w-full" 
                disabled={product.stock <= 0}
                onClick={() => handleAddToCart(product)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
