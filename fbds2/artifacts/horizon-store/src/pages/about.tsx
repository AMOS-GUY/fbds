import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";

export default function About() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="pb-24"
    >
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-secondary">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground px-4 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">
            Our Story
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto font-light opacity-90">
            Rooted in Kigali, designed for the world. We believe that everyday objects should inspire.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 container mx-auto px-4 max-w-4xl text-center">
        <h2 className="text-3xl font-serif font-bold mb-8">The Horizon Philosophy</h2>
        <p className="text-xl leading-relaxed text-muted-foreground mb-6">
          Horizon began with a simple observation: the objects we carry with us every day shape how we experience the world. Yet, so many everyday essentials lack soul, craftsmanship, or thoughtful design.
        </p>
        <p className="text-xl leading-relaxed text-muted-foreground">
          Based in Kigali, Rwanda, we set out to create a premium lifestyle brand that marries minimalist aesthetics with uncompromising utility. Every bottle, accessory, and piece of gear we create is designed to elevate your daily rituals.
        </p>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-2xl font-bold">01</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Design First</h3>
              <p className="text-muted-foreground">We obsess over form and function equally. An object must be beautiful to look at and intuitive to use.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-2xl font-bold">02</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Built to Last</h3>
              <p className="text-muted-foreground">Quality is our signature. We source premium materials to ensure our products stand the test of time.</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="font-serif text-2xl font-bold">03</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-4">Modern African</h3>
              <p className="text-muted-foreground">We represent a new narrative of African commerce—global standards, local roots, and uncompromising excellence.</p>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
