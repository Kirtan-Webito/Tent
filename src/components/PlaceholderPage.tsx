import { GearIcon } from '@radix-ui/react-icons';

export default function PlaceholderPage() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] animate-in fade-in duration-500">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <GearIcon className="w-12 h-12 text-gray-400 animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Coming Soon</h1>
            <p className="text-gray-400 max-w-md">
                This module is currently under development. Check back later for updates.
            </p>
        </div>
    );
}
