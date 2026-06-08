"use client";

import { motion } from "framer-motion";
import { Landmark, ShieldCheck, CheckCircle2, Clock, IndianRupee } from "lucide-react";

export default function RefundsPage() {
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
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 text-white items-center justify-center shadow-lg">
            <IndianRupee className="h-7 w-7" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            Understand how refunds are processed and when you will receive your funds.
          </p>
          <div className="text-xs text-indigo-500 font-semibold tracking-wider uppercase">
            Fast & Secure Refund Processing
          </div>
        </motion.div>

        {/* Section 1: Refund Trigger */}
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
                1. Refund Initiation
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Refunds are initiated immediately after the returned product arrives at our warehouse and passes quality check inspection. The quality verification checks take up to 24 to 48 hours from the time the item is marked as received.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Timelines */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <Clock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                2. Refund Timeline
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Once approved, the time taken for the refund to reflect in your account depends on the payment method used during order placement:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold block text-slate-900 dark:text-white mb-1">Credit/Debit Cards</span>
                  <span>3 - 5 business days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold block text-slate-900 dark:text-white mb-1">UPI (GPay, PhonePe, etc.)</span>
                  <span>1 - 2 business days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold block text-slate-900 dark:text-white mb-1">Net Banking</span>
                  <span>3 - 7 business days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold block text-slate-900 dark:text-white mb-1">Cash on Delivery (COD)</span>
                  <span>Bank transfer (5-7 business days)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: COD Bank Transfer */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition duration-200"
          style={{ borderColor: "rgba(128,128,128,0.15)" }}
        >
          <div className="flex gap-4">
            <div className="mt-1 flex-shrink-0">
              <Landmark className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                3. Cash on Delivery (COD) Refunds
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                For Cash on Delivery orders, you will be required to provide your bank account details (Bank Name, Account Holder Name, Account Number, and IFSC Code) through a secure link provided by our support agents. The refund will be credited directly to your bank account.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Cancellation */}
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
                4. Order Cancellations
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                If you cancel your order prior to dispatch, a full refund is automatically initiated to your original payment method. Dispatch happens within 12-24 hours of order confirmation.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
