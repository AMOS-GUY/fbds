import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { useAuth } from "@/hooks/use-auth";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { LogOut, Package, User, MapPin, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const { data: orders, isLoading: ordersLoading } = useListOrders(undefined, { 
    query: { enabled: !!user, queryKey: getListOrdersQueryKey(undefined) } 
  });

  // Filter orders manually for the current user since the API might not support email filtering directly
  const userOrders = orders?.filter(o => o.customerEmail === user?.email || o.customerPhone === user?.phone) || [];

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...user,
      firstName,
      lastName,
      phone,
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const totalSpent = userOrders.reduce((acc, order) => acc + order.finalTotal, 0);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">My Account</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user.firstName}.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0 mb-8 overflow-x-auto">
          <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <Package className="w-4 h-4 mr-2" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Total Orders</h3>
              <p className="text-3xl font-serif font-bold">{userOrders.length}</p>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Total Spent</h3>
              <p className="text-3xl font-serif font-bold">{totalSpent.toLocaleString()} CFA</p>
            </div>
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">Active Orders</h3>
              <p className="text-3xl font-serif font-bold">
                {userOrders.filter(o => ["pending", "confirmed", "shipped"].includes(o.status)).length}
              </p>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-serif font-bold mb-4">Recent Activity</h3>
            {userOrders.length > 0 ? (
              <div className="space-y-4">
                {userOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{order.orderId}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.finalTotal.toLocaleString()} CFA</p>
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4">No recent orders found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            {ordersLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : userOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">You haven't placed any orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium">{order.orderId}</td>
                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                              'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{order.finalTotal.toLocaleString()} CFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="max-w-xl bg-card border rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-serif font-bold mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </div>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
}
