'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, PieChart, Info, ArrowRight, Download } from 'lucide-react';
import ExportPDF from '@/components/ExportPDF';

const CROP_DATA = {
    'Maïs': { yieldBase: 4000, pricePerKg: 250, costBase: 500000 },
    'Manioc': { yieldBase: 18000, pricePerKg: 100, costBase: 750000 },
    'Cacao': { yieldBase: 600, pricePerKg: 1500, costBase: 550000 },
    'Hévea': { yieldBase: 1600, pricePerKg: 650, costBase: 650000 },
    'Riz': { yieldBase: 3000, pricePerKg: 400, costBase: 550000 },
};

export default function CalculatorPage() {
    const [area, setArea] = useState(1);
    const [crop, setCrop] = useState('Cacao');
    const [maintenance, setMaintenance] = useState('medium');
    const [expenses, setExpenses] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            calculate();
            setError(null);
        } catch (e) {
            setError('Erreur de calcul. Veuillez vérifier les valeurs saisies.');
        }
    }, [area, crop, expenses, maintenance]);

    const calculate = () => {
        const data = CROP_DATA[crop];
        if (!data) {
            throw new Error('Culture non reconnue');
        }

        // Multipliers based on maintenance level
        const modifiers = {
            low: { yield: 0.7, cost: 0.8 },
            medium: { yield: 1.0, cost: 1.0 },
            high: { yield: 1.3, cost: 1.5 }
        };

        const mod = modifiers[maintenance];
        const yieldPerHa = data.yieldBase * mod.yield;
        const estimatedYield = yieldPerHa * area;
        const revenue = estimatedYield * data.pricePerKg;
        const costPerHa = data.costBase * mod.cost;
        const totalExpenses = (costPerHa * area) + parseFloat(expenses || 0);
        const margin = revenue - totalExpenses;
        const roi = totalExpenses > 0 ? ((margin / totalExpenses) * 100).toFixed(1) : 0;
        const breakEven = totalExpenses / data.pricePerKg;

        setResults({
            yield: estimatedYield,
            revenue: revenue,
            expenses: totalExpenses,
            margin: margin,
            roi: ((margin / totalExpenses) * 100).toFixed(1),
            breakEven: Math.round(breakEven)
        });
    };

    const formatFCFA = (val) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                    <Calculator className="text-primary" />
                    Calculateur de Rentabilité
                </h1>
                <p className="text-text-secondary italic">Estimez vos revenus et optimisez vos investissements agricoles.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-foreground">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            Paramètres de Simulation
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Type de Culture</label>
                                <select
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                >
                                    {Object.keys(CROP_DATA).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Superficie (Hectares)</label>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={area}
                                    onChange={(e) => setArea(parseFloat(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-3">Niveau d'Entretien (Intrants & Soins)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['low', 'medium', 'high'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setMaintenance(level)}
                                            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${maintenance === level
                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                    : 'bg-surface-alt text-text-secondary border-border hover:border-primary/30'
                                                }`}
                                        >
                                            {level === 'low' ? 'Faible' : level === 'medium' ? 'Standard' : 'Intensif'}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-text-tertiary mt-2">
                                    {maintenance === 'low' && "⚠️ Rendement réduit, coûts de main-d'œuvre bas."}
                                    {maintenance === 'medium' && "✓ Scénario équilibré basé sur les moyennes régionales."}
                                    {maintenance === 'high' && "✨ Rendement optimisé, investissement en intrants élevé."}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Autres Dépenses (FCFA)</label>
                                <input
                                    type="number"
                                    placeholder="Ex: Transport, logistique..."
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={expenses}
                                    onChange={(e) => setExpenses(e.target.value)}
                                />
                                <p className="text-[10px] text-text-tertiary mt-1">* Main d'œuvre et intrants de base inclus dans le coût par hectare.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                        <h4 className="font-bold text-amber-500 mb-2 flex items-center gap-2">
                            <Info size={16} /> Attention
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Ce simulateur fournit des **estimations**. Pour un projet d'investissement réel, prévoyez une marge de sécurité de **+30% sur les coûts** et évitez les scénarios trop optimistes.
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
                            {error}
                        </div>
                    )}
                    
                    {results && !error && (
                        <>
                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-surface border border-border p-6 rounded-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                            <TrendingUp size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">ROI: {results.roi}%</span>
                                    </div>
                                    <div className="text-sm text-text-secondary mb-1">Marge Nette Estimée</div>
                                    <div className={`text-2xl font-bold ${results.margin >= 0 ? 'text-foreground' : 'text-error'}`}>
                                        {formatFCFA(results.margin)}
                                    </div>
                                </div>

                                <div className="bg-surface border border-border p-6 rounded-2xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                            <DollarSign size={20} />
                                        </div>
                                    </div>
                                    <div className="text-sm text-text-secondary mb-1">Chiffre d'Affaires Brut</div>
                                    <div className="text-2xl font-bold text-foreground">{formatFCFA(results.revenue)}</div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-border font-bold flex items-center gap-2">
                                    <PieChart size={18} className="text-primary" />
                                    Détails de la projection
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-text-secondary">Récolte estimée</span>
                                        <span className="font-bold">{results.yield.toLocaleString()} KG</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-text-secondary">Total Investissement</span>
                                        <span className="font-bold text-error">{formatFCFA(results.expenses)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-text-secondary">Seuil de rentabilité</span>
                                        <span className="font-bold">{results.breakEven.toLocaleString()} KG vendus</span>
                                    </div>
                                    <div className="bg-surface-alt/50 p-4 rounded-xl mt-4">
                                        <div className="flex items-center gap-2 text-primary font-bold mb-1">
                                            <Info size={16} />
                                            Conseil
                                        </div>
                                        <p className="text-sm text-text-secondary">
                                            {results.margin >= 0 
                                                ? 'Cette culture semble rentable avec vos paramètres actuels. Assurez-vous de maintenir les coûts sous contrôle.'
                                                : 'Attention : cette configuration présente un risque financier. Considérez à réduire les coûts ou augmenter la superficie.'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <ExportPDF 
                                            data={{
                                                'Culture': crop,
                                                'Superficie': `${area} hectares`,
                                                'Niveau d\'entretien': maintenance === 'low' ? 'Faible' : maintenance === 'medium' ? 'Standard' : 'Intensif',
                                                'Récolte estimée': `${results.yield.toLocaleString()} KG`,
                                                'Chiffre d\'affaires': formatFCFA(results.revenue),
                                                'Investissement total': formatFCFA(results.expenses),
                                                'Marge nette': formatFCFA(results.margin),
                                                'ROI': `${results.roi}%`,
                                                'Seuil de rentabilité': `${results.breakEven.toLocaleString()} KG`
                                            }}
                                            filename={`rentabilite-${crop}-${area}ha`}
                                        />
                                        <button
                                            onClick={() => {
                                                const data = {
                                                    crop: crop,
                                                    area: Number(area),
                                                    marketPrice: CROP_DATA[crop].pricePerKg,
                                                    results
                                                };
                                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `rentabilite-${crop}-${area}ha.json`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            <Download size={18} />
                                            Exporter JSON
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="btn-primary flex items-center gap-2 px-8 py-4">
                                    Enregistrer cette simulation
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
