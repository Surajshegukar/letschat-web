"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSplashLoading } from "@/hooks/use-splash-loading";
import { SplashBackground } from "@/components/SplashBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandLogo } from "@/components/BrandLogo";
import { ProgressBar } from "@/components/ProgressBar";
import { EncryptionNotice } from "@/components/EncryptionNotice";

export default function Home() {
  const { mounted, loadingProgress } = useSplashLoading();

  if (!mounted) return null;

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden bg-[#FAFAFC] text-slate-900 transition-colors duration-500 dark:bg-[#09090B] dark:text-slate-50 font-system">
      
      {/* 1. Ambient Web Background Layer */}
      <SplashBackground />

      {/* 2. Theme Toggle Header */}
      <ThemeToggle />

      {/* 3. Center Web Application Loader Layout */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 z-20">
        
        {/* Brand Logo component */}
        <BrandLogo size={128} />

        {/* Brand Header Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-6 flex flex-col items-center"
        >
          <h1 className="text-3xl font-bold tracking-[-0.03em] md:text-4xl text-slate-800 dark:text-white">
            Let's Chat
          </h1>
          {/* <div className="mt-1 flex items-center space-x-1.5">
            <span className="text-[10px] font-bold tracking-[0.4em] text-slate-400 dark:text-slate-500 pl-[0.4em] uppercase">
              Web Client
            </span>
          </div> */}
        </motion.div>

        {/* Dynamic Loading Progress Bar */}
        <ProgressBar progress={loadingProgress} />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mt-8 text-sm font-medium text-slate-600 dark:text-gray-100"
        >
          Real conversations. Anywhere. Anytime.
        </motion.p>
      </div>

      {/* 4. Desktop Bottom Encryption notice */}
      <EncryptionNotice />

    </div>
  );
}
