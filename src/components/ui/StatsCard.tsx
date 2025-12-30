export default function StatsCard({ label, value, subtext, icon, className }: { label: string, value: string | number, subtext?: string, icon?: React.ReactNode, className?: string }) {
    return (
        <div className={`p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.06] transition-all duration-500 relative overflow-hidden group shadow-2xl ${className}`}>
            {/* Ambient Background Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />

            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 transform translate-x-2 -translate-y-2">
                {icon}
            </div>

            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter transition-transform duration-500 group-hover:translate-x-1">{value}</h3>
                {subtext && (
                    <div className="flex items-center gap-2 mt-4">
                        <div className="h-1 w-8 bg-primary/30 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-2/3 group-hover:w-full transition-all duration-1000" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{subtext}</p>
                    </div>
                )}
            </div>

            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
}
