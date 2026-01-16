'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Send, ArrowLeft, Camera, MapPin, Info, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function DeclareIncidentClient({ parcels }) {
    const searchParams = useSearchParams();
    const preselectedParcelId = searchParams.get('parcel');
    
    const [consumeStock, setConsumeStock] = useState(false);
    const [intrantsLoading, setIntrantsLoading] = useState(false);
    const [intrantsError, setIntrantsError] = useState('');
    const [intrants, setIntrants] = useState([]);
    const [selectedStockId, setSelectedStockId] = useState('');
    const [qty, setQty] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (consumeStock) {
            loadIntrants();
        }
    }, [consumeStock]);

    const sortedIntrants = useMemo(() => {
        return [...intrants].sort((a, b) => (a.nom_intrant || '').localeCompare(b.nom_intrant || ''));
    }, [intrants]);

    const loadIntrants = async () => {
        setIntrantsLoading(true);
        setIntrantsError('');
        try {
            const res = await fetch('/api/intrants?userId=1');
            const data = await res.json();
            if (!res.ok) {
                setIntrantsError((data && data.error) || 'Impossible de charger vos intrants.');
                setIntrants([]);
            } else {
                setIntrants(Array.isArray(data.intrants) ? data.intrants : []);
            }
        } catch (e) {
            setIntrantsError('Impossible de charger vos intrants.');
            setIntrants([]);
        } finally {
            setIntrantsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        const formData = new FormData(e.target);
        const titre = formData.get('titre');
        const message = formData.get('message');
        const priorite = formData.get('priorite');
        const idParcelle = formData.get('id_parcelle');
        const type = formData.get('type');
        const affectedPart = formData.get('affected_part');
        const growthStage = formData.get('growth_stage');
        const affectedPercentage = formData.get('affected_percentage');
        const weatherConditions = formData.get('weather_conditions');
        const actionsTaken = formData.get('actions_taken');

        // Build detailed message if observations are provided
        let detailedMessage = message;
        if (showDetails && (affectedPart || growthStage || affectedPercentage || weatherConditions || actionsTaken)) {
            detailedMessage += '\n\n**Observations détaillées:**\n';
            if (affectedPart) detailedMessage += `- Partie affectée: ${affectedPart}\n`;
            if (growthStage) detailedMessage += `- Stade de développement: ${growthStage}\n`;
            if (affectedPercentage) detailedMessage += `- Pourcentage affecté: ${affectedPercentage}%\n`;
            if (weatherConditions) detailedMessage += `- Conditions météo: ${weatherConditions}\n`;
            if (actionsTaken) detailedMessage += `- Actions entreprises: ${actionsTaken}\n`;
        }

        if (!titre || !detailedMessage || !type || !priorite) {
            setSubmitError('Veuillez remplir tous les champs obligatoires.');
            setSubmitting(false);
            return;
        }

        // Handle stock deduction if needed
        if (consumeStock) {
            const stockIdNum = Number(selectedStockId);
            const qNum = Number(qty);

            if (!Number.isFinite(stockIdNum) || stockIdNum <= 0) {
                setSubmitError('Veuillez choisir un intrant.');
                setSubmitting(false);
                return;
            }
            if (!Number.isFinite(qNum) || qNum <= 0) {
                setSubmitError('Veuillez entrer une quantité valide.');
                setSubmitting(false);
                return;
            }

            const selected = sortedIntrants.find((i) => Number(i.id_stock) === stockIdNum);
            const unit = selected?.unite_mesure || '';

            const ok = window.confirm(
                `Confirmer l'envoi du signalement et la déduction du stock ?\n\nIncident: ${titre}\nIntrant: ${selected?.nom_intrant || ''}\nQuantité: -${qNum} ${unit}`
            );
            if (!ok) {
                setSubmitting(false);
                return;
            }

            // First update stock
            try {
                const stockRes = await fetch('/api/stock/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stockId: selectedStockId,
                        quantity: Number(qty),
                        operation: 'deduct',
                        userId: 1
                    }),
                });

                const stockData = await stockRes.json().catch(() => null);
                if (!stockRes.ok) {
                    setSubmitError((stockData && stockData.error) || 'Erreur lors de la mise à jour du stock.');
                    setSubmitting(false);
                    return;
                }
            } catch (e) {
                setSubmitError('Erreur lors de la mise à jour du stock.');
                setSubmitting(false);
                return;
            }
        } else {
            const ok = window.confirm(`Confirmer l'envoi du signalement ?\n\nIncident: ${titre}`);
            if (!ok) {
                setSubmitting(false);
                return;
            }
        }

        // Then create alert
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titre,
                    message: detailedMessage,
                    type: String(type).slice(0, 50),
                    priorite,
                    id_parcelle: idParcelle || null,
                    userId: 1,
                }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setSubmitError((data && data.error) || "Erreur lors de l'envoi du signalement.");
                return;
            }

            window.location.href = '/dashboard/alerts';
        } catch (e) {
            setSubmitError("Erreur lors de l'envoi du signalement.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <Link href="/dashboard/alerts" className="inline-flex items-center gap-2 text-text-tertiary hover:text-primary transition-colors mb-6 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Retour aux incidents
            </Link>

            <header className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-red-500 text-white rounded-3xl shadow-lg shadow-red-500/20">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Signaler un Incident</h1>
                        <p className="text-text-secondary italic">Aidez l'IA à comprendre ce qu'il se passe réellement sur le terrain.</p>
                    </div>
                </div>
            </header>

            <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-tertiary uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Info size={14} className="text-primary" /> Objet du signalement
                            </label>
                            <input
                                name="titre"
                                type="text"
                                placeholder="Ex: Détection de Criquets"
                                required
                                className="w-full bg-surface-alt border border-border rounded-2xl px-6 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-tertiary"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-tertiary uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin size={14} className="text-primary" /> Parcelle Concernée
                            </label>
                            <select
                                name="id_parcelle"
                                defaultValue={preselectedParcelId || ''}
                                className="w-full bg-surface-alt border border-border rounded-2xl px-6 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                            >
                                <option value="">Toutes les parcelles</option>
                                {parcels.map(p => (
                                    <option key={p.id_parcelle} value={p.id_parcelle}>{p.nom_parcelle}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-tertiary uppercase tracking-widest ml-1">Type d'Incident</label>
                            <select
                                name="type"
                                className="w-full bg-surface-alt border border-border rounded-2xl px-6 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all appearance-none"
                            >
                                <option value="alerte">🚨 Alerte Sanitaire / Ravageurs</option>
                                <option value="tache">📅 Retard de Tâche</option>
                                <option value="stock">📦 Problème de Stock</option>
                                <option value="info">ℹ️ Observation Générale</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-text-tertiary uppercase tracking-widest ml-1">Niveau d'Urgence</label>
                            <div className="flex gap-4 p-1 bg-surface-alt rounded-2xl border border-border">
                                <PriorityOption value="haute" label="Critique" color="bg-red-500" name="priorite" />
                                <PriorityOption value="moyenne" label="Moyen" color="bg-amber-500" name="priorite" defaultChecked />
                                <PriorityOption value="basse" label="Info" color="bg-blue-500" name="priorite" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-text-tertiary uppercase tracking-widest ml-1">Description Détaillée</label>
                        <textarea
                            name="message"
                            rows={4}
                            placeholder="Décrivez brièvement ce que vous observez..."
                            required
                            className="w-full bg-surface-alt border border-border rounded-2xl px-6 py-4 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-text-tertiary"
                        />
                    </div>

                    <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                        <input
                            type="checkbox"
                            checked={consumeStock}
                            onChange={(e) => {
                                setConsumeStock(e.target.checked);
                                if (e.target.checked && intrants.length === 0) loadIntrants();
                            }}
                        />
                        Déduire un intrant du stock
                    </label>

                    {consumeStock && (
                        <div className="space-y-3">
                            {intrantsError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                                    {intrantsError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Intrant</label>
                                    <select
                                        className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        value={selectedStockId}
                                        onChange={(e) => setSelectedStockId(e.target.value)}
                                        disabled={intrantsLoading}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {sortedIntrants.map((i) => (
                                            <option key={i.id_stock} value={String(i.id_stock)}>
                                                {i.nom_intrant} ({i.quantite_actuelle ?? 0} {i.unite_mesure || ''})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Quantité à déduire</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {submitError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <button type="button" className="flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-border text-text-tertiary hover:border-primary hover:text-primary transition-all group">
                            <Camera size={20} className="group-hover:scale-110 transition-transform" />
                            Joindre une photo
                        </button>
                        <button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60">
                            <Send size={20} />
                            {submitting ? 'Envoi...' : 'Envoyer le signalement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PriorityOption({ value, label, color, name, defaultChecked = false }) {
    return (
        <label className="relative flex-1 cursor-pointer">
            <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-3 rounded-xl transition-all peer-checked:bg-white peer-checked:shadow-sm dark:peer-checked:bg-surface border border-transparent peer-checked:border-border">
                <div className={`w-2 h-2 rounded-full ${color} mb-1.5 shadow-[0_0_8px] shadow-current opacity-40 peer-checked:opacity-100`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary peer-checked:text-foreground">{label}</span>
            </div>
        </label>
    );
}
