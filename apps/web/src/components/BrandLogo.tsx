'use client';
import React from "react";
import { motion } from "framer-motion";
import { BrandLogoProps } from "@/types/splash";

export function BrandLogo({ size = 112, className = "" }: BrandLogoProps) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative flex items-center justify-center bg-transparent ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        className="w-full h-full drop-shadow-[0_8px_24px_rgba(0,201,255,0.15)]"
        viewBox="130 95 140 140"
      >
        <defs>
          <linearGradient id="webLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C9FF" />
            <stop offset="100%" stopColor="#19E68C" />
          </linearGradient>
        </defs>
        {/* Background Outer Chat Bubble */}
        <path
          d="M200 100C235 100 265 115 265 165C265 205 240 230 200 230C155 230 135 205 135 165C135 125 165 100 200 100Z"
          fill="url(#webLogoGrad)"
        />
        {/* Inner White Chat Bubble */}
        <path
          d="M200 120C175.147 120 155 140.147 155 165C155 178.977 161.385 191.467 171.46 199.748L170 210L188.75 206.25C192.362 208.66 196.025 210 200 210C224.853 210 245 189.853 245 165C245 140.147 224.853 120 200 120Z"
          fill="#FFFFFF"
        />
        {/* Conversations Indicators */}
        <circle cx="181.25" cy="165" r="4.5" fill="#19E68C" />
        <circle cx="200" cy="165" r="4.5" fill="#19E68C" />
        <circle cx="218.75" cy="165" r="4.5" fill="#19E68C" />
      </svg>
    </motion.div>
  );
}
