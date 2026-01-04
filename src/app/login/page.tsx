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

            <div className="w-full max-w-md p-8 bg-white shadow-2xl border border-border rounded-2xl animate-fade-in relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-40 object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Sign in
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">Sign in to manage your website</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm text-center mb-6 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-primary"
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
        </div>
    );
}
