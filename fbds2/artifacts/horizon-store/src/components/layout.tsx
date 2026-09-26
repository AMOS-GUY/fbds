import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { CartSidebar } from "./cart-sidebar";
import { ThemeToggle } from "./ui/theme-toggle";
import { BackToTop } from "./back-to-top";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 pt-16 flex flex-col">{children}</main>
      <Footer />
      <CartSidebar />
      <ThemeToggle />
      <BackToTop />
    </div>
  );
}
