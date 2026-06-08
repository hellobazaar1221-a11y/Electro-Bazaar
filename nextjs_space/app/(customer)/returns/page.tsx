"use client";

import { motion } from "framer-motion";
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, Truck } from "lucide-react";

export default function ReturnsPage() {
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
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 text-white items-center justify-center shadow-lg">
            <RotateCcw className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Return Policy
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Learn about our simple and customer-friendly return guidelines.
          </p>
          <div className="text-xs text-indigo-500 font-semibold tracking-wider uppercase">
            7-Day Hassle Free Returns
          </div>
        </motion.div>

        {/* Section 1: Window */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                1. 7-Day Return Window
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Electro Bazaar offers a 7-day return policy for all smartphones, laptops, smart TVs, and audio gear. You have up to 7 calendar days from the date of delivery to request a return or exchange for eligible items.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Eligibility */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                2. Conditions for Return
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                To guarantee a successful return and refund process, the product must meet the following criteria:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li>Item must be in its original packaging with all labels and seals intact.</li>
                <li>All accessories, manuals, and free gifts must be included inside the box.</li>
                <li>No signs of physical damage, water entry, scratches, or personalization.</li>
                <li>Device must be factory reset (all accounts logged out) if applicable.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Process */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <Truck className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                3. Return Pick-up & Shipping
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Once your return request is approved by our support team, we will schedule a free pick-up from the delivery address. Our courier agent will inspect the item on pickup to ensure it matches initial delivery conditions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Non-returnable */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200 border-amber-500/20"
          style={{ background: "rgba(245,158,11,0.02)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-amber-600 dark:text-amber-500 mb-2">
                4. Non-Returnable Items
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Clearance sale items, items marked as non-returnable on the product page, and products damaged due to customer misuse are not eligible for returns. In case of issues after 7 days, please contact the respective brand service center.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
