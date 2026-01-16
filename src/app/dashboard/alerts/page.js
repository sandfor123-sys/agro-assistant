'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, CheckCircle2, Info, Clock, MapPin, Plus } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

async function fetchAlerts(userId = 1) {
    const res = await fetch(`/api/alerts?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
}

async function markAsRead(alertId, userId = 1) {
    const res = await fetch('/api/alerts/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_alerte: alertId, userId }),
    });
    if (!res.ok) throw new Error('Failed to mark as read');
    return res.json();
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchAlerts();
                setAlerts(data.alerts || []);
            } catch (e) {
                setError('Erreur de chargement');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleMarkAsRead = async (alertId) => {
        try {
            await markAsRead(alertId);
            setAlerts(alerts.map(a => a.id_alerte === alertId ? { ...a, lu: 1 } : a));
        } catch (e) {
            alert('Erreur lors du marquage comme lu');
        }
    };

    const levels = {
        'haute': 'bg-red-500/10 text-red-500 border-red-500/20',
        'moyenne': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        'basse': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="text-center text-text-secondary">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-warning/10 text-warning rounded-2xl">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Incidents & Alertes</h1>
                        <p className="text-text-secondary italic">Surveillez l'état de santé de vos cultures en temps réel.</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/alerts/declare"
                    className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Signaler un Incident
                </Link>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {alerts.map((alert) => (
                    <div
                        key={alert.id_alerte}
                        className={clsx(
                            "bg-surface rounded-2xl border p-6 transition-all hover:shadow-md flex flex-col md:flex-row gap-6",
                            alert.lu ? "opacity-75 border-border" : "border-primary/20 bg-primary/[0.02]"
                        )}
                    >
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <span className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                        levels[alert.priorite] || levels.moyenne
                                    )}>
                                        {alert.priorite === 'haute' ? 'Critique' : alert.priorite === 'basse' ? 'Information' : 'Avertissement'}
                                    </span>
                                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(alert.date_creation).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                {!alert.lu && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-1">{alert.titre}</h3>
                            <p className="text-text-secondary mb-4">{alert.message}</p>

                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <MapPin size={16} className="text-text-tertiary" />
                                    Parcelle: <span className="font-semibold text-foreground">{alert.nom_parcelle || 'Toutes les parcelles'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Info size={16} className="text-text-tertiary" />
                                    Type: <span className="font-semibold text-foreground uppercase">{alert.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex md:flex-col justify-end gap-2 shrink-0">
                            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                                Voir Détails
                            </button>
                            {!alert.lu && (
                                <button
                                    onClick={() => handleMarkAsRead(alert.id_alerte)}
                                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-surface-alt border border-border text-sm font-semibold hover:bg-surface transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} />
                                    Marquer lu
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="py-20 text-center bg-surface border border-dashed border-border rounded-3xl">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Tout est sous contrôle !</h3>
                        <p className="text-text-secondary">Aucun incident n'a été signalé sur vos parcelles.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
