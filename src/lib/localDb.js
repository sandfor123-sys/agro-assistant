import fs from 'fs';
import path from 'path';

// Path to the local JSON database file
const DB_FILE = path.join(process.cwd(), 'local_db.json');

// Initial seed data
const INITIAL_DATA = {
    utilisateur: [
        { id_utilisateur: 1, nom: 'Kouassi', prenom: 'Jean', email: 'jean@agriassist.ci', role: 'agriculteur' }
    ],
    culture: [
        { id_culture: 1, nom_culture: 'Maïs', cycle_vie_jours: 120, couleur: '#fbbf24' },
        { id_culture: 2, nom_culture: 'Manioc', cycle_vie_jours: 270, couleur: '#84cc16' },
        { id_culture: 3, nom_culture: 'Cacao', cycle_vie_jours: 1825, couleur: '#a16207' },
        { id_culture: 4, nom_culture: 'Hévéa', cycle_vie_jours: 2190, couleur: '#065f46' },
        { id_culture: 5, nom_culture: 'Riz', cycle_vie_jours: 120, couleur: '#fde047' },
        { id_culture: 6, nom_culture: 'Tomate', cycle_vie_jours: 90, couleur: '#ef4444' }
    ],
    parcelle: [],
    alerte: [],
    intrant: [
        { id_intrant: 1, nom_intrant: 'NPK 15-15-15', unite_mesure: 'kg', type: 'engrais' },
        { id_intrant: 2, nom_intrant: 'Urée', unite_mesure: 'kg', type: 'engrais' },
        { id_intrant: 3, nom_intrant: 'Glyphosate', unite_mesure: 'L', type: 'herbicide' },
        { id_intrant: 4, nom_intrant: 'Semences Maïs', unite_mesure: 'kg', type: 'semence' }
    ],
    stock: [
        { id_stock: 1, id_utilisateur: 1, id_intrant: 1, quantite_actuelle: 50, date_derniere_maj: new Date().toISOString() },
        { id_stock: 2, id_utilisateur: 1, id_intrant: 2, quantite_actuelle: 25, date_derniere_maj: new Date().toISOString() },
        { id_stock: 3, id_utilisateur: 1, id_intrant: 4, quantite_actuelle: 10, date_derniere_maj: new Date().toISOString() }
    ]
};

