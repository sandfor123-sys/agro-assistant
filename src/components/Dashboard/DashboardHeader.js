'use client';

import { useEffect, useState } from 'react';
import { Sprout, Bell, Activity, DollarSign, ExternalLink, Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardHeader({ greeting, stats, weather, action, financialTip }) {
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
    }, []);

    return (
        <header className="flex justify-between items-center relative">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                    {greeting}, {user.prenom} !
                </h1>
                <p className="text-text-secondary mt-1">
                    Bienvenue sur votre tableau de bord agricole intelligent
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <div className="text-sm text-text-secondary">Aujourd'hui</div>
                    <div className="font-semibold text-foreground">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <span className="text-lg font-bold">
                        {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'A'}
                    </span>
                </div>
            </div>
        </header>
    );
}
