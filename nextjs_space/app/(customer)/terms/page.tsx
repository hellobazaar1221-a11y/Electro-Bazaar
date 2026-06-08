"use client";

import { motion } from "framer-motion";
import { FileText, ShieldAlert, CheckCircle, Scale, HelpCircle } from "lucide-react";

export default function TermsPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 mb-10">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white items-center justify-center shadow-lg">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Please read these terms carefully before using Electro Bazaar services.
          </p>
          <div className="text-xs text-indigo-500 font-semibold tracking-wider uppercase">
            Last Updated: June 2026
          </div>
        </motion.div>

        {/* Introduction Panel */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                By accessing and placing an order with Electro Bazaar, you confirm that you are in agreement with and bound by the terms of service contained in the Terms and Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Electro Bazaar.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2 */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                2. User Account and Security
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                To purchase goods through our platform, you are required to register an account. You must guarantee that all information provided is accurate and complete. You are responsible for keeping your login credentials confidential. 
              </p>
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Account Suspension:</strong> Admin reserves the right to suspend or terminate accounts in violation of terms (e.g. fraudulent orders, payment disputes) with a specified suspension reason visible to the user.
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3 */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <Scale className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                3. Products and Pricing
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                All prices display in Indian Rupees (₹). While we endeavor to ensure all pricing and stock details are accurate, errors may occur. In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <li>Prices are subject to change without prior notice.</li>
                <li>Product availability is updated in real time via our system.</li>
                <li>Visual descriptions might differ slightly based on your device display settings.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Section 4 */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <HelpCircle className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                4. Shipping and Delivery
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We deliver to major pin codes across India. Standard delivery timeline ranges from 3 to 7 business days depending on location. Tracking information is automatically provided under your "My Orders" tab upon shipment.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
