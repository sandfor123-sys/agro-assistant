'use client';

import { useState, useEffect, useMemo } from 'react';
import { Leaf, Calendar, CheckCircle, Info, ArrowRight, Sprout, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function TrackingPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const response = await fetch('/api/tracking?userId=1');
                const result = await response.json();
                setData(result.data || []);
            } catch (error) {
                console.error('Failed to fetch tracking data:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrackingData();
    }, []);

    const memoizedData = useMemo(() => {
        return data.map((p) => {
            const daysSincePlanting = Math.floor((new Date() - new Date(p.date_semis)) / (1000 * 60 * 60 * 24));
            const progress = Math.min(100, Math.round((daysSincePlanting / p.cycle_vie_jours) * 100));
            
            const stages = [
                { name: 'Semis', day: 0, icon: Sprout },
                { name: 'Croissance', day: Math.round(p.cycle_vie_jours * 0.2), icon: Leaf },
                { name: 'Floraison/Maturation', day: Math.round(p.cycle_vie_jours * 0.6), icon: Activity },
                { name: 'Récolte', day: p.cycle_vie_jours, icon: CheckCircle }
            ];
            
            return { ...p, daysSincePlanting, progress, stages };
        });
    }, [data]);

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-sm">
                        <Leaf size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Suivi de Culture</h1>
                        <p className="text-text-secondary italic">Chronologie détaillée du développement de vos parcelles.</p>
                    </div>
                </div>
            </header>

            <div className="space-y-12">
                {memoizedData.map((p) => (
                    <div key={p.id_parcelle} className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:border-primary/30 transition-all group">
                        <div className="p-6 md:p-8 border-b border-border bg-gradient-to-r from-surface to-surface-alt">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {p.nom_culture.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{p.nom_parcelle}</h2>
                                        <p className="text-sm text-text-secondary uppercase tracking-widest font-semibold">{p.nom_culture}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">Superficie</div>
                                        <div className="text-lg font-bold text-foreground">{p.superficie} ha</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">Progrès</div>
                                        <div className="text-lg font-bold text-foreground">{p.progress}%</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">Jours</div>
                                        <div className="text-lg font-bold text-foreground">{p.daysSincePlanting}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-foreground">Progression du Cycle</h3>
                                    <span className="text-xs text-text-tertiary">Jour {p.daysSincePlanting} / {p.cycle_vie_jours}</span>
                                </div>
                                <div className="w-full bg-surface-alt rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                                        style={{ width: `${p.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Calendrier de Développement
                                </h3>
                                <div className="space-y-4">
                                    {p.stages.map((stage, index) => {
                                        const isCompleted = p.daysSincePlanting >= stage.day;
                                        const isCurrent = p.daysSincePlanting >= stage.day - 5 && p.daysSincePlanting < stage.day + 5;
                                        
                                        return (
                                            <div key={index} className={clsx(
                                                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                                                isCompleted ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : 
                                                isCurrent ? "bg-primary/10 border-primary/30" : 
                                                "bg-surface-alt border-border"
                                            )}>
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                                    isCompleted ? "bg-green-500 text-white" : 
                                                    isCurrent ? "bg-primary text-white" : 
                                                    "bg-surface border border-border text-text-tertiary"
                                                )}>
                                                    <stage.icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-foreground">{stage.name}</h4>
                                                        <span className="text-sm text-text-secondary">Jour {stage.day}</span>
                                                    </div>
                                                    {isCurrent && (
                                                        <div className="text-xs text-primary font-medium mt-1">
                                                            Phase actuelle
                                                        </div>
                                                    )}
                                                    {isCompleted && !isCurrent && (
                                                        <div className="text-xs text-green-600 font-medium mt-1">
                                                            Terminé
                                                        </div>
                                                    )}
                                                </div>
                                                {index < p.stages.length - 1 && (
                                                    <ArrowRight size={16} className="text-text-tertiary" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && (
                <div className="py-20 text-center bg-surface border border-dashed border-border rounded-3xl">
                    <Sprout size={48} className="mx-auto mb-4 text-text-tertiary" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Pas de suivi actif</h3>
                    <p className="text-text-secondary">Plantez votre première parcelle pour commencer le suivi.</p>
                </div>
            )}
        </div>
    );
}
