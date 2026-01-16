import pool from '@/lib/db';
import DeclareIncidentClient from '@/components/DeclareIncidentClient';
import { Suspense } from 'react';

async function getParcels(userId = 1) {
    try {
        const [rows] = await pool.query('SELECT id_parcelle, nom_parcelle FROM parcelle WHERE id_utilisateur = ?', [userId]);
        return rows;
    } catch (error) {
        console.error('Error fetching parcels:', error);
        return [];
    }
}

export default async function DeclareIncidentPage() {
    try {
        const parcels = await getParcels();
        return (
            <Suspense fallback={
                <div className="p-4 md:p-8 max-w-3xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-surface-alt rounded-lg mb-4"></div>
                        <div className="h-32 bg-surface-alt rounded-lg"></div>
                    </div>
                </div>
            }>
                <DeclareIncidentClient parcels={parcels} />
            </Suspense>
        );
    } catch (error) {
        console.error('Error in DeclareIncidentPage:', error);
        return (
            <div className="p-4 md:p-8 max-w-3xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4">
                    Erreur de chargement. Veuillez réessayer plus tard.
                </div>
            </div>
        );
    }
}
