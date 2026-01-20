'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, AlertCircle, ShoppingCart, Plus, X } from 'lucide-react';

export default function InventoryClient({ stocks }) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [nomIntrant, setNomIntrant] = useState('');
    const [type, setType] = useState('');
    const [uniteMesure, setUniteMesure] = useState('');
    const [quantiteActuelle, setQuantiteActuelle] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');

    const sortedStocks = useMemo(() => {
        return [...(stocks || [])].sort((a, b) => (a.nom_intrant || '').localeCompare(b.nom_intrant || ''));
    }, [stocks]);

    const resetForm = () => {
        setNomIntrant('');
        setType('');
        setUniteMesure('');
        setQuantiteActuelle('');
        setError('');
    };

    const openEdit = (stock) => {
        setEditTarget(stock);
        setEditQuantity(stock?.quantite_actuelle ?? '0');
        setEditError('');
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setEditTarget(null);
        setEditQuantity('');
        setEditError('');
    };

    const submitEdit = async () => {
        setEditSubmitting(true);
        setEditError('');

        try {
            const res = await fetch('/api/stock', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1,
                    mode: 'set',
                    id_stock: editTarget?.id_stock,
                    quantite_actuelle: Number(editQuantity),
                }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setEditError((data && data.error) || 'Erreur lors de la mise à jour du stock.');
                return;
            }

            closeEdit();
            router.refresh();
        } catch (e) {
            setEditError('Erreur lors de la mise à jour du stock.');
        } finally {
            setEditSubmitting(false);
        }
    };

    const closeModal = () => {
        setOpen(false);
        resetForm();
    };

    const submit = async () => {
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/intrants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1,
                    nom_intrant: nomIntrant,
                    type: type || null,
                    unite_mesure: uniteMesure || null,
                    quantite_actuelle: quantiteActuelle,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                setError((data && data.error) || "Une erreur est survenue.");
                return;
            }

            closeModal();
            router.refresh();
        } catch (e) {
            setError("Impossible d'enregistrer l'intrant.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">Stock & Intrants</h1>
                    <p className="text-text-secondary italic">Gérez vos engrais, semences et produits phytosanitaires.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Ajouter un Intrant
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Ajouter un intrant</h2>
                            <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-surface-alt">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Sélectionner un intrant connu (Optionnel)</label>
                                <select
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    onChange={(e) => {
                                        const selected = e.target.value;
                                        if (selected) {
                                            const [nom, type, unite] = selected.split('|');
                                            setNomIntrant(nom);
                                            setType(type);
                                            setUniteMesure(unite);
                                        }
                                    }}
                                >
                                    <option value="">-- Choisir un intrant standard --</option>
                                    <option value="NPK 15-15-15|Engrais|kg">NPK 15-15-15</option>
                                    <option value="Urée 46%|Engrais|kg">Urée 46%</option>
                                    <option value="Sulfate de Potassium|Engrais|kg">Sulfate de Potassium</option>
                                    <option value="Dolomie|Amendement|kg">Dolomie</option>
                                    <option value="Glyphosate|Herbicide|L">Glyphosate</option>
                                    <option value="Cyperméthrine|Insecticide|L">Cyperméthrine</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Nom</label>
                                <input
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={nomIntrant}
                                    onChange={(e) => setNomIntrant(e.target.value)}
                                    placeholder="Ex: NPK 15-15-15"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
                                <input
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    placeholder="Ex: Engrais"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Unité</label>
                                    <input
                                        className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        value={uniteMesure}
                                        onChange={(e) => setUniteMesure(e.target.value)}
                                        placeholder="Ex: kg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Quantité actuelle</label>
                                    <input
                                        type="number"
                                        className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        value={quantiteActuelle}
                                        onChange={(e) => setQuantiteActuelle(e.target.value)}
                                        placeholder="Ex: 50"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-alt transition-all font-semibold"
                                    disabled={submitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={submit}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-semibold disabled:opacity-60"
                                    disabled={submitting || !nomIntrant.trim()}
                                >
                                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={closeEdit} />
                    <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Mettre à jour le stock</h2>
                            <button type="button" onClick={closeEdit} className="p-2 rounded-lg hover:bg-surface-alt">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface-alt/50 border border-border/60 rounded-xl px-4 py-3">
                                <div className="font-semibold text-foreground">{editTarget?.nom_intrant}</div>
                                <div className="text-xs text-text-tertiary">{editTarget?.type || 'Intrant'}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Nouvelle quantité</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                />
                                <div className="text-xs text-text-tertiary mt-1">Unité: {editTarget?.unite_mesure || '-'}</div>
                            </div>

                            {editError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                                    {editError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEdit}
                                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-alt transition-all font-semibold"
                                    disabled={editSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={submitEdit}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-semibold disabled:opacity-60"
                                    disabled={editSubmitting}
                                >
                                    {editSubmitting ? 'Mise à jour...' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedStocks.map((s) => {
                    const isLow = s.quantite_actuelle < 5;

                    return (
                        <div key={s.id_stock} className="bg-surface rounded-2xl border border-border p-6 hover:border-primary/50 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-surface-alt rounded-lg text-primary">
                                    <Package size={24} />
                                </div>
                                {isLow && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                                        <AlertCircle size={14} />
                                        Stock Faible
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-foreground mb-1">{s.nom_intrant}</h3>
                            <div className="text-3xl font-display font-bold text-primary mb-4">
                                {s.quantite_actuelle} <span className="text-lg font-medium text-text-tertiary">{s.unite_mesure}</span>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => openEdit(s)}
                                    className="flex-1 py-2 rounded-lg bg-surface-alt border border-border hover:bg-surface text-sm font-semibold transition-all"
                                >
                                    Mettre à jour
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                                    <ShoppingCart size={16} />
                                    Commander
                                </button>
                            </div>
                        </div>
                    );
                })}

                {sortedStocks.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-surface border border-dashed border-border rounded-3xl">
                        <Package size={48} className="mx-auto mb-4 text-text-tertiary" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Inventaire vide</h3>
                        <p className="text-text-secondary">Vous n'avez pas encore d'intrants en stock.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
