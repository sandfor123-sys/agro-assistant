import { getDashboardData } from '@/lib/data';
import StatCard from '@/components/Dashboard/StatCard';
import WeatherCard from '@/components/Dashboard/WeatherCard';
import RecentParcels from '@/components/Dashboard/RecentParcels';
import WeeklyTasks from '@/components/Dashboard/WeeklyTasks';
import { Sprout, Bell, Activity, DollarSign, ExternalLink, Bot, List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Dashboard() {
  // Fetch data directly on the server
  const data = await getDashboardData(1);
  const { user, greeting, stats, weather, action, financialTip, weeklyTasks, recentParcelles } = data;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex justify-between items-center relative">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {greeting}, {user.prenom} !
            </h1>
            <p className="text-text-secondary mt-1">
              Bienvenue sur votre tableau de bord agricole intelligent
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Bouton Lien vers les tâches */}
            <a
              href="#weekly-tasks-section"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold flex items-center gap-2"
            >
              <List size={16} />
              Voir les tâches
            </a>
            {/* Simple Avatar Placeholder */}
            <div className="h-10 w-10 rounded-full bg-surface-alt border border-white/10 text-primary flex items-center justify-center font-bold text-lg">
              {user.prenom[0]}{user.nom[0]}
            </div>
          </div>
        </header>

        {/* Hero / Weather Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative overflow-hidden rounded-2xl p-8 text-white flex flex-col justify-center bg-gradient-to-br from-violet-900 to-indigo-900 border border-white/10 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Aperçu de la journée</h2>
              <p className="opacity-90 max-w-lg mb-6 leading-relaxed">
                Toutes vos cultures semblent en bonne santé. N'oubliez pas de vérifier les alertes météo pour planifier votre journée.
              </p>

              {action && (
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Action Recommandée</div>
                    <div className="text-sm font-medium">{action.message}</div>
                  </div>
                  {action.link && (
                    <Link href={action.link} className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <WeatherCard weather={weather} />

            {financialTip && (
              <div className="mt-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 font-bold mb-2 text-white/90">
                  <DollarSign size={20} /> Conseil du jour
                </div>
                <p className="text-sm leading-relaxed">{financialTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Parcelles"
            value={stats.parcelles}
            label="Cultures Actives"
            icon={Sprout}
            color="primary"
            trend="up"
            trendValue="+2"
            href="/dashboard/parcels"
          />
          <StatCard
            title="Alertes"
            value={stats.alertes}
            label="À traiter"
            icon={Bell}
            color="warning"
            trend="down"
            trendValue="-3"
            href="/dashboard/alerts"
          />
          <StatCard
            title="Succès"
            value={stats.successRate}
            label="Taux de réussite"
            icon={Activity}
            color="success"
            trend="up"
            trendValue="+5%"
            href="/dashboard/tracking"
          />
          <StatCard
            title="Revenus"
            value={stats.revenus}
            label="Estimés (FCFA)"
            icon={DollarSign}
            color="info"
            trend="up"
            trendValue="+12%"
            href="/dashboard/calculator"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentParcels parcels={recentParcelles} />
          </div>
          <div className="lg:col-span-1" id="weekly-tasks-section">
            <WeeklyTasks tasks={weeklyTasks} />
          </div>
        </div>

        {/* Floating Assistant Button */}
        <Link
          href="/dashboard/assistant"
          className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-2 group"
        >
          <Bot size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
            AgriAssist IA
          </span>
        </Link>
      </div>
    </div>
  );
}
