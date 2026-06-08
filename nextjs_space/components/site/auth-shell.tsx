"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { AnimatedBg } from "./animated-bg";
import { Logo } from "./logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBg />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 text-white">
          <div className="flex flex-col items-center mb-6 justify-center">
            <Logo variant="circular" size="lg" href="/" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-center mb-1 tracking-tight">{title}</h1>
          {subtitle && <p className="text-center text-white/70 text-sm mb-6">{subtitle}</p>}
          {children}
        </div>
        <p className="text-center text-xs text-white/60 mt-4">Premium Electronics • India</p>
      </motion.div>
    </div>
  );
}
