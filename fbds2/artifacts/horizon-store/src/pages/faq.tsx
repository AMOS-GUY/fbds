import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      category: "Shipping & Delivery",
      items: [
        { q: "How long does shipping take within Kigali?", a: "Standard delivery within Kigali takes 1-2 business days. Express same-day delivery is available for orders placed before 12 PM." },
        { q: "Do you ship outside of Rwanda?", a: "Currently, we only ship within Rwanda. We are working on expanding our delivery network to neighboring countries soon." },
        { q: "How much is the delivery fee?", a: "Delivery within Kigali is free for all orders. Deliveries to other provinces cost 5,000 CFA." }
      ]
    },
    {
      category: "Returns & Exchanges",
      items: [
        { q: "What is your return policy?", a: "We offer a 30-day free return policy. The item must be unused, in its original packaging, and with all tags attached." },
        { q: "How do I initiate a return?", a: "Please contact our support team via WhatsApp or email with your Order ID. We will arrange for a pickup within Kigali." },
      ]
    },
    {
      category: "Products & Care",
      items: [
        { q: "How do I clean my Horizon water bottle?", a: "We recommend hand washing your bottle with warm soapy water. Do not put it in the dishwasher as it may damage the matte finish." },
        { q: "Are your products under warranty?", a: "Yes, all Horizon products come with a 1-year limited warranty covering manufacturing defects." }
      ]
    },
    {
      category: "Payments",
      items: [
        { q: "What payment methods do you accept?", a: "We currently accept Mobile Money (MoMo), bank transfers, and cash on delivery for orders within Kigali." },
        { q: "Is the checkout process secure?", a: "Yes. Orders are processed securely, and we finalize payments manually via WhatsApp or upon delivery to ensure a smooth transaction." }
      ]
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12 lg:py-24 max-w-3xl"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">Find answers to common questions about our products, shipping, and more.</p>
      </div>

      <div className="space-y-12">
        {faqs.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-serif font-bold mb-6">{section.category}</h2>
            <Accordion type="single" collapsible className="w-full">
              {section.items.map((faq, i) => (
                <AccordionItem key={i} value={`item-${idx}-${i}`}>
                  <AccordionTrigger className="text-left font-medium text-base hover:text-primary">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
