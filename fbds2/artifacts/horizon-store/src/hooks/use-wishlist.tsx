import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  items: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("horizon_wishlist");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("horizon_wishlist", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const toggleWishlist = (productId: number) => {
    setItems((current) => {
      const exists = current.includes(productId);
      if (exists) {
        toast({
          title: "Removed from wishlist",
          description: "Product removed from your wishlist.",
        });
        return current.filter((id) => id !== productId);
      } else {
        toast({
          title: "Added to wishlist",
          description: "Product added to your wishlist.",
        });
        return [...current, productId];
      }
    });
  };

  const isInWishlist = (productId: number) => {
    return items.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
