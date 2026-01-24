import React from 'react';

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
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-100 opacity-40"></div>
                {/* Spinning Gradient Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 border-r-indigo-500 animate-spin"></div>
            </div>
        );
    }

    if (isMedium) {
        return (
            <div className={`relative w-10 h-10 ${className}`}>
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-100 opacity-40"></div>
                {/* Spinning Gradient Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-indigo-500 animate-spin"></div>
            </div>
        );
    }

    // Default Large Loader
    return (
        <div className={`flex flex-col items-center justify-center min-h-[50vh] w-full p-8 animate-in fade-in duration-300 ${className}`}>
            <div className="relative w-20 h-20 mb-6">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-100 opacity-40"></div>

                {/* Spinning Gradient Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-400 border-l-indigo-600 animate-spin"></div>

                {/* Inner Pulse */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 animate-pulse flex items-center justify-center shadow-inner">
                    {/* Musical Note Icon */}
                    <svg
                        className="w-6 h-6 text-purple-600 drop-shadow-sm"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
