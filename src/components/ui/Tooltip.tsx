'use client';

import React from 'react';

export default function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    return (
        <div className="relative group/tooltip w-full">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900/95 text-white text-[9px] font-medium rounded-md opacity-0 translate-y-1 group-hover/tooltip:opacity-100 group-hover/tooltip:translate-y-0 transition-all duration-200 whitespace-nowrap pointer-events-none z-[100] shadow-xl border border-white/10 flex flex-col items-center">
                {text}
                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
            </div>
        </div>
    );
}
