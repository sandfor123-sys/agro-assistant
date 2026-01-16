'use client';

import { useState, useEffect } from 'react';
import { Calculator, Droplet, Sprout, Leaf, Info, Download } from 'lucide-react';
import ExportPDF from './ExportPDF';

// Base data for different crops (in kg/ha)
const CROP_REQUIREMENTS = {
    'Maïs': {
        seed: 25,          // kg/ha
        nitrogen: 150,     // kg/ha
        phosphorus: 70,    // kg/ha
        potassium: 100,    // kg/ha
        water: 500,        // mm/season
        yieldPerHa: 4000   // kg/ha
    },
    'Riz': {
        seed: 100,
        nitrogen: 120,
        phosphorus: 60,
        potassium: 60,
        water: 1000,
        yieldPerHa: 3000
    },
    'Manioc': {
        seed: 2000, // cuttings/ha
        nitrogen: 80,
        phosphorus: 40,
        potassium: 120,
        water: 700,
        yieldPerHa: 18000
    },
    'Cacao': {
        seed: 1000, // plants/ha
        nitrogen: 100,
        phosphorus: 40,
        potassium: 140,
        water: 1500,
        yieldPerHa: 600
    },
    'Hévéa': {
        seed: 500, // plants/ha
        nitrogen: 120,
        phosphorus: 50,
        potassium: 150,
        water: 1800,
        yieldPerHa: 1600
    }
};

