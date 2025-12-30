import React from 'react';

interface BarChartProps {
    data: { label: string; value: number; fullValue?: number; color?: string }[];
    maxVal?: number;
    height?: number;
}

export default function BarChart({ data, maxVal, height = 200 }: BarChartProps) {
    const max = maxVal || Math.max(...data.map(d => d.value), ...data.map(d => d.fullValue || 0), 1);

    return (
        <div className="w-full flex items-end justify-between gap-3 md:gap-4" style={{ height }}>
            {data.map((item, idx) => {
                const percent = (item.value / max) * 100;
                const capacityPercent = item.fullValue ? (item.fullValue / max) * 100 : 0;

                return (
                    <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex items-end justify-center h-full bg-white/[0.03] rounded-t-xl overflow-hidden hover:bg-white/[0.08] transition-all duration-300 border-x border-t border-white/5">
                            {/* Capacity Background Bar */}
                            {item.fullValue && (
                                <div
                                    className="absolute bottom-0 w-full bg-white/5 transition-all duration-700"
                                    style={{ height: `${capacityPercent}%` }}
                                />
                            )}

                            {/* Value Bar */}
                            <div
                                className={`w-full ${item.color || 'bg-indigo-500'} opacity-70 group-hover:opacity-100 transition-all duration-700 ease-out relative shadow-lg shadow-black/20`}
                                style={{ height: `${percent}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />

                                {/* Tooltip */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 shadow-2xl pointer-events-none">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-400 uppercase text-[8px] mb-0.5">{item.label}</span>
                                        <span>{item.value} / {item.fullValue || 'N/A'} Guests</span>
                                    </div>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-white/10 rotate-45" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate w-full text-center group-hover:text-indigo-400 transition-colors" title={item.label}>
                            {item.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
