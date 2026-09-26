import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";

export default function Privacy() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="container mx-auto px-4 py-12 lg:py-24 max-w-3xl"
    >
      <div className="mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: October 1, 2024</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none font-serif leading-relaxed">
        <p>
          At Horizon Store, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or make a purchase.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          When you visit our store, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
        </p>
        <p>
          Additionally, when you make a purchase or attempt to make a purchase, we collect certain information from you, including your name, billing address, shipping address, email address, and phone number.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the Order Information that we collect generally to fulfill any orders placed through the Site (including arranging for shipping and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
        </p>
        <ul>
          <li>Communicate with you via WhatsApp or email regarding your order;</li>
          <li>Screen our orders for potential risk or fraud; and</li>
          <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
        </ul>

        <h2>3. Data Storage and Security</h2>
        <p>
          Your personal data is stored securely. For this frontend-only demonstration, your data (like account details and cart items) is stored locally in your browser using `localStorage`. We do not transmit this data to a central database unless an order is placed.
        </p>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us using the contact information below.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at guyamos28@qq.com or by mail using the details provided below:
        </p>
        <p>
          Horizon Store<br />
          Kigali, Rwanda
        </p>
      </div>
    </motion.div>
  );
}
