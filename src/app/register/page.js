'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-subtle z-0"></div>

            <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl border border-white/10 relative z-10 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold font-display text-foreground">Créer un compte</h1>
                    <p className="text-text-secondary text-sm mt-1">Rejoignez la communauté AgriAssist.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Prénom</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                                <input
                                    type="text"
                                    placeholder="Jean"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Nom</label>
                            <input
                                type="text"
                                placeholder="Kouassi"
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                S'inscrire <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-border text-center">
                    <p className="text-sm text-text-secondary">
                        Déjà inscrit ?{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
