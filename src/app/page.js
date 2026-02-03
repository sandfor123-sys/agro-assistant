'use client';

import Link from 'next/link';
import { Sprout, BarChart3, ShieldCheck, ArrowRight, CheckCircle, Sparkles, Zap, Leaf } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
    useEffect(() => {
        // Check if user is new and redirect to onboarding
        const hasVisited = localStorage.getItem('hasVisitedBefore');
        const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');

        if (!hasVisited && !hasCompletedOnboarding) {
            localStorage.setItem('hasVisitedBefore', 'true');
            // Redirect to onboarding after a short delay
            setTimeout(() => {
                window.location.href = '/onboarding';
            }, 1000);
        }
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
            {/* Navbar */}
            <nav className="border-b border-border/20 backdrop-blur-xl sticky top-0 z-50 bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="bg-primary/10 p-2.5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            <Sprout size={28} />
                        </div>
                        <span className="text-2xl font-display font-bold text-foreground tracking-tight">AgriAssist <span className="text-primary">CI</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/onboarding" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
                            Formation
                        </Link>
                        <Link href="/login" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
                            Se connecter
                        </Link>
                        <Link href="/register" className="btn-primary scale-90 hover:scale-100 transition-all">
                            Commencer
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative pt-24 pb-36 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-subtle z-0"></div>
                    {/* Decorative Blobs */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-8 border border-emerald-100/50 shadow-sm reveal" style={{ animationDelay: '0.1s' }}>
                            <Sparkles size={14} className="animate-pulse" />
                            NOUVELLE VERSION 2.0
                        </div>
                        <h1 className="text-6xl md:text-8xl font-display font-extrabold text-foreground mb-8 leading-[1.1] tracking-tighter reveal" style={{ animationDelay: '0.2s' }}>
                            L'agriculture de précision <br />
                            <span className="text-gradient">à votre service.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed font-medium reveal" style={{ animationDelay: '0.3s' }}>
                            Optimisez vos rendements et sécurisez votre avenir. AgriAssist transforme vos données parcellaires en décisions stratégiques.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 reveal" style={{ animationDelay: '0.4s' }}>
                            <Link href="/dashboard" className="w-full sm:w-auto btn-primary !py-4 !px-10 text-lg group">
                                Accéder au Dashboard
                                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            <Link href="/onboarding" className="w-full sm:w-auto btn-secondary !py-4 !px-10 text-lg">
                                🎓 Suivre la formation
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20 reveal">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Tout pour votre exploitation</h2>
                            <p className="text-lg text-text-secondary max-w-2xl mx-auto font-medium">
                                Une suite technologique pensée par et pour les agriculteurs ivoiriens.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {[
                                {
                                    icon: <Zap className="text-amber-500" size={32} />,
                                    title: "Suivi Instantané",
                                    desc: "Gardez un oeil sur vos parcelles 24h/24 avec des alertes intelligentes basées sur la météo locale.",
                                    delay: '0.1s'
                                },
                                {
                                    icon: <Leaf className="text-emerald-500" size={32} />,
                                    title: "Agro-Expertise IA",
                                    desc: "Notre assistant analyse vos sols et cultures pour vous proposer le meilleur itinéraire technique.",
                                    delay: '0.2s'
                                },
                                {
                                    icon: <BarChart3 className="text-blue-500" size={32} />,
                                    title: "Rentabilité Maximisée",
                                    desc: "Calculez vos marges, gérez vos stocks et suivez vos dépenses pour un profit optimal.",
                                    delay: '0.3s'
                                }
                            ].map((feature, i) => (
                                <div key={i} className="glass-card p-10 rounded-[2.5rem] reveal group" style={{ animationDelay: feature.delay }}>
                                    <div className="mb-8 bg-surface-alt w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6 shadow-sm">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed font-medium">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface/50 border-t border-border/20 py-16 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3 group">
                        <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <Sprout size={24} />
                        </div>
                        <span className="text-xl font-display font-bold text-foreground">AgriAssist CI</span>
                    </div>
                    <div className="flex gap-8 text-sm font-semibold text-text-secondary">
                        <Link href="#" className="hover:text-primary transition-colors">Politique</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Conditions</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                    <div className="text-text-tertiary text-sm font-medium">
                        © 2026 AgriAssist CI. Fiermement 🇨🇮
                    </div>
                </div>
            </footer>
        </div>
    );
}
