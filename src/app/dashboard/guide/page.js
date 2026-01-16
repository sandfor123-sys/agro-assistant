'use client';

import { useState } from 'react';
import { BookOpen, PlayCircle, CheckCircle, Clock, Users, Target, Award, ChevronRight, Search, Youtube, Wrench, Leaf, DollarSign, Undo } from 'lucide-react';

export default function GuidePage() {
    const [expandedModule, setExpandedModule] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [completedTasks, setCompletedTasks] = useState({});

    const modules = [
        {
            id: 1,
            title: "Premiers Pas avec AgriAssist",
            duration: "15 min",
            level: "Débutant",
            completed: true,
            lessons: [
                { id: 'l1', title: "Créer votre compte", duration: "3 min", completed: true },
                { id: 'l2', title: "Interface principale", duration: "5 min", completed: true },
                { id: 'l3', title: "Première parcelle", duration: "7 min", completed: true }
            ]
        },
        {
            id: 2,
            title: "Gestion des Parcelles",
            duration: "25 min",
            level: "Débutant",
            completed: false,
            lessons: [
                { id: 'l4', title: "Ajouter une parcelle", duration: "5 min", completed: false },
                { id: 'l5', title: "Suivre la progression", duration: "8 min", completed: false },
                { id: 'l6', title: "Gérer plusieurs parcelles", duration: "12 min", completed: false }
            ]
        },
        {
            id: 3,
            title: "Stock et Intrants",
            duration: "20 min",
            level: "Intermédiaire",
            completed: false,
            lessons: [
                { id: 'l7', title: "Types d'intrants", duration: "6 min", completed: false },
                { id: 'l8', title: "Gérer le stock", duration: "7 min", completed: false },
                { id: 'l9', title: "Alertes de stock", duration: "7 min", completed: false }
            ]
        },
        {
            id: 4,
            title: "Calculateurs de Rentabilité",
            duration: "30 min",
            level: "Intermédiaire",
            completed: false,
            lessons: [
                { id: 'l10', title: "Calculateur d'intrants", duration: "12 min", completed: false },
                { id: 'l11', title: "Simulateur de rentabilité", duration: "18 min", completed: false }
            ]
        },
        {
            id: 5,
            title: "Alertes et Signalements",
            duration: "18 min",
            level: "Intermédiaire",
            completed: false,
            lessons: [
                { id: 'l12', title: "Signaler un incident", duration: "6 min", completed: false },
                { id: 'l13', title: "Suivre les alertes", duration: "7 min", completed: false },
                { id: 'l14', title: "Actions correctives", duration: "5 min", completed: false }
            ]
        },
        {
            id: 6,
            title: "Tâches et Planification",
            duration: "22 min",
            level: "Avancé",
            completed: false,
            lessons: [
                { id: 'l15', title: "Comprendre les tâches IA", duration: "8 min", completed: false },
                { id: 'l16', title: "Personnaliser les tâches", duration: "7 min", completed: false },
                { id: 'l17', title: "Intégrer le personnel", duration: "7 min", completed: false }
            ]
        }
    ];

    const tutorials = [
        {
            id: 't1',
            title: "Fabriquer son propre compost",
            category: "Intrants Naturels",
            duration: "12 min",
            difficulty: "Facile",
            materials: ["Déchets végétaux", "Fumier", "Paille"],
            videoId: "dQw4w9WgXcQ"
        },
        {
            id: 't2',
            title: "Extraits naturels pour ravageurs",
            category: "Lutte Biologique",
            duration: "8 min",
            difficulty: "Facile",
            materials: ["Ail", "Piment", "Savon noir"],
            videoId: "dQw4w9WgXcQ"
        },
        {
            id: 't3',
            title: "Outils de plantation économiques",
            category: "Fabrication Outils",
            duration: "15 min",
            difficulty: "Moyen",
            materials: ["Bois recyclé", "Fil de fer", "Poignées usagées"],
            videoId: "dQw4w9WgXcQ"
        },
        {
            id: 't4',
            title: "Système d'irrigation goutte-à-goutte",
            category: "Irrigation",
            duration: "20 min",
            difficulty: "Moyen",
            materials: ["Tuyaux PVC", "Goutteurs", "Réservoir"],
            videoId: "dQw4w9WgXcQ"
        },
        {
            id: 't5',
            title: "Préparation de purin d'ortie",
            category: "Engrais Naturels",
            duration: "10 min",
            difficulty: "Facile",
            materials: ["Orties", "Eau", "Récipient"],
            videoId: "dQw4w9WgXcQ"
        },
        {
            id: 't6',
            title: "Construction de serre économique",
            category: "Infrastructure",
            duration: "25 min",
            difficulty: "Difficile",
            materials: ["Bambou", "Film plastique", "Arceaux"],
            videoId: "dQw4w9WgXcQ"
        }
    ];

    const handleTaskComplete = (lessonId) => {
        setCompletedTasks(prev => ({
            ...prev,
            [lessonId]: !prev[lessonId]
        }));
    };

    const handleTaskUndo = (lessonId) => {
        setCompletedTasks(prev => ({
            ...prev,
            [lessonId]: false
        }));
    };

    const filteredModules = modules.filter(module => 
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.lessons.some(lesson => lesson.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredTutorials = tutorials.filter(tutorial =>
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const completedLessons = modules.reduce((acc, module) => 
        acc + module.lessons.filter(l => l.completed || completedTasks[l.id]).length, 0
    );
    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
                    <BookOpen className="text-primary" />
                    Guide & Formation
                </h1>
                <p className="text-text-secondary italic">Maîtrisez AgriAssist avec nos formations interactives.</p>
                
                {/* Search Bar */}
                <div className="mt-6 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher des formations, tutoriels, ou vidéos YouTube..."
                        className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                </div>
            </header>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Votre Progression</h2>
                        <p className="text-white/80">{completedLessons} leçons terminées sur {totalLessons}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{Math.round(progress)}%</div>
                        <div className="text-sm text-white/80">Complété</div>
                    </div>
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* YouTube Search Section */}
            <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Youtube className="text-red-500" size={24} />
                    Recherche YouTube
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Rechercher des tutoriels vidéo..."
                        className="flex-1 bg-surface-alt border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                    <button
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent('agriculture ' + searchQuery)}`, '_blank')}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                        <Youtube size={18} />
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Tutorials Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Wrench className="text-primary" />
                    Tutoriels Pratiques
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTutorials.map((tutorial) => (
                        <div key={tutorial.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                    {tutorial.category}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    tutorial.difficulty === 'Facile' ? 'bg-emerald-500/10 text-emerald-500' :
                                    tutorial.difficulty === 'Moyen' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-red-500/10 text-red-500'
                                }`}>
                                    {tutorial.difficulty}
                                </span>
                            </div>
                            <h3 className="font-bold text-foreground mb-2">{tutorial.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-text-tertiary mb-3">
                                <Clock size={14} />
                                <span>{tutorial.duration}</span>
                            </div>
                            <div className="mb-3">
                                <div className="text-xs text-text-tertiary mb-1">Matériaux requis:</div>
                                <div className="flex flex-wrap gap-1">
                                    {tutorial.materials.map((material, idx) => (
                                        <span key={idx} className="bg-surface-alt px-2 py-1 rounded text-xs">
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${tutorial.videoId}`, '_blank')}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                <Youtube size={16} />
                                Voir la vidéo
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Course Modules */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground mb-4">Modules de Formation</h2>
                {filteredModules.map((module) => (
                    <div key={module.id} className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div 
                            className="p-6 cursor-pointer hover:bg-surface-alt transition-colors"
                            onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${module.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                        {module.completed ? <CheckCircle size={24} /> : <PlayCircle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">{module.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-text-tertiary mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {module.duration}
                                            </span>
                                            <span className="px-2 py-0.5 bg-surface-alt rounded-full text-xs">
                                                {module.level}
                                            </span>
                                            <span>{module.lessons.filter(l => l.completed || completedTasks[l.id]).length}/{module.lessons.length} leçons</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight 
                                    size={20} 
                                    className={`text-text-tertiary transition-transform ${
                                        expandedModule === module.id ? 'rotate-90' : ''
                                    }`}
                                />
                            </div>
                        </div>

                        {expandedModule === module.id && (
                            <div className="border-t border-border p-6 bg-surface-alt/30">
                                <div className="space-y-3">
                                    {module.lessons.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                    lesson.completed || completedTasks[lesson.id]
                                                        ? 'bg-emerald-500 text-white' 
                                                        : 'bg-surface-alt border-2 border-border'
                                                }`}>
                                                    {lesson.completed || completedTasks[lesson.id] && <CheckCircle size={14} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                                                    <p className="text-sm text-text-tertiary">{lesson.duration}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleTaskComplete(lesson.id)}
                                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                        lesson.completed || completedTasks[lesson.id]
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-primary text-white hover:bg-primary-dark'
                                                    }`}
                                                >
                                                    {lesson.completed || completedTasks[lesson.id] ? 'Terminé' : 'Valider'}
                                                </button>
                                                {(lesson.completed || completedTasks[lesson.id]) && (
                                                    <button 
                                                        onClick={() => handleTaskUndo(lesson.id)}
                                                        className="px-3 py-2 rounded-xl bg-surface-alt border border-border text-sm font-semibold hover:bg-surface transition-all flex items-center gap-1"
                                                    >
                                                        <Undo size={12} />
                                                        Annuler
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
