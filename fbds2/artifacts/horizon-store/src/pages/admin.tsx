import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import {
  useGetStoreStats,
  useListProducts,
  useListOrders,
  useListBlogPosts,
  useDeleteProduct,
  useUpdateOrderStatus,
  useCreateProduct,
  useUpdateProduct,
  useCreateBlogPost,
  getListOrdersQueryKey,
  getListProductsQueryKey,
  getListBlogPostsQueryKey,
  getGetStoreStatsQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Package,
  ShoppingBag,
  Trash2,
  Edit,
  LogOut,
  ShieldCheck,
  Plus,
  BookOpen,
  X,
  Users,
  Boxes,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { Product } from "@workspace/api-client-react";

/* ------------------------------------------------------------------ */
/*  Admin auth                                                          */
/* ------------------------------------------------------------------ */

const ADMIN_PASSWORD = "horizon2026admin";
const ADMIN_STORAGE_KEY = "horizon_admin_session";
const REFRESH_INTERVAL = 15_000; // 15 seconds

function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem(ADMIN_STORAGE_KEY) === "true");
    setIsLoaded(true);
  }, []);

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setIsAdmin(true);
      setAuthTokenGetter(() => password);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdmin(false);
    setAuthTokenGetter(null);
  };

  return { isAdmin, isLoaded, adminLogin, adminLogout };
}

/* ------------------------------------------------------------------ */
/*  Admin login screen                                                  */
/* ------------------------------------------------------------------ */

