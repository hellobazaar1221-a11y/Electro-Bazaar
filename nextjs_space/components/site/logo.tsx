"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Logo({
  size = "md",
  href = "/home",
  white = false,
  variant = "horizontal",
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
  white?: boolean;
  variant?: "circular" | "horizontal";
}) {
  const imgSize = size === "sm" ? 36 : size === "lg" ? 64 : 48;

  return (
    <Link href={href} className="flex items-center gap-3 no-tap-highlight">
      <div
        className="rounded-full overflow-hidden flex-shrink-0 shadow-lg border border-slate-700 bg-black"
        style={{ width: imgSize, height: imgSize }}
      >
        <Image
          src="/logo.jpg"
          alt="Electro Bazaar"
          width={imgSize}
          height={imgSize}
          className="object-cover w-full h-full"
          priority
        />
      </div>
      {variant === "horizontal" && (
        <span className={`font-display font-bold tracking-tight text-lg sm:text-xl hidden sm:inline-block ${white ? "text-white" : "text-foreground"}`}>
          Electro Bazaar
        </span>
      )}
    </Link>
  );
}
