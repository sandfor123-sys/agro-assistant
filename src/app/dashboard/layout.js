'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Home,
  Calculator,
  Package,
  AlertCircle,
  Sprout,
  BookOpen,
  Settings,
  BarChart3,
  LayoutDashboard,
  Leaf,
  Bot,
  MessageSquare,
  LogOut,
  Menu
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-display font-bold text-foreground">AgriAssist</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Tableau de Bord" active={pathname === '/dashboard'} />
          <NavItem href="/dashboard/parcels" icon={Sprout} label="Mes Parcelles" active={pathname.startsWith('/dashboard/parcels')} />
          <NavItem href="/dashboard/inventory" icon={Calculator} label="Stock & Intrants" active={pathname.startsWith('/dashboard/inventory')} />
          <NavItem href="/dashboard/tracking" icon={Leaf} label="Suivi de Culture" active={pathname.startsWith('/dashboard/tracking')} />
          <NavItem href="/dashboard/calculator" icon={Calculator} label="Calculateur d'intrant" active={pathname.startsWith('/dashboard/calculator')} />
          <NavItem href="/dashboard/calculator/rentabilite" icon={Calculator} label="Calculateur de Rentabilité" active={pathname.startsWith('/dashboard/calculator/rentabilite')} />
          <NavItem href="/dashboard/alerts" icon={AlertTriangle} label="Signaler un incident" active={pathname.startsWith('/dashboard/alerts')} />

          <div className="pt-4 pb-2">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-2">Système</div>
            <NavItem href="/dashboard/system/health" icon={Settings} label="Santé du Système" active={pathname.startsWith('/dashboard/system')} />
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3 mb-2 mt-4">Ressources</div>
            <NavItem href="/dashboard/guide" icon={BookOpen} label="Guides & Formation" active={pathname.startsWith('/dashboard/guide')} />
            <NavItem href="/dashboard/assistant" icon={Bot} label="Assistant IA" active={pathname.startsWith('/dashboard/assistant')} />
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs font-medium text-text-tertiary">Apparence</span>
            <ThemeToggle />
          </div>
          <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-alt transition-colors group">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              JK
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Jean Kouassi</div>
              <div className="text-xs text-text-secondary">Basic Plan</div>
            </div>
            <Settings size={18} className="text-text-tertiary group-hover:text-foreground" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header (Visible only on mobile) */}
        <div className="md:hidden h-16 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Sprout size={20} />
            </div>
            <span className="text-lg font-display font-bold text-foreground">AgriAssist</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 text-text-primary">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-foreground hover:bg-surface-alt'
      }`}
    >
      <Icon size={20} className={active ? "text-primary" : "text-text-tertiary group-hover:text-foreground"} />
      {label}
    </Link>
  );
}
