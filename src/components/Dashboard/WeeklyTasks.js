 'use client';

 import { useEffect, useMemo, useState } from 'react';
 import { CheckCircle2, Circle, AlertCircle, X, Calendar, List, CheckSquare, Sparkles } from 'lucide-react';

export default function WeeklyTasks({ tasks }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="bg-surface rounded-2xl p-8 text-center border border-border">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Aucune tâche pour le moment</h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                    Vos tâches agricoles apparaîtront ici une fois que vous aurez créé vos parcelles.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl text-left">
                        <Sparkles className="text-primary" size={20} />
                        <div className="flex-1">
                            <div className="font-medium text-foreground text-sm">Conseil du jour</div>
                            <div className="text-xs text-text-secondary">Commencez par créer une parcelle pour générer vos premières tâches</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const [completed, setCompleted] = useState({});
    const [open, setOpen] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const [lastCompletedTask, setLastCompletedTask] = useState(null);
    const [viewMode, setViewMode] = useState('weekly'); // 'daily' | 'weekly'
    const [showPersonnel, setShowPersonnel] = useState(true);

    const [consumeStock, setConsumeStock] = useState(false);
    const [intrantsLoading, setIntrantsLoading] = useState(false);
    const [intrantsError, setIntrantsError] = useState('');
    const [intrants, setIntrants] = useState([]);
    const [selectedStockId, setSelectedStockId] = useState('');
    const [qty, setQty] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('weekly_tasks_completed_v1');
            if (raw) setCompleted(JSON.parse(raw));
            const lastRaw = localStorage.getItem('weekly_tasks_last_completed_v1');
            if (lastRaw) setLastCompletedTask(JSON.parse(lastRaw));
        } catch (e) {
        }
    }, []);

    useEffect(() => {
        const resetAtMidnight = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const msUntilMidnight = tomorrow - now;
            setTimeout(() => {
                setCompleted({});
                setLastCompletedTask(null);
                try {
                    localStorage.removeItem('weekly_tasks_completed_v1');
                    localStorage.removeItem('weekly_tasks_last_completed_v1');
                } catch (e) {}
                resetAtMidnight();
            }, msUntilMidnight);
        };
        resetAtMidnight();
    }, []);

    const persistCompleted = (next, task) => {
        setCompleted(next);
        if (task) setLastCompletedTask(task);
        try {
            localStorage.setItem('weekly_tasks_completed_v1', JSON.stringify(next));
            if (task) localStorage.setItem('weekly_tasks_last_completed_v1', JSON.stringify(task));
        } catch (e) {
        }
    };

    const undoLast = () => {
        if (!lastCompletedTask) return;
        const next = { ...completed };
        delete next[lastCompletedTask.id];
        persistCompleted(next, null);
        setLastCompletedTask(null);
        try {
            localStorage.removeItem('weekly_tasks_last_completed_v1');
        } catch (e) {}
    };

    const close = () => {
        setOpen(false);
        setActiveTask(null);
        setConsumeStock(false);
        setIntrantsError('');
        setSaveError('');
        setSelectedStockId('');
        setQty('');
    };

    const openTask = async (task) => {
        setActiveTask(task);
        setOpen(true);
        setConsumeStock(false);
        setSaveError('');

        setIntrantsLoading(true);
        setIntrantsError('');
        try {
            const res = await fetch('/api/intrants?userId=1');
            const data = await res.json();
            if (!res.ok) {
                setIntrantsError((data && data.error) || 'Impossible de charger vos intrants.');
                setIntrants([]);
            } else {
                setIntrants(Array.isArray(data.intrants) ? data.intrants : []);
            }
        } catch (e) {
            setIntrantsError('Impossible de charger vos intrants.');
            setIntrants([]);
        } finally {
            setIntrantsLoading(false);
        }
    };

    const sortedIntrants = useMemo(() => {
        return [...intrants].sort((a, b) => (a.nom_intrant || '').localeCompare(b.nom_intrant || ''));
    }, [intrants]);

    // Group tasks by day for daily view
    const tasksByDay = useMemo(() => {
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const today = new Date().getDay();
        const todayIndex = today === 0 ? 6 : today - 1;
        const result = {};
        days.forEach((day, idx) => {
            result[day] = [];
        });
        tasks.filter(t => showPersonnel || !t.personnel).forEach((task, idx) => {
            const dayIndex = (todayIndex + idx) % 7;
            result[days[dayIndex]].push(task);
        });
        return result;
    }, [tasks, showPersonnel]);

    const markDone = async () => {
        if (!activeTask) return;

        if (consumeStock) {
            const stockIdNum = Number(selectedStockId);
            const qNum = Number(qty);

            if (!Number.isFinite(stockIdNum) || stockIdNum <= 0) {
                setSaveError('Veuillez choisir un intrant.');
                return;
            }
            if (!Number.isFinite(qNum) || qNum <= 0) {
                setSaveError('Quantité invalide.');
                return;
            }

            setSaving(true);
            setSaveError('');
            try {
                const res = await fetch('/api/stock/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_stock: stockIdNum, quantite: qNum, operation: 'decrement', userId: 1 }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    setSaveError(err.error || 'Erreur lors de la mise à jour du stock.');
                    return;
                }
            } catch (e) {
                setSaveError('Erreur réseau.');
                return;
            } finally {
                setSaving(false);
            }
        }

        setCompleted(prev => ({ ...prev, [activeTask.id]: true }));
        setLastCompletedTask(activeTask);
        localStorage.setItem(`task_${activeTask.id}`, 'true');
        close();
    };

    return (
        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm h-full">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Tâches de la Semaine</h2>
                    <p className="text-sm text-text-secondary">Priorités identifiées par l'IA</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {lastCompletedTask && (
                        <button
                            type="button"
                            onClick={undoLast}
                            className="px-3 py-1.5 rounded-lg bg-surface-alt border border-border hover:bg-surface text-xs font-semibold transition-all whitespace-nowrap"
                        >
                            Annuler la dernière
                        </button>
                    )}
                    <label className="flex items-center gap-2 text-xs font-semibold text-foreground whitespace-nowrap">
                        <input
                            type="checkbox"
                            checked={showPersonnel}
                            onChange={(e) => setShowPersonnel(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        Personnel
                    </label>
                    <div className="bg-surface border border-border rounded-xl p-1 inline-flex">
                        <button
                            type="button"
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                viewMode === 'daily'
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-text-secondary hover:bg-surface-alt'
                            }`}
                        >
                            <Calendar size={14} className="inline mr-1" />
                            Journalier
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('weekly')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                viewMode === 'weekly'
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-text-secondary hover:bg-surface-alt'
                            }`}
                        >
                            <List size={14} className="inline mr-1" />
                            Hebdomadaire
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'weekly' ? (
                <div className="space-y-3">
                    {tasks.filter(t => showPersonnel || !t.personnel).map((task, index) => {
                        const isDone = !!completed[task.id];

                        return (
                            <div
                                key={index}
                                onClick={() => openTask(task)}
                                className={`flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 hover:bg-surface-alt transition-colors group cursor-pointer ${
                                    isDone ? 'opacity-70 border-border' : 'border-border'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openTask(task);
                                    }}
                                    className="mt-1 text-text-tertiary hover:text-primary transition-colors"
                                >
                                    {isDone ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} />}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                            {task.task}
                                        </h4>
                                        {task.priority === 'urgent' && <AlertCircle size={16} className="text-error" />}
                                    </div>
                                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                                        <span>{task.icon}</span>
                                        <span>{task.parcelle}</span>
                                        {task.priority === 'high' && (
                                            <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Important</span>
                                        )}
                                        {task.priority === 'urgent' && (
                                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Urgent</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(tasksByDay).map(([day, dayTasks]) => (
                        <div key={day}>
                            <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-widest mb-2">{day}</h3>
                            {dayTasks.filter(t => showPersonnel || !t.personnel).length === 0 ? (
                                <div className="text-xs text-text-tertiary italic">Aucune tâche</div>
                            ) : (
                                <div className="space-y-2">
                                    {dayTasks.filter(t => showPersonnel || !t.personnel).map((task, idx) => {
                                        const isDone = !!completed[task.id];
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => openTask(task)}
                                                className={`flex items-start gap-3 p-3 rounded-lg border hover:border-primary/30 hover:bg-surface-alt transition-colors group cursor-pointer ${
                                                    isDone ? 'opacity-70 border-border' : 'border-border'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openTask(task);
                                                    }}
                                                    className="mt-0.5 text-text-tertiary hover:text-primary transition-colors"
                                                >
                                                    {isDone ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} />}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors">
                                                            {task.task}
                                                        </h4>
                                                        {task.priority === 'urgent' && <AlertCircle size={14} className="text-error" />}
                                                    </div>
                                                    <div className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                                                        <span>{task.icon}</span>
                                                        <span>{task.parcelle}</span>
                                                        {task.priority === 'high' && (
                                                            <span className="bg-amber-100 text-amber-700 px-1 py-0.5 rounded text-[9px] font-bold uppercase">Important</span>
                                                        )}
                                                        {task.priority === 'urgent' && (
                                                            <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-[9px] font-bold uppercase">Urgent</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={close} />
                    <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">Terminer la tâche</h2>
                            <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-surface-alt">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-surface-alt/50 border border-border/60 rounded-xl px-4 py-3">
                                <div className="font-semibold text-foreground">{activeTask?.task}</div>
                                <div className="text-xs text-text-tertiary">{activeTask?.parcelle}</div>
                            </div>

                            <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
                                <input
                                    type="checkbox"
                                    checked={consumeStock}
                                    onChange={(e) => setConsumeStock(e.target.checked)}
                                />
                                Déduire un intrant du stock
                            </label>

                            {consumeStock && (
                                <div className="space-y-3">
                                    {intrantsError && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                                            {intrantsError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Intrant</label>
                                            <select
                                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                value={selectedStockId}
                                                onChange={(e) => setSelectedStockId(e.target.value)}
                                                disabled={intrantsLoading}
                                            >
                                                <option value="">Sélectionner...</option>
                                                {sortedIntrants.map((i) => (
                                                    <option key={i.id_stock} value={String(i.id_stock)}>
                                                        {i.nom_intrant} ({i.quantite_actuelle ?? 0} {i.unite_mesure || ''})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text-secondary mb-2">Quantité à déduire</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                value={qty}
                                                onChange={(e) => setQty(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {saveError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3 text-sm">
                                    {saveError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-alt transition-all font-semibold"
                                    disabled={saving}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={markDone}
                                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-semibold disabled:opacity-60"
                                    disabled={saving}
                                >
                                    {saving ? 'Enregistrement...' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
