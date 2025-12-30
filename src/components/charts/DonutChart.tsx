import React from 'react';

interface DonutSegment {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    value?: number; // 0 to 100 (for single segment)
    label?: string;
    sublabel?: string;
    color?: string; // Tailwind class or hex (for single segment)
    size?: number;
    data?: DonutSegment[]; // Explicit segments (for multi-segment)
}

export default function DonutChart({
    value,
    label,
    sublabel,
    color = "text-emerald-500",
    size = 180,
    data
}: DonutChartProps) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    // Normalize data: if 'data' is provided, use it. Otherwise, use 'value'.
    const segments: DonutSegment[] = data || (value !== undefined ? [
        { label: label || '', value, color: color.startsWith('text-') ? 'currentColor' : color },
        { label: 'Remaining', value: 100 - value, color: 'transparent' }
    ] : []);

    const total = segments.reduce((sum, s) => sum + s.value, 0);
    let cumulativeOffset = 0;

    return (
        <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                {/* Background Circle */}
                <circle
                    className="text-white/10"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="100"
                    cy="100"
                />
                {/* Segments */}
                {segments.map((segment, i) => {
                    const segmentValue = total > 0 ? (segment.value / total) * circumference : 0;
                    const strokeOffset = circumference - segmentValue + cumulativeOffset;
                    const result = (
                        <circle
                            key={i}
                            className={`${segment.color.startsWith('text-') ? segment.color : ''} transition-all duration-1000 ease-out`}
                            strokeWidth="12"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            strokeLinecap="round"
                            stroke={!segment.color.startsWith('text-') ? segment.color : 'currentColor'}
                            fill="transparent"
                            r={radius}
                            cx="100"
                            cy="100"
                        />
                    );
                    cumulativeOffset -= segmentValue;
                    return result;
                })}
            </svg>
            <div className="absolute flex flex-col items-center text-center">
                {value !== undefined ? (
                    <>
                        <span className={`text-4xl font-bold ${color.startsWith('text-') ? color : ''}`} style={{ color: !color.startsWith('text-') ? color : undefined }}>{value}%</span>
                        <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</span>
                    </>
                ) : (
                    <div className="text-2xl font-black text-white">{total}</div>
                )}
                {sublabel && <span className="text-[10px] text-gray-500">{sublabel}</span>}
            </div>
        </div>
    );
}
