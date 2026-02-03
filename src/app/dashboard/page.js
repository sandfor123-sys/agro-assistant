import { getDashboardData } from '@/lib/data';
import StatCard from '@/components/Dashboard/StatCard';
import WeatherCard from '@/components/Dashboard/WeatherCard';
import RecentParcels from '@/components/Dashboard/RecentParcels';
import WeeklyTasks from '@/components/Dashboard/WeeklyTasks';
import TaskScrollButton from '@/components/TaskScrollButton';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import { Sprout, Bell, Activity, DollarSign, ExternalLink, Bot } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Dashboard() {
  // Fetch data directly on the server
  const data = await getDashboardData(1);
  const { greeting, stats, weather, action, financialTip, weeklyTasks, recentParcelles } = data;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-20 animate-in">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <DashboardHeader greeting={greeting} />

        {/* Insights Section (Consolidated Recommendation & Weather) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] p-10 text-white flex flex-col justify-center bg-gradient-to-br from-violet-900 via-indigo-900 to-blue-900 border border-white/10 shadow-2xl reveal">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Activity size={24} className="text-primary-light" />
                </div>
                <h2 className="text-3xl font-display font-bold">Aperçu Intelligent</h2>
              </div>

              <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-10 leading-relaxed font-medium">
                "Toutes vos cultures semblent en bonne santé. N'oubliez pas de vérifier les alertes météo pour planifier votre journée."
              </p>

              {action && (
                <div className="inline-flex items-center bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:bg-white/15 transition-all group">
                  <div className="text-3xl mr-4 bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">{action.icon}</div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary-light mb-1">Action Recommandée</div>
                    <div className="text-base font-semibold">{action.message}</div>
                  </div>
                  {action.link && (
                    <Link href={action.link} className="ml-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                      <ExternalLink size={18} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6 reveal" style={{ animationDelay: '0.1s' }}>
            <WeatherCard weather={weather} />

            {financialTip && (
              <div className="bg-gradient-to-br from-emerald-500 to-green-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-3 font-bold mb-4 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <DollarSign size={20} />
                  </div>
                  <span className="tracking-tight text-lg">Conseil du jour</span>
                </div>
                <p className="text-base leading-relaxed font-medium opacity-90">{financialTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal" style={{ animationDelay: '0.2s' }}>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 reveal" style={{ animationDelay: '0.3s' }}>
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
          className="fixed bottom-8 right-8 p-5 bg-primary text-white rounded-[2rem] shadow-[0_20px_50px_rgba(217,119,6,0.3)] hover:scale-105 active:scale-95 transition-all z-50 flex items-center gap-3 group border border-white/20 backdrop-blur-sm"
        >
          <div className="relative">
            <Bot size={28} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-primary rounded-full"></span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap text-lg">
            AgriAssist IA
          </span>
        </Link>
      </div>
    </div>
  );
}
