'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sprout, Calendar, MapPin, Save, ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

async function getParcel(id, userId = 1) {
    try {
        const res = await fetch(`/api/parcels/${id}?userId=${userId}`);
        
        if (!res.ok) {
            if (res.status === 404) {
                return null; // Parcelle non trouvée
            }
            throw new Error(`Failed to fetch parcel: ${res.status} ${res.statusText}`);
        }
        
        return await res.json();
    } catch (error) {
        console.error('Error fetching parcel:', error);
        return null;
    }
}

export default function ParcelDetailPage({ params }) {
    const router = useRouter();
    const [parcel, setParcel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nom_parcelle: '',
        superficie: '',
        date_semis: '',
        statut: 'en_cours'
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadParcel() {
            try {
                const resolvedParams = await params;
                const { id } = resolvedParams;
                const parcelData = await getParcel(id);
                
                if (!parcelData) {
                    setError('Parcelle non trouvée');
                    return;
                }
                
                setParcel(parcelData);
                setFormData({
                    nom_parcelle: parcelData.nom_parcelle,
                    superficie: parcelData.superficie,
                    date_semis: parcelData.date_semis,
                    statut: parcelData.statut
                });
            } catch (err) {
                console.error('Load parcel error:', err);
                setError('Erreur lors du chargement de la parcelle');
            } finally {
                setLoading(false);
            }
        }
        loadParcel();
    }, [params]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        try {
            const resolvedParams = await params;
            const { id } = resolvedParams;
            
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

            router.push('/dashboard/parcels');
        } catch (e) {
            setError('Erreur lors de la mise à jour');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!parcel) return;
        
        const ok = confirm(`Supprimer la parcelle "${parcel.nom_parcelle}" ?\nCette action est irréversible.`);
        if (!ok) return;

        setIsDeleting(true);
        
        try {
            const resolvedParams = await params;
            const { id } = resolvedParams;
            
            const res = await fetch('/api/parcels', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_parcelle: id, userId: 1 })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                setError(err?.error || 'Erreur lors de la suppression');
                return;
            }

            router.push('/dashboard/parcels');
        } catch (e) {
            setError('Erreur lors de la suppression');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <div className="text-center text-text-secondary">Chargement...</div>
            </div>
        );
    }

    if (error || !parcel) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">
                    {error || 'Parcelle non trouvée'}
                </h1>
                <Link href="/dashboard/parcels" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Retour à la liste
                </Link>
            </div>
        );
    }

    const plantingDate = new Date(parcel.date_semis);
    const now = new Date();
    const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.round((daysSincePlanting / parcel.cycle_vie_jours) * 100));

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <Link href="/dashboard/parcels" className="inline-flex items-center gap-2 text-text-tertiary hover:text-primary transition-colors mb-6 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Retour aux parcelles
            </Link>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl" style={{ backgroundColor: parcel.couleur + '20', color: parcel.couleur }}>
                        <Sprout size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground leading-tight">{parcel.nom_parcelle}</h1>
                        <p className="text-text-secondary">{parcel.nom_culture} • {parcel.superficie} Hectares</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simulation Status Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-6">État de la Simulation</h3>

                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between text-xs font-semibold">
                                <span className="text-primary uppercase tracking-wider">Cycle de Progression</span>
                                <span className="text-primary">{progress}%</span>
                            </div>
                            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-surface-alt">
                                <div style={{ width: `${progress}%`, backgroundColor: parcel.couleur }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000"></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-text-tertiary uppercase tracking-tighter">
                                <span>Semis ({daysSincePlanting}j)</span>
                                <span>Récolte ({parcel.cycle_vie_jours}j)</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-border space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Statut Actuel</span>
                                <span className="font-bold text-emerald-500 uppercase tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {parcel.statut === 'en_cours' ? 'En Croissance' : parcel.statut}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Santé Estimée</span>
                                <span className="font-bold text-primary flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Excellente
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-8">Informations Générales</h3>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Nom de la Parcelle</label>
                                    <input
                                        name="nom_parcelle"
                                        type="text"
                                        value={formData.nom_parcelle}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-alt border border-border rounded-2xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Superficie (ha)</label>
                                    <input
                                        name="superficie"
                                        type="number"
                                        step="0.01"
                                        value={formData.superficie}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-alt border border-border rounded-2xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Date de Semis</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                                        <input
                                            name="date_semis"
                                            type="date"
                                            value={formData.date_semis}
                                            onChange={handleInputChange}
                                            className="w-full bg-surface-alt border border-border rounded-2xl pl-12 pr-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Statut</label>
                                    <select
                                        name="statut"
                                        value={formData.statut}
                                        onChange={handleInputChange}
                                        className="w-full bg-surface-alt border border-border rounded-2xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="en_cours">En cours</option>
                                        <option value="recolte">En récolte</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
                                    {error}
                                </div>
                            )}

                            <div className="pt-8 border-t border-border mt-8 flex justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Trash2 size={18} />
                                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isUpdating}
                                    className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
