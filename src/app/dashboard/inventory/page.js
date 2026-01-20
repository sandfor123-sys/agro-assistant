import pool from '@/lib/db';
import InventoryClient from '@/components/InventoryClient';

async function getStock(userId = 1) {
    try {
        const { rows } = await pool.query(`
        SELECT s.*, i.nom_intrant, i.unite_mesure 
        FROM stock s 
        JOIN intrant i ON s.id_intrant = i.id_intrant 
        WHERE s.id_utilisateur = $1
    `, [userId]);
        return rows;
    } catch (error) {
        console.error('Database connection error:', error);
        return [];
    }
}

export default async function InventoryPage() {
    try {
        const stocks = await getStock();
        return <InventoryClient stocks={stocks} />;
    } catch (error) {
        console.error('Error in InventoryPage:', error);
        return (
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl p-4">
                    <h2 className="font-bold mb-2">Inventaire</h2>
                    <p>Le service d'inventaire est temporairement indisponible. Veuillez réessayer plus tard.</p>
                </div>
            </div>
        );
    }
}
