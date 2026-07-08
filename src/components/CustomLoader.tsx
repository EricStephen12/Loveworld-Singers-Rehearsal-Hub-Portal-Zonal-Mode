'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CustomLoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string; // Allow custom classes like margins
}

export default function CustomLoader({ message, size = 'lg', className = '' }: CustomLoaderProps) {
    const isSmall = size === 'sm';
    const isMedium = size === 'md';

    if (isSmall) {
        return (
            <div className={`relative w-5 h-5 ${className}`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500"
                />
            </div>
        );
    }

    if (isMedium) {
        return (
            <div className={`relative w-10 h-10 ${className}`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-3 border-transparent border-t-indigo-500 border-r-purple-500"
                />
            </div>
        );
    }

    // Default Premium Large Loader
    return (
        <div className={`flex flex-col items-center justify-center min-h-[50vh] w-full p-8 ${className}`}>
            <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
                {/* Glowing Aura Behind */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"
                />

                {/* Outer Rotating Ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[3px] border-indigo-500/20 border-t-indigo-500"
                />

                {/* Inner Counter-Rotating Ring */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-3 rounded-full border-[3px] border-purple-500/20 border-b-purple-500"
                />

                {/* Center Pulsing Orb with Icon */}
                <motion.div 
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30 flex items-center justify-center"
                >
                    <svg
                        className="w-7 h-7 text-white drop-shadow-md"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </motion.div>
            </div>

            {/* Dynamic Animated Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-2"
            >
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                    {message || "Rehearsal Hub"}
                </h3>
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="flex gap-1 items-center mt-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </motion.div>
            </motion.div>
        </div>
    );
}
