import { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useGetProduct, useListProducts, getGetProductQueryKey, getListProductsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { Heart, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const { data: relatedProducts } = useListProducts({ category: product?.category }, { query: { enabled: !!product, queryKey: getListProductsQueryKey({ category: product?.category }) } });
  
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-xl" />
          <div className="space-y-6">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <Link href="/products">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const sizeToUse = selectedSize || product.sizes[0] || "Standard";
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.image,
      quantity,
      size: sizeToUse,
      unitPrice: product.price,
    });
  };

  const isWishlisted = isInWishlist(product.id);
  const filteredRelated = relatedProducts?.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12"
    >
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-24">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded text-sm tracking-wider uppercase">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            <div className="text-2xl font-medium">
              {product.price.toLocaleString()} CFA
            </div>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <Separator className="mb-8" />

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Select Size</span>
              </div>
              <ToggleGroup 
                type="single" 
                value={selectedSize || product.sizes[0]} 
                onValueChange={(val) => val && setSelectedSize(val)}
                className="justify-start gap-3"
              >
                {product.sizes.map((size) => (
                  <ToggleGroupItem 
                    key={size} 
                    value={size}
                    className="h-12 px-6 border bg-transparent data-[state=on]:bg-foreground data-[state=on]:text-background"
                  >
                    {size}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          <div className="flex gap-4 mb-10">
            <div className="flex items-center border rounded-md h-14">
              <Button variant="ghost" className="h-full px-4 rounded-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" className="h-full px-4 rounded-none" onClick={() => setQuantity(quantity + 1)}>+</Button>
            </div>
            <Button 
              className="flex-1 h-14 text-lg" 
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-14 w-14 flex-shrink-0 ${isWishlisted ? "text-primary border-primary" : ""}`}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Truck className="w-5 h-5 text-foreground" />
              <span>Free delivery over 50k CFA</span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-foreground" />
              <span>1 year warranty</span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <RotateCcw className="w-5 h-5 text-foreground" />
              <span>30-day free returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {filteredRelated && filteredRelated.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredRelated.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-muted">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <p className="text-muted-foreground">{p.price.toLocaleString()} CFA</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
