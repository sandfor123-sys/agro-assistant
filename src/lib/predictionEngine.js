/**
 * PredictionEngine - Moteur de prédiction agronomique
 * Génère des tâches intelligentes basées sur :
 * 1. Le stade phénologique précis (pas juste un %)
 * 2. Les conditions météo (simulées ou réelles)
 * 3. Les bonnes pratiques agricoles (GAP)
 */

export class PredictionEngine {
    constructor() {
        this.cropDatabase = {
            'Maïs': {
                phases: [
                    { name: 'Germination', range: [0, 7], crucial: true, task: 'Vérifier la levée des plants', icon: '🌱', personnel: false },
                    { name: 'Croissance végétative', range: [8, 35], crucial: false, task: 'Désherbage et surveillance chenilles', icon: '🐛', personnel: true },
                    { name: 'Floraison', range: [36, 55], crucial: true, task: 'Besoins hydriques maximaux - Irriguer si sec', icon: '💧', personnel: true },
                    { name: 'Remplissage des grains', range: [56, 90], crucial: false, task: 'Surveillance maladies foliaires', icon: '🔍', personnel: false },
                    { name: 'Maturation', range: [91, 120], crucial: true, task: 'Préparer le séchage et la récolte', icon: '🚜', personnel: true }
                ]
            },
            'Tomate': {
                phases: [
                    { name: 'Reprise', range: [0, 10], crucial: true, task: 'Remplacer les plants manquants', icon: '🌱', personnel: true },
                    { name: 'Croissance', range: [11, 30], crucial: false, task: 'Tuteurage et taille des gourmands', icon: '✂️', personnel: true },
                    { name: 'Floraison', range: [31, 50], crucial: true, task: 'Surveiller le stress thermique', icon: '☀️', personnel: false },
                    { name: 'Fructification', range: [51, 80], crucial: true, task: 'Apport calcique préventif', icon: '💊', personnel: true },
                    { name: 'Récolte', range: [81, 100], crucial: true, task: 'Récolte échelonnée (matin)', icon: '🧺', personnel: true }
                ]
            },
            // Fallback générique
            'Standard': {
                phases: [
                    { name: 'Installation', range: [0, 15], crucial: true, task: 'Surveillance reprise', icon: '👀', personnel: false },
                    { name: 'Développement', range: [16, 60], crucial: false, task: 'Entretien courant', icon: '🔧', personnel: true },
                    { name: 'Maturation', range: [61, 100], crucial: true, task: 'Préparation récolte', icon: '🌾', personnel: true }
                ]
            }
        };
    }

    /**
     * Détermine la phase actuelle d'une culture
     */
    getCurrentPhase(cultureName, daysSincePlanting) {
        const cropData = this.cropDatabase[cultureName] || this.cropDatabase['Standard'];
        // Find phase that covers the day, or return the last one if overshot
        return cropData.phases.find(p => daysSincePlanting >= p.range[0] && daysSincePlanting <= p.range[1])
            || (daysSincePlanting > 100 ? { name: 'Fin de cycle', task: 'Rotation de culture conseillée', icon: '🔄', crucial: false } : cropData.phases[0]);
    }

    /**
     * Génère des tâches contextuelles
     * @param {Object} parcelle - Données de la parcelle (nom_culture, date_semis, etc.)
     * @param {Object} weather - Données météo actuelles
     */
    generateTasks(parcelle, weather) {
        const tasks = [];
        const plantingDate = new Date(parcelle.date_semis);
        const now = new Date();
        const differenceInTime = now.getTime() - plantingDate.getTime();
        const daysSincePlanting = Math.floor(differenceInTime / (1000 * 3600 * 24));

        // 1. Tâche basée sur le stade phénologique
        const phase = this.getCurrentPhase(parcelle.nom_culture, daysSincePlanting);

        if (phase) {
            tasks.push({
                id: `pheno-${parcelle.id_parcelle}-${daysSincePlanting}`,
                parcelle: parcelle.nom_parcelle,
                task: `${phase.name}: ${phase.task}`,
                priority: phase.crucial ? 'high' : 'medium',
                icon: phase.icon,
                type: 'agronomic',
                personnel: phase.personnel
            });
        }

        // 2. Logic Météo Intelligent (Contexte Réel)
        if (weather) {
            if (weather.desc && (weather.desc.toLowerCase().includes('pluie') || weather.desc.toLowerCase().includes('orage'))) {
                // Pas d'arrosage s'il pleut
                tasks.push({
                    id: `weather-rain-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Reportez l'arrosage (Pluie prévue)",
                    priority: 'low',
                    icon: '🌧️',
                    type: 'advice'
                });

                // Risque fongique accru après pluie
                if (daysSincePlanting > 20) {
                    tasks.push({
                        id: `weather-fungi-${parcelle.id_parcelle}`,
                        parcelle: parcelle.nom_parcelle,
                        task: "Inspectez les feuilles (Risque mildiou)",
                        priority: 'high',
                        icon: '🍄',
                        type: 'warning'
                    });
                }
            } else if (weather.temp && parseInt(weather.temp) > 30) {
                // Stress thermique
                tasks.push({
                    id: `weather-heat-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Irriguez ce soir (Forte chaleur)",
                    priority: 'urgent',
                    icon: '🔥',
                    type: 'urgent'
                });
            }
        }

        return tasks;
    }
}

export const predictionEngine = new PredictionEngine();