export default function AgricultureCalculator() {
    const [area, setArea] = useState(1);
    const [crop, setCrop] = useState('Maïs');
    const [soilType, setSoilType] = useState('medium'); // low, medium, high fertility
    const [results, setResults] = useState(null);
    const [myIntrants, setMyIntrants] = useState([]);
    const [intrantsLoading, setIntrantsLoading] = useState(true);
    const [intrantsError, setIntrantsError] = useState('');

    useEffect(() => {
        calculateRequirements();
    }, [area, crop, soilType]);

    const loadMyIntrants = async () => {
        setIntrantsLoading(true);
        setIntrantsError('');
        try {
            const res = await fetch('/api/intrants?userId=1');
            const data = await res.json();
            if (!res.ok) {
                setIntrantsError((data && data.error) || 'Impossible de charger vos intrants.');
                setMyIntrants([]);
                return;
            }
            setMyIntrants(Array.isArray(data.intrants) ? data.intrants : []);
        } catch (e) {
            setIntrantsError('Impossible de charger vos intrants.');
            setMyIntrants([]);
        } finally {
            setIntrantsLoading(false);
        }
    };

    useEffect(() => {
        loadMyIntrants();
    }, []);

    const calculateRequirements = (crop, area) => {
        if (!crop || !area || area <= 0) {
            return null;
        }

        const requirements = CROP_REQUIREMENTS[crop];
        if (!requirements) return null;

        // Adjust for soil fertility
        const soilModifiers = {
            low: { n: 1.2, p: 1.3, k: 1.2 },  // Need more fertilizer in poor soil
            medium: { n: 1.0, p: 1.0, k: 1.0 },
            high: { n: 0.8, p: 0.8, k: 0.8 }   // Need less fertilizer in rich soil
        };

        const mod = soilModifiers[soilType];
        
        // Calculate requirements for the given area
        const calculated = {
            seed: (requirements.seed * area).toFixed(1),
            nitrogen: (requirements.nitrogen * area * mod.n).toFixed(1),
            phosphorus: (requirements.phosphorus * area * mod.p).toFixed(1),
            potassium: (requirements.potassium * area * mod.k).toFixed(1),
            water: (requirements.water * area).toFixed(0),
            expectedYield: (requirements.yieldPerHa * area).toFixed(0),
            unit: area > 1 ? 'ha' : 'hectare'
        };

        setResults(calculated);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                    <Calculator className="text-primary" />
                    Calculateur d'intrant
                </h1>
                <p className="text-text-secondary italic">Calculez les besoins en intrants pour vos cultures</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Info size={18} className="text-primary" />
                            Paramètres de calcul
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Type de Culture</label>
                                <select
                                    className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                    value={crop}
                                    onChange={(e) => setCrop(e.target.value)}
                                >
                                    {Object.keys(CROP_REQUIREMENTS).map(c => 
                                        <option key={c} value={c}>{c}</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Superficie (Hectares)
                                </label>
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
                                <label className="block text-sm font-medium text-text-secondary mb-3">
                                    Fertilité du Sol
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'low', label: 'Faible' },
                                        { value: 'medium', label: 'Moyenne' },
                                        { value: 'high', label: 'Élevée' }
                                    ].map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setSoilType(value)}
                                            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border ${
                                                soilType === value
                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                    : 'bg-surface-alt text-text-secondary border-border hover:border-primary/30'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {results && (
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Leaf size={18} className="text-primary" />
                                Résultats pour {crop}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-surface-alt/50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                                        <Sprout size={16} />
                                        Semences requises
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {results.seed} {crop === 'Manioc' ? 'boutures' : crop === 'Cacao' || crop === 'Hévéa' ? 'plants' : 'kg'}
                                    </div>
                                </div>

                                <div className="bg-surface-alt/50 p-4 rounded-xl">
                                    <div className="text-sm font-semibold text-text-secondary mb-2">
                                        Engrais recommandés (kg)
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Azote (N):</span>
                                            <span className="font-bold">{results.nitrogen} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phosphore (P₂O₅):</span>
                                            <span className="font-bold">{results.phosphorus} kg</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Potassium (K₂O):</span>
                                            <span className="font-bold">{results.potassium} kg</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface-alt/50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                                        <Droplet size={16} />
                                        Besoins en eau
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {results.water} mm/saison
                                    </div>
                                    <div className="text-sm text-text-secondary mt-1">
                                        Soit environ {(results.water * 10).toLocaleString()} m³/ha
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                        <Info size={16} />
                                        Rendement estimé
                                    </div>
                                    <div className="text-xl font-bold text-blue-700 mt-1">
                                        {results.expectedYield} kg
                                    </div>
                                    <p className="text-sm text-blue-600/80 mt-2">
                                        Basé sur une moyenne de {CROP_REQUIREMENTS[crop].yieldPerHa.toLocaleString()} kg/ha
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h3 className="text-lg font-bold text-foreground">Mes intrants</h3>
                            <button
                                type="button"
                                onClick={loadMyIntrants}
                                className="px-4 py-2 rounded-xl bg-surface-alt border border-border hover:bg-surface transition-all text-sm font-semibold"
                                disabled={intrantsLoading}
                            >
                                {intrantsLoading ? 'Chargement...' : 'Rafraîchir'}
                            </button>
                        </div>

                        {intrantsError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm mb-4">
                                {intrantsError}
                            </div>
                        )}

                        {!intrantsLoading && !intrantsError && myIntrants.length === 0 && (
                            <div className="text-sm text-text-secondary">
                                Aucun intrant enregistré. Ajoutez-en dans la section "Stock & Intrants".
                            </div>
                        )}

                        {!intrantsLoading && !intrantsError && myIntrants.length > 0 && (
                            <div className="space-y-3">
                                {myIntrants.map((i) => (
                                    <div key={i.id_stock} className="flex items-center justify-between bg-surface-alt/50 border border-border/60 rounded-xl px-4 py-3">
                                        <div>
                                            <div className="font-semibold text-foreground">{i.nom_intrant}</div>
                                            <div className="text-xs text-text-tertiary">{i.type || 'Intrant'}</div>
                                        </div>
                                        <div className="font-bold text-foreground">
                                            {i.quantite_actuelle ?? 0} <span className="text-sm font-medium text-text-tertiary">{i.unite_mesure || ''}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-700">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">À noter :</p>
                                <p className="mt-1">Ces calculs sont des estimations basées sur des moyennes. Les besoins réels peuvent varier selon les conditions locales, la variété cultivée et les pratiques agricoles.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <ExportPDF 
                            data={{
                                'Culture': crop,
                                'Superficie': `${area} hectares`,
                                'Semences requises': `${results?.seed || 0} ${crop === 'Manioc' ? 'boutures' : crop === 'Cacao' || crop === 'Hévéa' ? 'plants' : 'kg'}`,
                                'Azote (N)': `${results?.nitrogen || 0} kg`,
                                'Phosphore (P)': `${results?.phosphorus || 0} kg`,
                                'Potassium (K)': `${results?.potassium || 0} kg`,
                                'Besoins en eau': `${results?.water || 0} mm`,
                                'Rendement attendu': `${results?.expectedYield || 0} kg`
                            }}
                            filename={`calcul-intrants-${crop}-${area}ha`}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const data = {
                                    culture: crop,
                                    superficie: Number(area),
                                    result: results
                                };
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `calcul-intrants-${crop}-${area}ha.json`;
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
        </div>
    );
}
