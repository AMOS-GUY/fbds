import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User, Heart, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { items, setIsOpen: setCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Contact" },
  ];

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md border-b shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-primary">
            HORIZON
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-wider font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/track-order">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-medium uppercase tracking-wider"
            >
              <MapPin className="w-3.5 h-3.5" />
              Track Order
            </Button>
          </Link>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
          <Link href={isAuthenticated ? "/account" : "/login"}>
            <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-primary">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:text-primary"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-background z-50 md:hidden shadow-xl border-r flex flex-col"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <span className="font-serif text-xl font-bold text-primary">HORIZON</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg uppercase tracking-wider font-medium ${
                        location === link.href ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <hr className="border-border" />
                <div className="flex flex-col gap-4">
                  <Link href="/track-order" className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                    <MapPin className="w-5 h-5" /> Track Order
                  </Link>
                  <Link href="/wishlist" className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                    <Heart className="w-5 h-5" /> Wishlist
                  </Link>
                  <Link href={isAuthenticated ? "/account" : "/login"} className="flex items-center gap-3 text-muted-foreground hover:text-primary">
                    <User className="w-5 h-5" /> {isAuthenticated ? "My Account" : "Sign In"}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
