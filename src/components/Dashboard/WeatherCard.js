export default function WeatherCard({ weather }) {
    if (!weather) return null;

    return (
        <div className="bg-primary hover:bg-primary-dark transition-colors rounded-2xl p-6 text-white shadow-xl shadow-primary/20 border-none relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>

            <div className="flex items-center gap-6 relative z-10">
                <div className="text-6xl drop-shadow-lg mb-1">{weather.icon}</div>
                <div>
                    <div className="text-4xl font-display font-black leading-none mb-1">{weather.temp}</div>
                    <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">{weather.desc}</div>
                    <div className="text-xs font-medium text-white/80 mt-1 italic">{weather.advice}</div>
                </div>
            </div>
        </div>
    );
}
