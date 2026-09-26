import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { OrderItem } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type CartItem = OrderItem;

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "totalPrice">) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("horizon_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("horizon_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (newItem: Omit<CartItem, "totalPrice">) => {
    setItems((current) => {
      const existing = current.find(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );
      if (existing) {
        return current.map((i) =>
          i.productId === newItem.productId && i.size === newItem.size
            ? {
                ...i,
                quantity: i.quantity + newItem.quantity,
                totalPrice: (i.quantity + newItem.quantity) * i.unitPrice,
              }
            : i
        );
      }
      return [...current, { ...newItem, totalPrice: newItem.quantity * newItem.unitPrice }];
    });
    toast({
      title: "Added to cart",
      description: `${newItem.productName} has been added to your cart.`,
    });
    setIsOpen(true);
  };

  const removeItem = (productId: number, size: string) => {
    setItems((current) => current.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.productId === productId && i.size === size
          ? { ...i, quantity, totalPrice: quantity * i.unitPrice }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
