'use client';

import { useState } from 'react';
import { User, Settings, Shield, Bell, MapPin, Calendar, Mail, Phone, Edit2, Save, X } from 'lucide-react';

export default function ProfilePage() {
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState({
        name: 'John K.',
        email: 'john.k@agriassist.ci',
        phone: '+225 07 00 00 00 00',
        location: 'Yamoussoukro, Côte d\'Ivoire',
        joinDate: '12 Janvier 2026',
        role: 'Agriculteur Vérifié'
    });
    const [tempUser, setTempUser] = useState(user);

    const handleSave = () => {
        setUser(tempUser);
        setEditing(false);
    };

    const handleCancel = () => {
        setTempUser(user);
        setEditing(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground">Mon Profil</h1>
                <p className="text-text-secondary italic">Gérez vos informations personnelles et préférences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-surface border border-border rounded-3xl p-8 text-center shadow-sm">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-primary/20">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                        <p className="text-primary font-semibold text-sm mb-4">{user.role}</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
                            <Calendar size={14} />
                            <span>Membre depuis {user.joinDate}</span>
                        </div>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="mt-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
                            >
                                <Edit2 size={16} />
                                Modifier
                            </button>
                        )}
                    </div>

                    <div className="bg-surface border border-border rounded-3xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold text-foreground px-2">Contact</h3>
                        <div className="space-y-3">
                            {editing ? (
                                <>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt">
                                        <Mail size={18} className="text-primary" />
                                        <input
                                            type="email"
                                            value={tempUser.email}
                                            onChange={(e) => setTempUser({...tempUser, email: e.target.value})}
                                            className="flex-1 bg-transparent outline-none text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt">
                                        <Phone size={18} className="text-primary" />
                                        <input
                                            type="tel"
                                            value={tempUser.phone}
                                            onChange={(e) => setTempUser({...tempUser, phone: e.target.value})}
                                            className="flex-1 bg-transparent outline-none text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt">
                                        <MapPin size={18} className="text-primary" />
                                        <input
                                            type="text"
                                            value={tempUser.location}
                                            onChange={(e) => setTempUser({...tempUser, location: e.target.value})}
                                            className="flex-1 bg-transparent outline-none text-sm text-foreground"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex-1 px-3 py-2 rounded-xl bg-surface border border-border text-sm font-semibold hover:bg-surface transition-all flex items-center justify-center gap-1"
                                        >
                                            <X size={14} />
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-all flex items-center justify-center gap-1"
                                        >
                                            <Save size={14} />
                                            Enregistrer
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt text-sm text-text-secondary">
                                        <Mail size={18} className="text-primary" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt text-sm text-text-secondary">
                                        <Phone size={18} className="text-primary" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-alt text-sm text-text-secondary">
                                        <MapPin size={18} className="text-primary" />
                                        {user.location}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-surface-alt/50">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Settings size={18} className="text-primary" />
                                Paramètres du compte
                            </h3>
                        </div>
                        <div className="divide-y divide-border">
                            <SettingItem
                                icon={User}
                                title="Informations Personnelles"
                                desc="Nom, prénom, photo de profil"
                                active
                            />
                            <SettingItem
                                icon={Shield}
                                title="Sécurité"
                                desc="Mot de passe, double authentification"
                            />
                            <SettingItem
                                icon={Bell}
                                title="Notifications"
                                desc="Alertes SMS, email et push"
                            />
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-red-500">Zone de Danger</h4>
                            <p className="text-xs text-red-500/80">Supprimer définitivement votre compte et vos données.</p>
                        </div>
                        <button className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingItem({ icon: Icon, title, desc, active = false }) {
    return (
        <button className={`w-full flex items-center justify-between p-6 hover:bg-surface-alt transition-colors group ${active ? 'bg-primary/[0.02]' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${active ? 'bg-primary text-white' : 'bg-surface-alt text-text-tertiary group-hover:text-primary transition-colors'}`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <div className={`font-bold ${active ? 'text-primary' : 'text-foreground hover:text-primary transition-colors'}`}>{title}</div>
                    <div className="text-xs text-text-secondary">{desc}</div>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-text-tertiary group-hover:text-primary group-hover:bg-primary/10 transition-all">
                →
            </div>
        </button>
    );
}
