'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    MagnifyingGlassIcon,
    CalendarIcon,
    PersonIcon,
    HomeIcon,
    SymbolIcon
} from '@radix-ui/react-icons';

type SearchResult = {
    id: string;
    type: 'BOOKING' | 'GUEST' | 'TENT';
    title: string;
    subtitle: string;
    status: string;
    url: string;
};

export default function GlobalSearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (!res.ok) {
                    setResults([]);
                    return;
                }
                const data = await res.json();
                setResults(data.results || []);
                setIsOpen(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleSelect(results[selectedIndex].url);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelect = (url: string) => {
        router.push(url);
        setIsOpen(false);
        setQuery('');
        setResults([]);
        inputRef.current?.blur();
    };

    return (
        <div ref={wrapperRef} className="relative w-full z-[100]">
            <div className="relative group">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search guests, bookings, tents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full p-1 bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none transition-all"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {loading ? (
                        <SymbolIcon className="animate-spin h-4 w-4 text-primary/40 mr-2" />
                    ) : (
                        <div className="flex items-center gap-2 pr-2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black border border-border rounded px-1 text-muted-foreground font-mono">ESC</span>
                            <div className="h-4 w-px bg-border hidden md:block" />
                            <MagnifyingGlassIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-card/95 backdrop-blur-2xl border border-border rounded-[1.5rem] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center px-4">
                        <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Results Node</div>
                        <div className="text-[9px] font-mono text-primary/60">{results.length} matched identifiers</div>
                    </div>
                    <div className="max-h-[min(450px,60vh)] overflow-y-auto custom-scrollbar p-1.5">
                        {results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result.url)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-4 group/item ${selectedIndex === index ? 'bg-secondary' : 'hover:bg-secondary/50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${selectedIndex === index ? 'scale-110 shadow-sm' : ''
                                    } ${result.type === 'BOOKING' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
                                        result.type === 'GUEST' ? 'bg-blue-100 text-blue-600 border border-blue-200' :
                                            'bg-orange-100 text-orange-600 border border-orange-200'
                                    }`}>
                                    {result.type === 'BOOKING' ? <CalendarIcon className="w-5 h-5" /> :
                                        result.type === 'GUEST' ? <PersonIcon className="w-5 h-5" /> :
                                            <HomeIcon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm truncate transition-colors ${selectedIndex === index ? 'text-primary' : 'text-foreground'
                                        }`}>
                                        {result.title}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter opacity-70 group-hover/item:opacity-100 transition-opacity">
                                        {result.subtitle}
                                    </div>
                                </div>
                                <div className={`text-[9px] font-black px-2.5 py-1 rounded-full border tracking-widest transition-all ${result.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                    result.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                        result.status === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-secondary text-muted-foreground border-border'
                                    }`}>
                                    {result.status}
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-3 bg-secondary/30 border-t border-border flex justify-between items-center px-4">
                        <div className="text-[10px] text-muted-foreground font-bold italic">
                            Navigation Active
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <span className="flex items-center justify-center text-[10px] font-black border border-border rounded-md w-5 h-5 text-muted-foreground font-mono">↑</span>
                                <span className="flex items-center justify-center text-[10px] font-black border border-border rounded-md w-5 h-5 text-muted-foreground font-mono">↓</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Select</span>
                            </div>
                            <div className="flex items-center gap-1.5 grayscale opacity-50">
                                <span className="flex items-center justify-center text-[10px] font-black border border-border rounded-md w-5 h-5 text-muted-foreground font-mono">↵</span>
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Execute</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
