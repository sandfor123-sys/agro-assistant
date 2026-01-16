'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Calendar, MapPin, ArrowRight, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import Link from 'next/link';

async function fetchParcels(userId = 1) {
    const res = await fetch(`/api/parcels?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch parcels');
    return res.json();
}

export default function ParcelsPage() {
    const router = useRouter();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchParcels();
                setParcels(data.parcels || []);
            } catch (e) {
                setError('Erreur de chargement');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleDelete = async (id_parcelle, nom_parcelle) => {
        const ok = confirm(`Supprimer la parcelle "${nom_parcelle}" ?\nCette action est irréversible.`);
        if (!ok) return;

        try {
            const res = await fetch('/api/parcels', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_parcelle, userId: 1 }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                setError(err?.error || 'Erreur lors de la suppression');
                return;
            }

            setParcels(parcels.filter(p => p.id_parcelle !== id_parcelle));
            setError('');
        } catch (e) {
            setError('Erreur lors de la suppression');
        }
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">Mes Parcelles</h1>
                    <p className="text-text-secondary italic">Gérez vos cultures actives et suivez leur progression.</p>
                </div>
                <Link 
                    href="/dashboard/parcels/add"
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nouvelle Parcelle
                </Link>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parcels.map((p) => {
                    const plantingDate = new Date(p.date_semis);
                    const now = new Date();
                    const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
                    const progress = Math.min(100, Math.round((daysSincePlanting / p.cycle_vie_jours) * 100));

                    return (
                        <div 
                            key={p.id_parcelle}
                            className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all group shadow-sm"
                        >
                            <div className="h-3 w-full" style={{ backgroundColor: p.couleur || 'var(--color-primary)' }}></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <Link
                                            href={`/dashboard/parcels/${p.id_parcelle}`}
                                            className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors hover:underline block"
                                        >
                                            {p.nom_parcelle}
                                        </Link>
                                        <div className="flex items-center gap-2 text-text-tertiary text-sm">
                                            <Sprout size={14} />
                                            <span>{p.nom_culture}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-surface-alt px-3 py-1 rounded-full text-xs font-semibold text-primary border border-border">
                                            {progress}%
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(p.id_parcelle, p.nom_parcelle);
                                            }}
                                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                                        <Calendar size={16} />
                                        <span>Semé le {new Date(p.date_semis).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                                        <MapPin size={16} />
                                        <span>Taille: {p.superficie} ha</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
                                        <span>Progression du cycle</span>
                                        <span>{daysSincePlanting}j / {p.cycle_vie_jours}j</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/alerts/declare?parcel=${p.id_parcelle}`}
                                        className="w-full py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 flex items-center justify-center gap-1 text-xs font-semibold transition-all"
                                    >
                                        <AlertTriangle size={14} />
                                        Signaler un problème
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {parcels.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-surface border border-dashed border-border rounded-3xl">
                        <div className="bg-surface-alt w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-text-tertiary">
                            <Sprout size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Aucune parcelle pour le moment</h3>
                        <p className="text-text-secondary mb-6">Commencez par ajouter votre première parcelle pour suivre vos cultures.</p>
                        <Link 
                            href="/dashboard/parcels/add"
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Ajouter une parcelle
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
