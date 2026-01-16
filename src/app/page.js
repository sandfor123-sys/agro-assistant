'use client';

import Link from 'next/link';
import { Sprout, BarChart3, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <Sprout size={24} />
                        </div>
                        <span className="text-xl font-display font-bold text-foreground">AgriAssist CI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/onboarding" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                            Formation
                        </Link>
                        <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                            Se connecter
                        </Link>
                        <Link href="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20">
                            Commencer
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-subtle z-0"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6 border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Nouvelle Version 2.0 Disponible
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-tight tracking-tight">
                            L'agriculture de précision <br />
                            <span className="text-transparent bg-clip-text bg-gradient-primary">à portée de main.</span>
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
                            Optimisez vos rendements, suivez vos parcelles et prenez des décisions éclairées grâce à notre assistant agricole intelligent.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/dashboard" className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 group">
                                Accéder au Dashboard
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/onboarding" className="w-full sm:w-auto bg-surface-alt hover:bg-surface text-foreground border border-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center">
                                🎓 Lancer la formation
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-surface-alt/50 border-t border-border/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Tout ce dont vous avez besoin</h2>
                            <p className="text-text-secondary max-w-2xl mx-auto">
                                Une suite complète d'outils pour gérer votre exploitation agricole moderne.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <BarChart3 className="text-blue-500" size={32} />,
                                    title: "Suivi en Temps Réel",
                                    desc: "Visualisez l'état de vos cultures et recevez des alertes personnalisées pour agir au bon moment."
                                },
                                {
                                    icon: <ShieldCheck className="text-emerald-500" size={32} />,
                                    title: "Conseils Agronomiques",
                                    desc: "Bénéficiez de l'expertise de notre IA pour optimiser l'utilisation de vos intrants et protéger vos sols."
                                },
                                {
                                    icon: <Sprout className="text-amber-500" size={32} />,
                                    title: "Gestion de Parcelles",
                                    desc: "Cartographiez vos terres, suivez l'historique des cultures et prévoyez vos récoltes avec précision."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="bg-surface p-8 rounded-2xl border border-border hover:border-primary/20 transition-colors hover:shadow-lg">
                                    <div className="mb-4 bg-surface-alt w-14 h-14 rounded-xl flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-surface border-t border-white/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-text-primary font-bold">
                        <Sprout size={20} className="text-primary" />
                        AgriAssist CI
                    </div>
                    <div className="text-text-secondary text-sm">
                        © 2026 AgriAssist CI. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}
