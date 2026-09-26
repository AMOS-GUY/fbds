import { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: order, isLoading, error } = useTrackOrder(
    { orderId, phone },
    { query: { enabled: submitted && !!orderId && !!phone, queryKey: getTrackOrderQueryKey({ orderId, phone }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && phone) {
      setSubmitted(true);
    }
  };

  const steps = [
    { id: "pending", label: "Order Placed", icon: Clock },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: Package },
  ];

  const getStepStatus = (stepId: string, currentStatus: string) => {
    const statuses = ["pending", "confirmed", "shipped", "delivered"];
    const currentIndex = statuses.indexOf(currentStatus.toLowerCase());
    const stepIndex = statuses.indexOf(stepId);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12 lg:py-24 max-w-3xl"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
        <p className="text-muted-foreground">Enter your order details below to see the current status of your shipment.</p>
      </div>

      <div className="bg-card border p-8 rounded-xl shadow-sm mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input 
              id="orderId" 
              placeholder="e.g. ORD-123456" 
              value={orderId} 
              onChange={(e) => {setOrderId(e.target.value); setSubmitted(false);}} 
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              placeholder="Used during checkout" 
              value={phone} 
              onChange={(e) => {setPhone(e.target.value); setSubmitted(false);}} 
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto h-10 px-8" disabled={isLoading}>
              {isLoading ? "Tracking..." : "Track"}
            </Button>
          </div>
        </form>
      </div>

      {submitted && !isLoading && error && (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center">
          Order not found. Please check your Order ID and Phone Number.
        </div>
      )}

      {submitted && order && (
        <div className="space-y-8">
          <div className="bg-card border p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-6 border-b">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Order</p>
                <p className="text-xl font-bold font-serif">{order.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total</p>
                <p className="text-xl font-bold font-serif">{order.finalTotal.toLocaleString()} CFA</p>
              </div>
            </div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 hidden sm:block z-0" />
              
              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-8 sm:gap-0">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.id, order.status);
                  const StepIcon = step.icon;
                  
                  return (
                    <div key={step.id} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 bg-card transition-colors
                        ${status === "completed" ? "border-primary text-primary" : 
                          status === "current" ? "border-primary bg-primary text-primary-foreground" : 
                          "border-muted text-muted-foreground"}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="sm:text-center">
                        <p className={`font-medium ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                          {step.label}
                        </p>
                        {status === "current" && (
                          <p className="text-xs text-primary font-medium mt-1">Current Status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-card border p-8 rounded-xl shadow-sm">
            <h3 className="font-serif text-xl font-bold mb-6">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} | Size: {item.size}</p>
                  </div>
                  <p className="font-medium">{item.totalPrice.toLocaleString()} CFA</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
