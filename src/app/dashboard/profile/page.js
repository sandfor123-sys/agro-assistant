'use client';

import { useState, useEffect } from 'react';
import { User, Settings, Shield, Bell, MapPin, Calendar, Mail, Phone, Edit2, Save, X, FlaskConical, Database, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState({
        name: 'Chargement...',
        prenom: '',
        nom: '',
        email: '',
        phone: '+225 07 00 00 00 00',
        location: 'Yamoussoukro, Côte d\'Ivoire',
        joinDate: 'Janvier 2026',
        role: 'Agriculteur'
    });
    const [tempUser, setTempUser] = useState(user);
    const [testerSettings, setTesterSettings] = useState({
        forceMockData: false,
        debugMode: false,
        simulateVercel: false
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Check localStorage first for immediate UI
                const cachedUser = localStorage.getItem('userInfo');
                if (cachedUser) {
                    const parsed = JSON.parse(cachedUser);
                    const formatted = {
                        ...user,
                        ...parsed,
                        name: `${parsed.prenom} ${parsed.nom}`
                    };
                    setUser(formatted);
                    setTempUser(formatted);
                }

                const res = await fetch('/api/user?id=1');
                if (res.ok) {
                    const data = await res.json();
                    const formatted = {
                        ...user,
                        ...data,
                        name: `${data.prenom} ${data.nom}`
                    };
                    setUser(formatted);
                    setTempUser(formatted);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                }
            } catch (error) {
                console.error('Fetch user error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Load tester settings
        const cachedSettings = localStorage.getItem('testerSettings');
        if (cachedSettings) setTesterSettings(JSON.parse(cachedSettings));

        fetchUser();
    }, []);

    const handleSave = async () => {
        try {
            const names = tempUser.name.split(' ');
            const prenom = names[0] || '';
            const nom = names.slice(1).join(' ') || '';

            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_utilisateur: 1,
                    prenom,
                    nom,
                    email: tempUser.email,
                    role: tempUser.role
                })
            });

            if (res.ok) {
                const updatedUser = { ...tempUser, prenom, nom };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify({
                    id_utilisateur: 1,
                    prenom,
                    nom,
                    email: tempUser.email,
                    role: tempUser.role
                }));
                setEditing(false);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Erreur lors de la sauvegarde. Votre environnement est peut-être en lecture seule.');
        }
    };

    const handleCancel = () => {
        setTempUser(user);
        setEditing(false);
    };

    const toggleTesterSetting = (key) => {
        const newSettings = { ...testerSettings, [key]: !testerSettings[key] };
        setTesterSettings(newSettings);
        localStorage.setItem('testerSettings', JSON.stringify(newSettings));

        if (key === 'simulateVercel') {
            window.location.reload(); // Reload to apply mock state if needed
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 animate-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="text-primary font-bold text-xs uppercase tracking-widest mb-2">PARAMÈTRES</div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">Mon Profil</h1>
                    <p className="text-text-secondary mt-2 font-medium">Gérez votre identité numérique AgriAssist.</p>
                </div>
                {editing ? (
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="btn-secondary !py-2 !px-4 text-sm"><X size={16} /> Annuler</button>
                        <button onClick={handleSave} className="btn-primary !py-2 !px-4 text-sm"><Save size={16} /> Enregistrer</button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} className="btn-primary !py-2 !px-6"><Edit2 size={18} /> Modifier le profil</button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Overview Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-panel rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl shadow-primary/30 group-hover:rotate-3 transition-transform">
                            {user.prenom ? user.prenom.charAt(0).toUpperCase() : 'A'}
                        </div>

                        {editing ? (
                            <input
                                type="text"
                                value={tempUser.name}
                                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
                                className="text-2xl font-black text-foreground text-center bg-surface-alt rounded-xl p-2 w-full mb-2 outline-none border-2 border-primary/20 focus:border-primary"
                            />
                        ) : (
                            <h2 className="text-2xl font-black text-foreground mb-1">{user.name}</h2>
                        )}
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            {user.role}
                        </span>

                        <div className="flex flex-col gap-4 text-left border-t border-border/40 pt-8 mt-2">
                            <InfoItem icon={Mail} label="Email" value={tempUser.email} editing={editing} onChange={(v) => setTempUser({ ...tempUser, email: v })} />
                            <InfoItem icon={Phone} label="Téléphone" value={tempUser.phone} editing={editing} onChange={(v) => setTempUser({ ...tempUser, phone: v })} />
                            <InfoItem icon={MapPin} label="Localisation" value={tempUser.location} editing={editing} onChange={(v) => setTempUser({ ...tempUser, location: v })} />
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 space-y-2">
                        <div className="flex items-center gap-2 text-text-tertiary text-sm font-bold uppercase tracking-tighter">
                            <Calendar size={14} /> Membre depuis
                        </div>
                        <div className="text-foreground font-black text-xl">{user.joinDate}</div>
                    </div>
                </div>

                {/* Settings & Tester Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tester Controls (Premium Addition) */}
                    <div className="glass-panel rounded-[2.5rem] overflow-hidden border-primary/20">
                        <div className="p-8 border-b border-border/40 bg-primary/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                                    <FlaskConical size={24} className="text-primary" />
                                    Mode Testeur (Vercel)
                                </h3>
                                <p className="text-xs text-text-secondary font-medium mt-1">Outils pour valider le fonctionnement en environnement serverless.</p>
                            </div>
                            <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded-xl">
                                <RefreshCw size={18} className="animate-spin-slow" />
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TesterToggle
                                icon={Database}
                                title="Forcer Mock Data"
                                desc="Utilise des données fictives au lieu de l'API."
                                active={testerSettings.forceMockData}
                                onToggle={() => toggleTesterSetting('forceMockData')}
                            />
                            <TesterToggle
                                icon={Shield}
                                title="Simulation Vercel"
                                desc="Simule un système de fichiers en lecture seule."
                                active={testerSettings.simulateVercel}
                                onToggle={() => toggleTesterSetting('simulateVercel')}
                            />
                        </div>
                    </div>

                    <div className="glass-panel rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-border/40 bg-surface-alt/20">
                            <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                                <Settings size={22} className="text-primary" />
                                Sécurité & Notifications
                            </h3>
                        </div>
                        <div className="divide-y divide-border/40">
                            <SettingItem icon={Shield} title="Mot de passe" desc="Dernière modification il y a 3 mois" />
                            <SettingItem icon={Bell} title="Préférences d'alertes" desc="SMS activés pour les alertes météo" />
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-8 flex items-center justify-between group hover:bg-red-500/10 transition-colors">
                        <div>
                            <h4 className="font-bold text-red-600 text-lg">Zone de Danger</h4>
                            <p className="text-sm text-red-500/70 font-medium">Supprimer votre compte et toutes les données associées.</p>
                        </div>
                        <button className="px-6 py-3 bg-red-600 text-white text-sm font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95">
                            Supprimer le compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value, editing, onChange }) {
    return (
        <div className="group/item">
            <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-1 ml-1">{label}</div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-surface-alt group-hover/item:bg-primary/10 transition-colors">
                    <Icon size={16} className="text-primary" />
                </div>
                {editing ? (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="flex-1 bg-surface-alt rounded-lg px-3 py-1.5 text-sm font-bold outline-none border border-transparent focus:border-primary/30"
                    />
                ) : (
                    <span className="text-sm font-bold text-foreground">{value}</span>
                )}
            </div>
        </div>
    );
}

function SettingItem({ icon: Icon, title, desc }) {
    return (
        <button className="w-full flex items-center justify-between p-8 hover:bg-surface-alt/50 transition-all group">
            <div className="flex items-center gap-5">
                <div className="p-4 rounded-[1.25rem] bg-surface-alt text-text-tertiary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Icon size={22} />
                </div>
                <div className="text-left">
                    <div className="font-bold text-foreground text-lg group-hover:text-primary transition-colors tracking-tight">{title}</div>
                    <div className="text-sm text-text-secondary font-medium">{desc}</div>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-text-tertiary group-hover:text-primary group-hover:bg-primary/10 transition-all text-xl font-black">
                →
            </div>
        </button>
    );
}

function TesterToggle({ icon: Icon, title, desc, active, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${active ? 'bg-primary/10 border-primary/30' : 'bg-surface border-border/40 hover:border-border'}`}
        >
            <div className={`p-3 rounded-2xl ${active ? 'bg-primary text-white' : 'bg-surface-alt text-text-tertiary'}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="font-bold text-foreground text-sm tracking-tight">{title}</div>
                <p className="text-[10px] text-text-secondary font-medium leading-tight mt-0.5">{desc}</p>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`}></div>
            </div>
        </button>
    );
}
