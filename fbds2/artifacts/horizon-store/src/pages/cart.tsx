import { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { ArrowLeft, Trash2, Plus, Minus, CheckCircle2, MessageCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "22667030730";

export default function Cart() {
  usePageTitle("Cart");

  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const [destination, setDestination] = useState("Ouagadougou");
  const [customerName, setCustomerName] = useState(user?.firstName ? `${user.firstName} ${user.lastName}` : "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [orderComplete, setOrderComplete] = useState<{ orderId: string; customerName: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingCost = destination === "Ouagadougou" ? 0 : 5000;
  const finalTotal = subtotal + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    createOrder.mutate(
      {
        data: {
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          destination,
          items,
          subtotal,
          finalTotal,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (order) => {
          setOrderComplete({ orderId: order.orderId, customerName });
          clearCart();

          // Pre-fill WhatsApp message with full order details
          let waMessage = `*Nouvelle commande: ${order.orderId}*\n\n`;
          waMessage += `*Client:* ${customerName}\n`;
          waMessage += `*Téléphone:* ${customerPhone}\n`;
          waMessage += `*Destination:* ${destination}\n\n`;
          waMessage += `*Articles:*\n`;
          items.forEach((i) => {
            waMessage += `- ${i.quantity}x ${i.productName} (${i.size}) @ ${i.unitPrice.toLocaleString()} CFA\n`;
          });
          waMessage += `\n*Total:* ${finalTotal.toLocaleString()} CFA`;
          if (notes) waMessage += `\n*Notes:* ${notes}`;

          const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;
          window.open(waLink, "_blank");
          setIsSubmitting(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create order. Please try again.", variant: "destructive" });
          setIsSubmitting(false);
        },
      }
    );
  };

  // Order success screen
  if (orderComplete) {
    return (
      <motion.div
        initial="initial" animate="in" exit="out"
        variants={pageVariants} transition={pageTransition}
        className="container mx-auto px-4 py-24 text-center max-w-lg"
      >
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-3">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-2">Thank you for your purchase, {orderComplete.customerName}.</p>
        <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-8">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-mono font-medium text-sm">{orderComplete.orderId}</span>
        </div>

        <div className="bg-muted/50 border rounded-xl p-6 mb-8 text-left space-y-3">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              WhatsApp has been opened to finalize your order. If it didn't open automatically, please contact us at <strong>+226 67 03 07 30</strong> with your Order ID.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button variant="outline" className="w-full sm:w-auto">Continue Shopping</Button>
          </Link>
          <Link href="/track-order">
            <Button className="w-full sm:w-auto">Track My Order</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <motion.div
        initial="initial" animate="in" exit="out"
        variants={pageVariants} transition={pageTransition}
        className="container mx-auto px-4 py-24 text-center max-w-lg"
      >
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products">
          <Button size="lg" className="w-full sm:w-auto">Start Shopping</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}
      className="container mx-auto px-4 py-12"
    >
      <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex gap-6 border-b pb-6">
              <div className="w-24 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.productName} className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"; }} />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-lg">
                      <Link href={`/products/${item.productId}`} className="hover:underline">{item.productName}</Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">Size: {item.size}</p>
                  </div>
                  <p className="font-medium">{item.unitPrice.toLocaleString()} CFA</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border rounded-md">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.productId, item.size)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary + checkout form */}
        <div className="lg:col-span-1">
          <div className="bg-muted/50 p-6 rounded-xl space-y-6 sticky top-24">
            <h2 className="text-xl font-serif font-bold">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toLocaleString()} CFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `${shippingCost.toLocaleString()} CFA`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-serif text-xl font-bold pt-2">
                <span>Total</span>
                <span>{finalTotal.toLocaleString()} CFA</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Delivery Details</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (WhatsApp) *</Label>
                <Input id="phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger id="destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ouagadougou">Ouagadougou (Free)</SelectItem>
                    <SelectItem value="Bobo-Dioulasso">Bobo-Dioulasso (+5,000 CFA)</SelectItem>
                    <SelectItem value="Koudougou">Koudougou (+5,000 CFA)</SelectItem>
                    <SelectItem value="Banfora">Banfora (+5,000 CFA)</SelectItem>
                    <SelectItem value="Autre ville">Autre ville (+5,000 CFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Special instructions, delivery address, etc." />
              </div>

              <Button type="submit" className="w-full h-12 text-base mt-4 gap-2" disabled={isSubmitting}>
                <MessageCircle className="w-4 h-4" />
                {isSubmitting ? "Processing..." : "Checkout via WhatsApp"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You'll be redirected to WhatsApp to confirm your order with us.
              </p>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