function AdminLoginForm({ onLogin }: { onLogin: (pw: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setTimeout(() => {
      const ok = onLogin(password);
      if (ok) {
        toast({ title: "Welcome, Admin" });
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setSubmitting(false);
    }, 300);
  };

  return (
    <motion.div
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div className="w-full max-w-sm">
        <div className="bg-card border rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              This area is restricted to store administrators only.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                data-testid="input-admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={submitting || !password}
              data-testid="button-admin-login">
              {submitting ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Your regular customer account is not affected by this login.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product form modal (add + edit)                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_CATEGORIES = ["Bottles", "Accessories", "Gear", "Apparel"];
const BADGES = ["", "New", "Bestseller", "Popular", "Sale", "Limited"];

interface ProductFormData {
  name: string;
  category: string;
  customCategory: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  sizes: string;
  featured: boolean;
  badge: string;
}

const emptyProduct: ProductFormData = {
  name: "", category: "Bottles", customCategory: "", price: "", stock: "",
  description: "", image: "", sizes: "", featured: false, badge: "",
};

function productToForm(p: Product, knownCategories: string[]): ProductFormData {
  const isCustom = !knownCategories.includes(p.category);
  return {
    name: p.name,
    category: isCustom ? "__custom__" : p.category,
    customCategory: isCustom ? p.category : "",
    price: String(p.price),
    stock: String(p.stock),
    description: p.description,
    image: p.image,
    sizes: p.sizes.join(", "),
    featured: p.featured,
    badge: p.badge ?? "",
  };
}

function ProductModal({
  open,
  onClose,
  editProduct,
  allCategories,
}: {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
  allCategories: string[];
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [form, setForm] = useState<ProductFormData>(emptyProduct);

  useEffect(() => {
    setForm(editProduct ? productToForm(editProduct, allCategories) : emptyProduct);
  }, [editProduct, open, allCategories]);

  const set = (key: keyof ProductFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isEditing = editProduct !== null;
  const isPending = createProduct.isPending || updateProduct.isPending;
  const effectiveCategory = form.category === "__custom__" ? form.customCategory.trim() : form.category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveCategory) {
      toast({ title: "Please enter a category name", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      category: effectiveCategory,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      description: form.description.trim(),
      image: form.image.trim(),
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : ["Standard"],
      featured: form.featured,
      badge: form.badge || undefined,
    };

    if (isEditing) {
      updateProduct.mutate({ id: editProduct.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Product updated" });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
          onClose();
        },
        onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Product created" });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
          onClose();
        },
        onError: () => toast({ title: "Failed to create product", variant: "destructive" }),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Product Name *</Label>
            <Input id="p-name" data-testid="input-product-name"
              value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Horizon Pro Gourde" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger data-testid="select-product-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Create new category...</SelectItem>
                </SelectContent>
              </Select>
              {form.category === "__custom__" && (
                <Input
                  data-testid="input-custom-category"
                  value={form.customCategory}
                  onChange={(e) => set("customCategory", e.target.value)}
                  placeholder="Enter new category name"
                  className="mt-2"
                  autoFocus
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Badge</Label>
              <Select value={form.badge} onValueChange={(v) => set("badge", v)}>
                <SelectTrigger data-testid="select-product-badge">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => (
                    <SelectItem key={b} value={b}>{b || "None"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price (CFA) *</Label>
              <Input id="p-price" data-testid="input-product-price" type="number" min="0"
                value={form.price} onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 15000" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-stock">Initial Stock *</Label>
              <Input id="p-stock" data-testid="input-product-stock" type="number" min="0"
                value={form.stock} onChange={(e) => set("stock", e.target.value)}
                placeholder="e.g. 50" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description *</Label>
            <Textarea id="p-desc" data-testid="input-product-description" rows={3}
              value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Short product description..." required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-image">Image URL *</Label>
            <Input id="p-image" data-testid="input-product-image"
              value={form.image} onChange={(e) => set("image", e.target.value)}
              placeholder="https://..." required />
            {form.image && (
              <img src={form.image} alt="preview"
                className="h-24 w-24 object-cover rounded-lg border mt-2" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-sizes">Sizes (comma-separated)</Label>
            <Input id="p-sizes" data-testid="input-product-sizes"
              value={form.sizes} onChange={(e) => set("sizes", e.target.value)}
              placeholder="e.g. S, M, L, XL  or  500ml, 750ml, 1L" />
            <p className="text-xs text-muted-foreground">
              Leave blank for single-size items — will default to "Standard".
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input id="p-featured" type="checkbox" data-testid="checkbox-product-featured"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-primary" />
            <Label htmlFor="p-featured" className="cursor-pointer">
              Feature this product on the homepage
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending} data-testid="button-save-product">
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Stock edit modal                                                    */
/* ------------------------------------------------------------------ */

function StockModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProduct = useUpdateProduct();
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(product ? String(product.stock) : "");
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    updateProduct.mutate(
      { id: product.id, data: { stock: parseInt(value, 10) } },
      {
        onSuccess: () => {
          toast({ title: "Stock updated" });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
          onClose();
        },
        onError: () => toast({ title: "Failed to update stock", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={!!product} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Update Stock</DialogTitle>
        </DialogHeader>
        {product && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
              <img src={product.image} alt={product.name}
                className="w-12 h-12 rounded object-cover" />
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">Current stock: {product.stock} units</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-stock">New Stock Quantity</Label>
              <Input id="new-stock" data-testid="input-new-stock"
                type="number" min="0" value={value}
                onChange={(e) => setValue(e.target.value)} required autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? "Saving..." : "Update Stock"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog post form modal                                                */
/* ------------------------------------------------------------------ */

const BLOG_CATEGORIES = ["Conseils", "Lifestyle", "Santé", "Mode", "Actualités"];

interface BlogFormData {
  title: string;
  excerpt: string;
  fullContent: string;
  category: string;
  image: string;
}

const emptyBlog: BlogFormData = {
  title: "", excerpt: "", fullContent: "", category: "Conseils", image: "",
};

function BlogModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createBlogPost = useCreateBlogPost();
  const [form, setForm] = useState<BlogFormData>(emptyBlog);

  useEffect(() => { if (open) setForm(emptyBlog); }, [open]);

  const set = (key: keyof BlogFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBlogPost.mutate({ data: { ...form } }, {
      onSuccess: () => {
        toast({ title: "Blog post published" });
        queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
        onClose();
      },
      onError: () => toast({ title: "Failed to publish post", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Blog Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="b-title">Title *</Label>
            <Input id="b-title" data-testid="input-blog-title"
              value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Post title..." required />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger data-testid="select-blog-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-image">Cover Image URL *</Label>
            <Input id="b-image" data-testid="input-blog-image"
              value={form.image} onChange={(e) => set("image", e.target.value)}
              placeholder="https://..." required />
            {form.image && (
              <img src={form.image} alt="preview"
                className="h-28 w-full object-cover rounded-lg border mt-2" />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-excerpt">
              Excerpt * <span className="text-muted-foreground font-normal">(short summary shown in blog list)</span>
            </Label>
            <Textarea id="b-excerpt" data-testid="input-blog-excerpt" rows={2}
              value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
              placeholder="One or two sentences summarising the post..." required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-content">Full Content *</Label>
            <Textarea id="b-content" data-testid="input-blog-content" rows={8}
              value={form.fullContent} onChange={(e) => set("fullContent", e.target.value)}
              placeholder="Write the full article here..." required />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createBlogPost.isPending} data-testid="button-publish-post">
              {createBlogPost.isPending ? "Publishing..." : "Publish Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                 */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    confirmed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main admin page                                                     */
/* ------------------------------------------------------------------ */

export default function Admin() {
  const { isAdmin, isLoaded, adminLogin, adminLogout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, dataUpdatedAt: statsUpdated } = useGetStoreStats();
  const { data: products } = useListProducts();
  const { data: orders } = useListOrders();
  const { data: blogPosts } = useListBlogPosts();

  // Auto-refresh all admin data every 15 seconds to stay in sync with store activity
  useEffect(() => {
    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListBlogPostsQueryKey() });
    }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [queryClient]);

  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  // Derive all known categories (defaults + any custom ones from existing products)
  const allCategories = useMemo(() => {
    const fromProducts = products?.map((p) => p.category) ?? [];
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
  }, [products]);

  // Derive customers from orders
  const customers = useMemo(() => {
    if (!orders) return [];
    const map = new Map<string, {
      name: string; phone: string; email: string | null;
      orderCount: number; totalSpent: number; lastOrder: string;
    }>();
    for (const o of orders) {
      const existing = map.get(o.customerPhone);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.finalTotal;
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
      } else {
        map.set(o.customerPhone, {
          name: o.customerName,
          phone: o.customerPhone,
          email: o.customerEmail ?? null,
          orderCount: 1,
          totalSpent: o.finalTotal,
          lastOrder: o.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim() || !orders) return orders ?? [];
    const q = orderSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }, [orders, orderSearch]);

  // Filter products for stock tab
  const filteredStock = useMemo(() => {
    if (!stockSearch.trim() || !products) return products ?? [];
    const q = stockSearch.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, stockSearch]);

  const lowStock = products?.filter((p) => Number(p.stock) <= 5) ?? [];

  const openAddProduct = () => { setEditingProduct(null); setProductModalOpen(true); };
  const openEditProduct = (p: Product) => { setEditingProduct(p); setProductModalOpen(true); };
  const closeProductModal = () => { setProductModalOpen(false); setEditingProduct(null); };

  const handleDeleteProduct = (id: number) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      },
    });
  };

  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatus.mutate({ id: orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Order status updated" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      },
    });
  };

  const manualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
    toast({ title: "Dashboard refreshed" });
  };

  if (!isLoaded) return null;
  if (!isAdmin) return <AdminLoginForm onLogin={adminLogin} />;

  const lastRefreshed = statsUpdated
    ? new Date(statsUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <motion.div
      initial="initial" animate="in" exit="out"
      variants={pageVariants} transition={pageTransition}
      className="container mx-auto px-4 py-8"
    >
      {/* Modals */}
      <ProductModal open={productModalOpen} onClose={closeProductModal}
        editProduct={editingProduct} allCategories={allCategories} />
      <StockModal product={stockProduct} onClose={() => setStockProduct(null)} />
      <BlogModal open={blogModalOpen} onClose={() => setBlogModalOpen(false)} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live data — auto-refreshes every 15s
            {lastRefreshed && <span className="ml-2 text-xs opacity-60">Last updated: {lastRefreshed}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={manualRefresh} className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            adminLogout();
            toast({ title: "Admin session ended" });
          }} className="flex items-center gap-2" data-testid="button-admin-logout">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </div>

      {/* Low-stock alert banner */}
      {lowStock.length > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-orange-800 dark:text-orange-300">
              Low stock alert — {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} running low
            </p>
            <p className="text-orange-700 dark:text-orange-400 text-xs mt-0.5">
              {lowStock.map((p) => `${p.name} (${p.stock} left)`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto bg-transparent p-0 mb-8 flex flex-wrap gap-y-0">
          {[
            { value: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4 mr-1.5" /> },
            { value: "products", label: `Products (${products?.length ?? 0})`, icon: <ShoppingBag className="w-4 h-4 mr-1.5" /> },
            { value: "stock", label: "Stock", icon: <Boxes className="w-4 h-4 mr-1.5" /> },
            { value: "orders", label: `Orders (${orders?.length ?? 0})`, icon: <Package className="w-4 h-4 mr-1.5" /> },
            { value: "customers", label: `Customers (${customers.length})`, icon: <Users className="w-4 h-4 mr-1.5" /> },
            { value: "blog", label: `Blog (${blogPosts?.length ?? 0})`, icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
          ].map((t) => (
            <TabsTrigger key={t.value} value={t.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 flex items-center text-sm">
              {t.icon}{t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---- Overview ---- */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Revenue", value: `${(stats?.totalRevenue ?? 0).toLocaleString()} CFA`, color: "text-primary" },
              { label: "Total Orders", value: stats?.totalOrders ?? 0, color: "" },
              { label: "Pending Orders", value: stats?.pendingOrders ?? 0, color: "text-orange-500" },
              { label: "Products", value: stats?.totalProducts ?? 0, color: "" },
            ].map((card) => (
              <div key={card.label} className="bg-card border rounded-xl p-5 shadow-sm">
                <h3 className="text-muted-foreground text-xs font-medium mb-2 uppercase tracking-wider">{card.label}</h3>
                <p className={`text-2xl font-serif font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <h3 className="font-medium mb-4">Products by Category</h3>
                <div className="space-y-3">
                  {stats.categoryBreakdown.map((item) => {
                    const total = stats.categoryBreakdown.reduce((s, c) => s + c.count, 0);
                    const pct = total ? Math.round((item.count / total) * 100) : 0;
                    return (
                      <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span className="text-muted-foreground">{item.count} products ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                  <h3 className="font-medium">Recent Orders</h3>
                </div>
                <div className="divide-y">
                  {stats.recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{o.orderId}</p>
                        <p className="text-xs text-muted-foreground">{o.customerName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{o.finalTotal.toLocaleString()} CFA</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- Products ---- */}
        <TabsContent value="products">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-muted/30">
              <h3 className="font-medium">All Products ({products?.length ?? 0})</h3>
              <Button size="sm" onClick={openAddProduct} data-testid="button-add-product"
                className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Featured</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id} data-testid={`row-product-${product.id}`}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.badge && (
                              <span className="text-xs text-primary">{product.badge}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{product.category}</td>
                      <td className="px-5 py-4">{product.price.toLocaleString()} CFA</td>
                      <td className="px-5 py-4">
                        <span className={
                          Number(product.stock) > 10 ? "text-green-600 font-medium" :
                          Number(product.stock) > 0 ? "text-orange-500 font-medium" :
                          "text-destructive font-medium"
                        }>{product.stock}</span>
                      </td>
                      <td className="px-5 py-4">
                        {product.featured
                          ? <Badge variant="secondary" className="text-xs">Yes</Badge>
                          : <span className="text-muted-foreground text-xs">No</span>}
                      </td>
                      <td className="px-5 py-4 text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditProduct(product)}
                          data-testid={`button-edit-product-${product.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          data-testid={`button-delete-product-${product.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ---- Stock / Inventory ---- */}
        <TabsContent value="stock">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-muted/30">
              <h3 className="font-medium">Inventory — Stock Levels</h3>
              <Input
                placeholder="Search product..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                className="w-56 h-8 text-sm"
                data-testid="input-stock-search"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Sizes</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Update Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((product) => {
                    const stock = Number(product.stock);
                    const statusLabel = stock === 0 ? "Out of stock" : stock <= 5 ? "Low stock" : "In stock";
                    const statusColor = stock === 0 ? "text-destructive" : stock <= 5 ? "text-orange-500" : "text-green-600";
                    return (
                      <tr key={product.id} data-testid={`row-stock-${product.id}`}
                        className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{product.category}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {product.sizes.length > 0 ? product.sizes.join(", ") : "Standard"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-lg font-bold ${statusColor}`}>{stock}</span>
                          <span className="text-muted-foreground text-xs ml-1">units</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button size="sm" variant="outline"
                            onClick={() => setStockProduct(product)}
                            data-testid={`button-update-stock-${product.id}`}>
                            Edit Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Summary bar */}
            <div className="p-4 border-t bg-muted/20 flex flex-wrap gap-6 text-sm">
              <span>Total products: <strong>{products?.length ?? 0}</strong></span>
              <span className="text-green-600">In stock: <strong>{products?.filter((p) => Number(p.stock) > 5).length ?? 0}</strong></span>
              <span className="text-orange-500">Low stock (&le;5): <strong>{lowStock.length}</strong></span>
              <span className="text-destructive">Out of stock: <strong>{products?.filter((p) => Number(p.stock) === 0).length ?? 0}</strong></span>
            </div>
          </div>
        </TabsContent>

        {/* ---- Orders ---- */}
        <TabsContent value="orders">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3 bg-muted/30">
              <h3 className="font-medium">All Orders ({orders?.length ?? 0})</h3>
              <Input
                placeholder="Search by order ID, name, phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-72 h-8 text-sm"
                data-testid="input-order-search"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Items</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} data-testid={`row-order-${order.id}`}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-medium font-mono text-xs">{order.orderId}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                        {order.destination && (
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{order.destination}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-5 py-4 font-medium whitespace-nowrap">
                        {order.finalTotal.toLocaleString()} CFA
                      </td>
                      <td className="px-5 py-4">
                        <Select value={order.status}
                          onValueChange={(val) => handleStatusChange(order.id, val)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs"
                            data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                        No orders match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ---- Customers ---- */}
        <TabsContent value="customers">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium">All Customers ({customers.length})</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Derived from order history — sorted by total spent</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Phone</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Orders</th>
                    <th className="px-5 py-4">Total Spent</th>
                    <th className="px-5 py-4">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.phone}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 font-medium">{c.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{c.phone}</td>
                      <td className="px-5 py-4 text-muted-foreground">{c.email ?? "—"}</td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary">{c.orderCount}</Badge>
                      </td>
                      <td className="px-5 py-4 font-medium">{c.totalSpent.toLocaleString()} CFA</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(c.lastOrder).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                        No customers yet. Orders placed through the store will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {customers.length > 0 && (
              <div className="p-4 border-t bg-muted/20 flex flex-wrap gap-6 text-sm">
                <span>Total customers: <strong>{customers.length}</strong></span>
                <span>Total revenue: <strong>{customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()} CFA</strong></span>
                <span>Avg order value: <strong>
                  {orders && orders.length > 0
                    ? Math.round(orders.reduce((s, o) => s + o.finalTotal, 0) / orders.length).toLocaleString()
                    : 0} CFA
                </strong></span>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- Blog ---- */}
        <TabsContent value="blog">
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <h3 className="font-medium">Blog Posts ({blogPosts?.length ?? 0})</h3>
              <Button size="sm" onClick={() => setBlogModalOpen(true)}
                data-testid="button-add-blog-post" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </div>
            <div className="divide-y">
              {blogPosts?.length === 0 && (
                <p className="px-6 py-10 text-center text-muted-foreground text-sm">
                  No blog posts yet. Click "New Post" to publish your first article.
                </p>
              )}
              {blogPosts?.map((post) => (
                <div key={post.id} data-testid={`row-blog-${post.id}`}
                  className="flex items-start gap-4 p-4 hover:bg-muted/20">
                  <img src={post.image} alt={post.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.excerpt}</p>
                  </div>
                  <Button variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
