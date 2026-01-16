import pool from '@/lib/db';
import { Sprout, Calendar, MapPin, Save, ArrowLeft, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function getParcel(id, userId = 1) {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p
            JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_parcelle = ? AND p.id_utilisateur = ?
        `, [id, userId]);
        return rows[0];
    } catch (error) {
        console.error('Error fetching parcel:', error);
        return null;
    }
}

export default async function ParcelDetailPage({ params }) {
    try {
        const { id } = await params;
        const parcel = await getParcel(id);

        if (!parcel) {
            return (
                <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Parcelle non trouvée</h1>
                    <Link href="/dashboard/parcels" className="text-primary hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Retour à la liste
                    </Link>
                </div>
            );
        }

    async function updateParcel(formData) {
        'use server';
        const nom = formData.get('nom');
        const superficie = formData.get('superficie');
        const dateSemis = formData.get('date_semis');
        const statut = formData.get('statut');

        await pool.query(
            'UPDATE parcelle SET nom_parcelle = ?, superficie = ?, date_semis = ?, statut = ? WHERE id_parcelle = ?',
            [nom, superficie, dateSemis, statut, id]
        );

        redirect('/dashboard/parcels');
    }

    async function deleteParcel() {
        'use server';
        await pool.query('DELETE FROM parcelle WHERE id_parcelle = ?', [id]);
        redirect('/dashboard/parcels');
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
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-semibold">
                        <Trash2 size={18} />
                        Supprimer
                    </button>
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

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-amber-500 text-white rounded-lg">
                                <AlertTriangle size={18} />
                            </div>
                            <h4 className="font-bold text-amber-500 leading-tight pt-1">Ajuster la réalité</h4>
                        </div>
                        <p className="text-xs text-amber-600/80 leading-relaxed">
                            Si la progression affichée ne correspond pas à ce que vous observez sur le terrain, vous pouvez corriger la **date de semis** ici.
                        </p>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-8">Informations Générales</h3>

                        <form action={updateParcel} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Nom de la Parcelle</label>
                                    <input
                                        name="nom"
                                        type="text"
                                        defaultValue={parcel.nom_parcelle}
                                        className="w-full bg-surface-alt border border-border rounded-2xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Superficie (ha)</label>
                                    <input
                                        name="superficie"
                                        type="number"
                                        step="0.01"
                                        defaultValue={parcel.superficie}
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
                                            defaultValue={new Date(parcel.date_semis).toISOString().split('T')[0]}
                                            className="w-full bg-surface-alt border border-border rounded-2xl pl-12 pr-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-tertiary uppercase ml-1">Statut</label>
                                    <select
                                        name="statut"
                                        defaultValue={parcel.statut}
                                        className="w-full bg-surface-alt border border-border rounded-2xl px-5 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="en_cours">En cours</option>
                                        <option value="recolte">En récolte</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border mt-8 flex justify-between">
                                <form action={deleteParcel} onSubmit={(e) => {
                                    if (!confirm(`Supprimer la parcelle "${parcel.nom_parcelle}" ?\nCette action est irréversible.`)) {
                                        e.preventDefault();
                                    }
                                }}>
                                    <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center gap-2">
                                        <Trash2 size={18} />
                                        Supprimer
                                    </button>
                                </form>
                                <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center gap-3">
                                    <Save size={20} />
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
    } catch (error) {
        console.error('Error in ParcelDetailPage:', error);
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-4">Erreur de chargement</h1>
                <p className="text-text-secondary mb-4">Impossible de charger les détails de cette parcelle.</p>
                <Link href="/dashboard/parcels" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Retour à la liste
                </Link>
            </div>
        );
    }
}
