import { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useListProducts } from "@workspace/api-client-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@workspace/api-client-react";

const STATIC_CATEGORIES = ["Bottles", "Accessories", "Gear", "Apparel"];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

export default function Products() {
  usePageTitle("Shop");

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const rawCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(rawCategory);
  const [sort, setSort] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { addItem } = useCart();

  const { data: products, isLoading } = useListProducts({
    search: search || undefined,
    category: category && category !== "all" ? category : undefined,
    sort: sort,
  });

  // Derive all known categories dynamically from loaded products (includes custom ones)
  const dynamicCategories = products
    ? Array.from(new Set([...STATIC_CATEGORIES, ...products.map((p) => p.category)]))
    : STATIC_CATEGORIES;

  const handleQuickAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      image: product.image,
      quantity: 1,
      size: product.sizes[0] || "Standard",
      unitPrice: product.price,
    });
    setQuickViewProduct(null);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Our Collection</h1>
          <p className="text-muted-foreground">Premium lifestyle accessories crafted for everyday excellence.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-none"
            />
          </div>

          <Select value={category || "all"} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] bg-muted/50 border-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {dynamicCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px] bg-muted/50 border-none">
              <SlidersHorizontal className="w-4 h-4 mr-2 flex-shrink-0" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-muted aspect-[3/4] rounded-lg" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24">
          <h3 className="text-2xl font-serif mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setCategory("all"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {products?.map((product) => (
            <div key={product.id} className="group relative block">
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                      {product.badge}
                    </span>
                  )}
                  {Number(product.stock) <= 0 && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="font-bold tracking-wider uppercase text-sm bg-background/80 px-4 py-2 rounded-full">Out of Stock</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex justify-between items-start">
                <Link href={`/products/${product.id}`} className="flex-1">
                  <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-muted-foreground">{product.price.toLocaleString()} CFA</p>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuickViewProduct(product);
                  }}
                  aria-label="Quick view"
                >
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Dialog */}
      <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          {quickViewProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
              <div className="bg-muted relative h-64 sm:h-auto">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <DialogHeader className="text-left space-y-2 mb-4">
                  <span className="text-sm text-primary font-medium tracking-wider uppercase">
                    {quickViewProduct.category}
                  </span>
                  <DialogTitle className="text-2xl font-serif font-bold">
                    {quickViewProduct.name}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-foreground">
                    {quickViewProduct.price.toLocaleString()} CFA
                  </DialogDescription>
                </DialogHeader>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                  {quickViewProduct.description}
                </p>

                <div className="mt-auto space-y-3">
                  <Button
                    className="w-full h-12"
                    disabled={Number(quickViewProduct.stock) <= 0}
                    onClick={() => handleQuickAddToCart(quickViewProduct)}
                  >
                    {Number(quickViewProduct.stock) > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <Link href={`/products/${quickViewProduct.id}`}>
                    <Button variant="outline" className="w-full h-12">
                      View Full Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
