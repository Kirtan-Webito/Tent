'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeIcon, SymbolIcon } from '@radix-ui/react-icons';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on role
            if (data.role === 'SUPER_ADMIN') router.push('/super-admin/dashboard');
            else if (data.role === 'EVENT_ADMIN') router.push('/event-admin/sectors');
            else if (data.role === 'DESK_ADMIN') router.push('/desk-admin/booking');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />

            <div className="w-full max-w-md p-8 glass rounded-2xl animate-fade-in relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4 border border-primary/20">
                        <HomeIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">Sign in to manage your event permissions</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm text-center mb-6 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input-primary bg-black/40 border-white/10 focus:border-primary/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-primary bg-black/40 border-white/10 focus:border-primary/50"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary h-11 text-base shadow-lg shadow-primary/20 mt-4"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <SymbolIcon className="w-4 h-4 animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>

            <div className="absolute bottom-8 text-center text-xs text-gray-500">
                &copy; 2024 Tent Management System. Secure Access Only.
            </div>
        </div>
    );
}
