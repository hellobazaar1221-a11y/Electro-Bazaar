"use client";
import { motion } from "framer-motion";

export function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden gradient-bg">
      <motion.div
        className="blob bg-blue-500"
        style={{ width: 500, height: 500, top: -100, left: -100 }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob bg-cyan-400"
        style={{ width: 400, height: 400, bottom: -100, right: -100 }}
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob bg-purple-500"
        style={{ width: 350, height: 350, top: "40%", left: "40%" }}
        animate={{ x: [0, 30, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
