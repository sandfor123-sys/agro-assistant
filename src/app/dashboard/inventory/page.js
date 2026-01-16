import pool from '@/lib/db';
import InventoryClient from '@/components/InventoryClient';

async function getStock(userId = 1) {
    const [rows] = await pool.query(`
        SELECT s.*, i.nom_intrant, i.unite_mesure 
        FROM stock s 
        JOIN intrant i ON s.id_intrant = i.id_intrant 
        WHERE s.id_utilisateur = ?
    `, [userId]);
    return rows;
}

export default async function InventoryPage() {
    const stocks = await getStock();

    return (
        <InventoryClient stocks={stocks} />
    );
}
