import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold tracking-tight">HORIZON</h3>
            <p className="text-sm text-secondary-foreground/70 max-w-xs">
              A premium African lifestyle brand bringing craftsmanship and modern design to your everyday essentials.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products?category=bottles" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Bottles</Link></li>
              <li><Link href="/products?category=accessories" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Accessories</Link></li>
              <li><Link href="/products?category=gear" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Gear</Link></li>
              <li><Link href="/products?category=apparel" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Apparel</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/track-order" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/contact" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-sm text-secondary-foreground/70 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm uppercase tracking-wider mb-4">Connect</h4>
            <ul className="space-y-2">
              <li className="text-sm text-secondary-foreground/70">Kigali, Rwanda</li>
              <li className="text-sm text-secondary-foreground/70">Email: guyamos28@qq.com</li>
              <li className="text-sm text-secondary-foreground/70">WhatsApp: +22667030730</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} Horizon Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-secondary-foreground/50">
            <span>Currency: CFA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
