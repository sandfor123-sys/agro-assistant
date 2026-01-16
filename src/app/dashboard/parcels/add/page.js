'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sprout } from 'lucide-react';
import Link from 'next/link';

export default function AddParcelPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nom_parcelle: '',
        superficie: '',
        id_culture: '',
        date_semis: '',
        statut: 'en_cours'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cultures = [
        { id: 1, nom: 'Maïs', cycle_vie_jours: 120, couleur: '#fbbf24' },
        { id: 2, nom: 'Manioc', cycle_vie_jours: 270, couleur: '#84cc16' },
        { id: 3, nom: 'Cacao', cycle_vie_jours: 1825, couleur: '#a16207' },
        { id: 4, nom: 'Hévéa', cycle_vie_jours: 2190, couleur: '#065f46' },
        { id: 5, nom: 'Riz', cycle_vie_jours: 120, couleur: '#fde047' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Creating parcel with data:', {
                ...formData,
                superficie: Number(formData.superficie),
                id_culture: Number(formData.id_culture),
                userId: 1
            });

            const res = await fetch('/api/parcels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    superficie: Number(formData.superficie),
                    id_culture: Number(formData.id_culture),
                    userId: 1
                }),
            });

            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                console.error('API Error:', err);
                if (err.error) {
                    setError(err.error);
                } else {
                    setError('Erreur lors de la création. Veuillez réessayer.');
                }
                return;
            }

            const responseData = await res.json();
            console.log('Success response:', responseData);

            router.push('/dashboard/parcels');
        } catch (e) {
            console.error('Creation error:', e);
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard/parcels" className="inline-flex items-center gap-2 text-text-secondary hover:text-foreground mb-4">
                    <ArrowLeft size={16} />
                    Retour aux parcelles
                </Link>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                    <Sprout className="text-primary" />
                    Nouvelle Parcelle
                </h1>
                <p className="text-text-secondary italic">Ajoutez une nouvelle parcelle à votre exploitation.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Nom de la parcelle</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                value={formData.nom_parcelle}
                                onChange={(e) => setFormData({...formData, nom_parcelle: e.target.value})}
                                placeholder="Ex: Champ Nord"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Superficie (hectares)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                required
                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                value={formData.superficie}
                                onChange={(e) => setFormData({...formData, superficie: e.target.value})}
                                placeholder="Ex: 2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Culture</label>
                            <select
                                required
                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                value={formData.id_culture}
                                onChange={(e) => setFormData({...formData, id_culture: e.target.value})}
                            >
                                <option value="">Sélectionner une culture</option>
                                {cultures.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Date de semis</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                value={formData.date_semis}
                                onChange={(e) => setFormData({...formData, date_semis: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Link
                        href="/dashboard/parcels"
                        className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-surface-alt transition-all"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? 'Création...' : 'Créer la parcelle'}
                    </button>
                </div>
            </form>
        </div>
    );
}
