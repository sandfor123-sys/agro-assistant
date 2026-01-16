import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

export default function StatCard({ title, value, label, trend, trendValue, icon: Icon, color = 'primary', href }) {
    const colors = {
        primary: 'bg-primary/10 text-primary',
        warning: 'bg-warning/10 text-warning',
        success: 'bg-success/10 text-success',
        info: 'bg-info/10 text-info',
    };

    const CardContent = (
        <div className="bg-surface rounded-2xl p-6 border border-white/5 shadow-sm hover:border-primary/50 transition-colors group h-full cursor-pointer">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx(
                    "p-3 rounded-xl flex items-center justify-center transition-colors group-hover:scale-105 duration-300",
                    colors[color]
                )}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                        trend === 'up' ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                    )}>
                        {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">{value}</div>
                <div className="text-sm text-text-secondary font-medium">{label}</div>
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
