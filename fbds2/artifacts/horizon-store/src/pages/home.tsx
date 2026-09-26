import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useGetFeaturedProducts, useSubscribeNewsletter } from "@workspace/api-client-react";
import { ArrowRight, Star, Quote } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

export default function Home() {
  usePageTitle();
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();
  const subscribe = useSubscribeNewsletter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate(
      { data: { email } },
      {
        onSuccess: () => {
          setSubscribed(true);
          setEmail("");
          toast({ title: "Subscribed!", description: "Thank you for joining our newsletter." });
        },
        onError: () => {
          toast({ title: "Already subscribed", description: "This email is already on our list.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col min-h-screen"
    >
      {/* Promo Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        Livraison gratuite pour toute commande supérieure à 50 000 CFA — Offre limitée !
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero.png"
            alt="Horizon Store Premium Hero"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80";
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight">
            Crafted for the Modern Journey
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
            Premium lifestyle accessories. Minimalist design meets uncompromising quality.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="text-base h-14 px-8 bg-white text-black hover:bg-white/90">
                Shop Collection
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-base h-14 px-8 text-white border-white hover:bg-white/10">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Bottles", img: "/product-bottle.png", link: "/products?category=Bottles" },
              { title: "Accessories", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80", link: "/products?category=Accessories" },
              { title: "Gear", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", link: "/products?category=Gear" },
            ].map((cat, i) => (
              <Link key={i} href={cat.link} className="group block relative overflow-hidden rounded-xl aspect-[4/5]">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8">
                  <div className="flex items-center justify-between w-full text-white">
                    <h3 className="font-serif text-2xl font-semibold">{cat.title}</h3>
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Discover our signature pieces</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center text-primary font-medium hover:underline">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts?.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
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
                        <span className="font-bold tracking-wider uppercase text-xs bg-background/80 px-3 py-1.5 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-muted-foreground">{product.price.toLocaleString()} CFA</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Quote className="w-12 h-12 mx-auto text-primary mb-8 opacity-50" />
          <h2 className="text-2xl md:text-4xl font-serif italic font-light leading-relaxed mb-8">
            "La qualité des produits Horizon est incomparable. Ils sont élégants, durables et parfaits pour le quotidien. Vraiment une marque qui fait la différence."
          </h2>
          <div className="flex justify-center items-center gap-1 mb-4 text-primary">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="font-medium tracking-wider uppercase text-sm">Ibrahim S., Ouagadougou</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-serif font-bold mb-4">Join the Horizon</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to receive updates, exclusive deals, and new arrivals directly to your inbox.
          </p>
          {subscribed ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 dark:text-green-400 font-medium">You're subscribed! Welcome to the Horizon community.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Button type="submit" className="h-12 px-8" disabled={subscribe.isPending}>
                {subscribe.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </motion.div>
  );
}