class LocalDatabase {
    constructor() {
        this.data = { ...INITIAL_DATA };
        this.simulationMode = false;
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(DB_FILE)) {
                const fileContent = fs.readFileSync(DB_FILE, 'utf8');
                const loadedData = JSON.parse(fileContent);
                // Merge loaded data with structure to ensure all tables exist
                this.data = { ...INITIAL_DATA, ...loadedData };
                console.log('✅ Local DB loaded from', DB_FILE);
            } else {
                this.save();
                console.log('✅ Local DB created at', DB_FILE);
            }
        } catch (error) {
            console.error('Failed to load local DB:', error);
        }
    }

    save() {
        if (this.simulationMode) {
            console.warn('🧪 SIMULATION: Local DB save skipped (Read-only mode).');
            return;
        }
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
            console.log('💾 Local DB saved successfully.');
        } catch (error) {
            if (error.code === 'EROFS' || error.path?.includes('vercel')) {
                console.warn('⚠️ Read-only file system detected (likely Vercel). Data will only persist in memory for this session.');
            } else {
                console.error('❌ Failed to save local DB:', error);
            }
        }
    }

    // Identify the operation type and table
    async query(text, params = [], options = {}) {
        if (options.simulateVercel !== undefined) {
            this.simulationMode = options.simulateVercel;
        }
        console.log(`📝 LocalDB Op: ${text.substring(0, 50)}...`, params);
        const upperText = text.trim().toUpperCase();

        try {
            if (upperText.startsWith('SELECT')) return this.handleSelect(text, params);
            if (upperText.startsWith('INSERT')) return this.handleInsert(text, params);
            if (upperText.startsWith('UPDATE')) return this.handleUpdate(text, params);
            if (upperText.startsWith('DELETE')) return this.handleDelete(text, params);
            if (upperText.startsWith('SHOW COLUMNS')) return { rows: [{ column_name: 'id_parcelle' }] };

            return { rows: [], rowCount: 0 };
        } catch (error) {
            console.error('LocalDB Error:', error);
            throw error;
        }
    }

    handleSelect(text, params) {
        const lowerText = text.toLowerCase();

        // Count queries
        if (lowerText.includes('count(*)')) {
            let count = 0;
            if (lowerText.includes('from parcelle')) count = this.data.parcelle.length;
            if (lowerText.includes('from alerte')) count = this.data.alerte.length;
            return { rows: [{ count }] };
        }

        // 1. Get Parcels + Culture info
        if (lowerText.includes('from parcelle') && lowerText.includes('join culture')) {
            const userId = params[0];
            const rows = this.data.parcelle
                .filter(p => !userId || p.id_utilisateur == userId)
                .map(p => {
                    const c = this.data.culture.find(c => c.id_culture === p.id_culture) || {};
                    return { ...p, nom_culture: c.nom_culture, cycle_vie_jours: c.cycle_vie_jours, couleur: c.couleur };
                });
            rows.sort((a, b) => new Date(b.date_semis) - new Date(a.date_semis));
            return { rows };
        }

        // 2. Get Parcels (Simple)
        if (lowerText.includes('from parcelle')) {
            const userId = params[0];
            const rows = this.data.parcelle.filter(p => !userId || p.id_utilisateur == userId);
            return { rows };
        }

        // 3. Get Stock + Intrant
        if (lowerText.includes('from stock') && lowerText.includes('join intrant')) {
            const userId = params[0];
            const rows = this.data.stock
                .filter(s => !userId || s.id_utilisateur == userId)
                .map(s => {
                    const i = this.data.intrant.find(x => x.id_intrant === s.id_intrant) || {};
                    return { ...s, nom_intrant: i.nom_intrant, unite_mesure: i.unite_mesure };
                });
            return { rows };
        }

        // 4. Get Alerts
        if (lowerText.includes('from alerte')) {
            const userId = params[0];
            const rows = this.data.alerte
                .filter(a => !userId || a.id_utilisateur == userId)
                .map(a => {
                    let nom_parcelle = null;
                    if (a.id_parcelle) {
                        const p = this.data.parcelle.find(x => x.id_parcelle === a.id_parcelle);
                        if (p) nom_parcelle = p.nom_parcelle;
                    }
                    return { ...a, nom_parcelle };
                });
            rows.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
            return { rows };
        }

        // 5. User fetch
        if (lowerText.includes('from utilisateur')) {
            const userId = params[0];
            const rows = this.data.utilisateur.filter(u => u.id_utilisateur == userId);
            return { rows };
        }

        // 6. Get Intrants (for selection)
        if (lowerText.includes('from intrant')) return { rows: this.data.intrant };

        return { rows: [] };
    }

    handleInsert(text, params) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('into parcelle')) {
            const newId = this.data.parcelle.length + 1 + Date.now();
            const newParcelle = {
                id_parcelle: newId,
                nom_parcelle: params[0],
                superficie: params[1],
                id_culture: params[2],
                date_semis: params[3],
                statut: params[4],
                id_utilisateur: params[5]
            };
            this.data.parcelle.push(newParcelle);
            this.save();
            return { rows: [{ id_parcelle: newId }], rowCount: 1 };
        }

        if (lowerText.includes('into alerte')) {
            const newId = this.data.alerte.length + 1;
            const newAlerte = {
                id_alerte: newId,
                titre: params[0],
                message: params[1],
                type: params[2],
                priorite: params[3],
                lu: params[4] || 0,
                id_utilisateur: params[5],
                date_creation: params[params.length - 1]
            };
            if (params.length === 8) newAlerte.id_parcelle = params[6];

            this.data.alerte.push(newAlerte);
            this.save();
            return { rows: [{ id_alerte: newId }], rowCount: 1 };
        }

        if (lowerText.includes('into intrant')) {
            const newId = this.data.intrant.length + 1;
            const newIntrant = {
                id_intrant: newId,
                nom_intrant: params[0],
                type: params[1],
                unite_mesure: params[2]
            };
            this.data.intrant.push(newIntrant);
            this.save();
            return { rows: [{ id_intrant: newId }], rowCount: 1 };
        }

        if (lowerText.includes('into stock')) {
            const newId = this.data.stock.length + 1;
            const newStock = {
                id_stock: newId,
                id_intrant: params[0],
                quantite_actuelle: params[1] != null ? Number(params[1]) : 0,
                date_derniere_maj: params[2],
                id_utilisateur: params[3]
            };
            this.data.stock.push(newStock);
            this.save();
            return { rows: [{ id_stock: newId }], rowCount: 1 };
        }

        return { rows: [], rowCount: 0 };
    }

    handleUpdate(text, params) {
        const lowerText = text.toLowerCase();

        // Handle Parcel Update
        if (lowerText.includes('update parcelle')) {
            // Find WHERE clause params
            const match = text.match(/where\s+id_parcelle\s*=\s*\$(\d+)\s+and\s+id_utilisateur\s*=\s*\$(\d+)/i);
            let idParcelle, userId;

            if (match) {
                idParcelle = params[parseInt(match[1]) - 1];
                userId = params[parseInt(match[2]) - 1];
            } else {
                idParcelle = params[params.length - 2];
                userId = params[params.length - 1];
            }

            const parcelle = this.data.parcelle.find(p => p.id_parcelle == idParcelle && p.id_utilisateur == userId);

            if (parcelle) {
                // Update fields if present in query
                if (lowerText.includes('nom_parcelle = $')) {
                    const m = lowerText.match(/nom_parcelle\s*=\s*\$(\d+)/);
                    if (m) parcelle.nom_parcelle = params[parseInt(m[1]) - 1];
                }
                if (lowerText.includes('superficie = $')) {
                    const m = lowerText.match(/superficie\s*=\s*\$(\d+)/);
                    if (m) parcelle.superficie = params[parseInt(m[1]) - 1];
                }
                if (lowerText.includes('id_culture = $')) {
                    const m = lowerText.match(/id_culture\s*=\s*\$(\d+)/);
                    if (m) parcelle.id_culture = params[parseInt(m[1]) - 1];
                }
                if (lowerText.includes('date_semis = $')) {
                    const m = lowerText.match(/date_semis\s*=\s*\$(\d+)/);
                    if (m) parcelle.date_semis = params[parseInt(m[1]) - 1];
                }
                if (lowerText.includes('statut = $')) {
                    const m = lowerText.match(/statut\s*=\s*\$(\d+)/);
                    if (m) parcelle.statut = params[parseInt(m[1]) - 1];
                }

                this.save();
                return { rows: [], rowCount: 1 };
            }
            return { rows: [], rowCount: 0 };
        }

        if (lowerText.includes('update stock')) {
            const val = Number(params[0]);
            const date = params[1];

            // Extract where clause params
            const whereMatch = lowerText.match(/where\s+(id_stock|id_intrant)\s*=\s*\$(\d+)\s+and\s+id_utilisateur\s*=\s*\$(\d+)/);
            let idTarget, userId;
            const isStockId = lowerText.includes('id_stock');

            if (whereMatch) {
                idTarget = params[parseInt(whereMatch[2]) - 1];
                userId = params[parseInt(whereMatch[3]) - 1];
            } else {
                idTarget = params[2];
                userId = params[3];
            }

            const item = this.data.stock.find(s =>
                s.id_utilisateur == userId &&
                (isStockId ? s.id_stock == idTarget : s.id_intrant == idTarget)
            );

            if (item) {
                if (lowerText.includes('greatest')) {
                    const current = Number(item.quantite_actuelle) || 0;
                    item.quantite_actuelle = Math.max(0, current + val);
                } else {
                    item.quantite_actuelle = val != null ? Number(val) : 0;
                }
                item.date_derniere_maj = date;
                this.save();
                return { rows: [], rowCount: 1 };
            }
        }

        return { rows: [], rowCount: 0 };
    }

    handleDelete(text, params) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('from parcelle')) {
            const id = params[0];
            const initialLen = this.data.parcelle.length;
            this.data.parcelle = this.data.parcelle.filter(p => p.id_parcelle != id);
            this.save();
            return { rows: [], rowCount: initialLen - this.data.parcelle.length };
        }
        return { rows: [], rowCount: 0 };
    }
}

// Singleton instance
const localDb = new LocalDatabase();
export default localDb;
