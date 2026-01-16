import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function RecentParcels({ parcels }) {
    if (!parcels || parcels.length === 0) {
        return (
            <div className="bg-surface rounded-2xl p-8 text-center border border-border">
                <p className="text-text-secondary">Aucune parcelle trouvée.</p>
                <Link href="/create-parcel" className="mt-4 inline-block text-primary font-semibold hover:underline">
                    Créer une parcelle
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Parcelles Récentes</h2>
                    <p className="text-sm text-text-secondary">Vos cultures en cours</p>
                </div>
                <Link href="/dashboard/parcels" className="btn-secondary text-sm flex items-center px-4 py-2 rounded-lg hover:bg-surface-alt transition-colors font-medium border border-border">
                    Voir tout <ArrowRight size={16} className="ml-2" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parcels.slice(0, 4).map((parcelle) => (
                    <Link
                        key={parcelle.id_parcelle}
                        href={`/dashboard/parcels/${parcelle.id_parcelle}`}
                        className="group block bg-surface-alt border border-transparent hover:border-primary hover:bg-surface-alt/80 rounded-xl p-4 transition-all hover-card"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span
                                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{
                                    backgroundColor: `${parcelle.couleur}15`,
                                    color: parcelle.couleur
                                }}
                            >
                                {parcelle.nom_culture}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {parcelle.nom_parcelle}
                        </h3>

                        <div className="flex gap-4 text-xs text-text-secondary">
                            <div className="flex items-center">
                                <Calendar size={14} className="mr-1.5" />
                                {new Date(parcelle.date_semis).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center">
                                <MapPin size={14} className="mr-1.5" />
                                {parcelle.localisation}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
