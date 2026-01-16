'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Calendar, MapPin, ArrowRight, Plus, AlertTriangle, Trash2, CheckCircle2, Edit2, Save, X } from 'lucide-react';
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
    const [editingId, setEditingId] = useState(null);
    const [editForms, setEditForms] = useState({});

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

    const handleEdit = (parcel) => {
        setEditingId(parcel.id_parcelle);
        setEditForms({
            ...editForms,
            [parcel.id_parcelle]: {
                nom_parcelle: parcel.nom_parcelle,
                superficie: parcel.superficie,
                statut: parcel.statut
            }
        });
    };

    const handleCancelEdit = (id) => {
        setEditingId(null);
        setEditForms(prev => {
            const newForms = { ...prev };
            delete newForms[id];
            return newForms;
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            const formData = editForms[id];
            const res = await fetch(`/api/parcels/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    superficie: Number(formData.superficie),
                    userId: 1
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                setError(err?.error || 'Erreur lors de la mise à jour');
                return;
            }

            // Mettre à jour la liste localement
            setParcels(prev => prev.map(p => 
                p.id_parcelle === id 
                    ? { ...p, ...formData, superficie: Number(formData.superficie) }
                    : p
            ));
            
            setEditingId(null);
            setEditForms(prev => {
                const newForms = { ...prev };
                delete newForms[id];
                return newForms;
            });
            
            setError('');
        } catch (e) {
            setError('Erreur réseau');
        }
    };

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
                    const isEditing = editingId === p.id_parcelle;
                    const editForm = editForms[p.id_parcelle] || {};

                    return (
                        <div 
                            key={p.id_parcelle}
                            className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all group shadow-sm"
                        >
                            <div className="h-3 w-full" style={{ backgroundColor: p.couleur || 'var(--color-primary)' }}></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.nom_parcelle || ''}
                                                onChange={(e) => setEditForms(prev => ({
                                                    ...prev,
                                                    [p.id_parcelle]: {
                                                        ...prev[p.id_parcelle],
                                                        nom_parcelle: e.target.value
                                                    }
                                                }))}
                                                className="text-xl font-bold text-foreground mb-1 bg-surface-alt border border-border rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        ) : (
                                            <Link
                                                href={`/dashboard/parcels/${p.id_parcelle}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors hover:underline block"
                                            >
                                                {p.nom_parcelle}
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-2 text-text-tertiary text-sm">
                                            <Sprout size={14} />
                                            <span>{p.nom_culture}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleSaveEdit(p.id_parcelle)}
                                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                                                    title="Sauvegarder"
                                                >
                                                    <Save size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleCancelEdit(p.id_parcelle)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                                    title="Annuler"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id_parcelle, p.nom_parcelle)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1">Superficie (ha)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={editForm.superficie || ''}
                                                    onChange={(e) => setEditForms(prev => ({
                                                        ...prev,
                                                        [p.id_parcelle]: {
                                                            ...prev[p.id_parcelle],
                                                            superficie: e.target.value
                                                        }
                                                    }))}
                                                    className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-text-secondary mb-1">Statut</label>
                                                <select
                                                    value={editForm.statut || ''}
                                                    onChange={(e) => setEditForms(prev => ({
                                                        ...prev,
                                                        [p.id_parcelle]: {
                                                            ...prev[p.id_parcelle],
                                                            statut: e.target.value
                                                        }
                                                    }))}
                                                    className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                >
                                                    <option value="en_cours">En cours</option>
                                                    <option value="recolte">En récolte</option>
                                                    <option value="termine">Terminé</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 text-text-secondary text-sm">
                                                <Calendar size={16} />
                                                <span>Semé le {new Date(p.date_semis).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-text-secondary text-sm">
                                                <MapPin size={16} />
                                                <span>Taille: {p.superficie} ha</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Progress Bar - toujours visible */}
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

                                {/* Actions - seulement en mode non-édition */}
                                {!isEditing && (
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/alerts/declare?parcel=${p.id_parcelle}`}
                                            className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 flex items-center justify-center gap-1 text-xs font-semibold transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <AlertTriangle size={14} />
                                            Signaler
                                        </Link>
                                        <Link
                                            href={`/dashboard/parcels/${p.id_parcelle}`}
                                            className="flex-1 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center gap-1 text-xs font-semibold transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Voir détails
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                )}
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
