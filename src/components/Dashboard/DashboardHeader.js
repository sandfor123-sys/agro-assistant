'use client';

import { useEffect, useState } from 'react';
import { Sprout, Bell, Activity, DollarSign, ExternalLink, Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardHeader({ greeting }) {
    const [user, setUser] = useState({ prenom: 'Agriculteur', nom: '' });

    useEffect(() => {
        // Récupérer les infos utilisateur depuis localStorage
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }

        // Listen for storage changes (for profile updates)
        const handleSync = () => {
            const info = localStorage.getItem('userInfo');
            if (info) setUser(JSON.parse(info));
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    return (
        <header className="flex justify-between items-center relative reveal">
            <div>
                <div className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-2">TABLEAU DE BORD</div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">
                    {greeting}, <span className="text-primary">{user.prenom}</span>
                </h1>
                <p className="text-text-secondary mt-2 font-medium text-lg opacity-80">
                    Gérez votre exploitation avec intelligence.
                </p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right hidden lg:block">
                    <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1">Aujourd'hui</div>
                    <div className="font-bold text-foreground text-lg">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
                <div className="w-16 h-16 bg-white shadow-xl rounded-[1.25rem] border border-border/30 flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
                    <span className="text-2xl font-black text-primary group-hover:rotate-12 transition-transform">
                        {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'A'}
                    </span>
                </div>
            </div>
        </header>
    );
}
