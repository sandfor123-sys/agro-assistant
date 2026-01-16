'use client';

import { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle, ArrowRight, BookOpen, Users, Target, Award, ChevronRight, Undo, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        // Check if user is new (no completed steps in localStorage)
        const savedSteps = localStorage.getItem('onboardingCompleted');
        if (!savedSteps) {
            setShowGuide(true);
        } else {
            setCompletedSteps(JSON.parse(savedSteps));
        }
    }, []);

    const steps = [
        {
            id: 'welcome',
            title: 'Bienvenue dans AgriAssist',
            description: 'Votre plateforme agricole intelligente pour optimiser vos cultures et votre rentabilité.',
            icon: '🌱',
            duration: '2 min',
            action: 'Commencer',
            autoCheck: true
        },
        {
            id: 'dashboard',
            title: 'Tableau de bord',
            description: 'Découvrez votre vue d\'ensemble avec les statistiques, météo et tâches du jour.',
            icon: '📊',
            duration: '3 min',
            link: '/dashboard',
            autoCheck: true
        },
        {
            id: 'parcels',
            title: 'Gestion des parcelles',
            description: 'Créez et suivez vos parcelles pour optimiser votre production.',
            icon: '🗺️',
            duration: '5 min',
            link: '/dashboard/parcels/add',
            autoCheck: true
        },
        {
            id: 'stock',
            title: 'Stock et intrants',
            description: 'Gérez vos stocks d\'intrants pour ne jamais être en rupture.',
            icon: '📦',
            duration: '4 min',
            link: '/dashboard/inventory',
            autoCheck: true
        },
        {
            id: 'calculator',
            title: 'Calculateurs',
            description: 'Utilisez nos calculateurs pour optimiser vos investissements et prévoir vos revenus.',
            icon: '🧮',
            duration: '6 min',
            link: '/dashboard/calculator',
            autoCheck: true
        },
        {
            id: 'assistant',
            title: 'Assistant IA',
            description: 'Discutez avec notre assistant IA pour obtenir des conseils personnalisés.',
            icon: '🤖',
            duration: '3 min',
            link: '/dashboard/assistant',
            autoCheck: false
        }
    ];

    const handleStepComplete = (stepId) => {
        const newCompleted = [...completedSteps, stepId];
        setCompletedSteps(newCompleted);
        localStorage.setItem('onboardingCompleted', JSON.stringify(newCompleted));
        
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Guide completed - redirect to dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
    };

    const handleRevert = () => {
        setCompletedSteps([]);
        setCurrentStep(0);
        localStorage.removeItem('onboardingCompleted');
        setShowGuide(true);
    };

    const handleSkipGuide = () => {
        setShowGuide(false);
        router.push('/dashboard');
    };

    const currentStepData = steps[currentStep];

    if (!showGuide) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">AgriAssist</h1>
                        <p className="text-text-secondary">Votre plateforme agricole intelligente</p>
                    </div>
                    
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Bienvenue de retour !</h2>
                        <p className="text-text-secondary mb-6">Vous avez déjà commencé la formation. Continuez où vous vous étiez arrêté.</p>
                        
                        <div className="space-y-3">
                            <Link
                                href="/dashboard"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-semibold"
                            >
                                Continuer vers le tableau de bord
                                <ArrowRight size={18} />
                            </Link>
                            
                            <button
                                onClick={handleRevert}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-surface-alt border border-border rounded-xl hover:bg-surface transition-all text-text-secondary"
                            >
                                <Undo size={16} />
                                Recommencer la formation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Guide de démarrage</h1>
                            <p className="text-xs text-text-tertiary">Formation AgriAssist</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSkipGuide}
                        className="text-text-secondary hover:text-foreground transition-colors text-sm font-medium"
                    >
                        Passer la formation
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-surface/50 border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-surface-alt rounded-full h-2 overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-text-secondary">
                            Étape {currentStep + 1} sur {steps.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left - Step Content */}
                    <div className="space-y-6">
                        <div className="bg-surface rounded-2xl p-8 border border-border shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl">
                                    {currentStepData.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">{currentStepData.title}</h2>
                                    <p className="text-sm text-text-tertiary">{currentStepData.duration}</p>
                                </div>
                            </div>
                            
                            <p className="text-lg text-text-secondary leading-relaxed mb-8">
                                {currentStepData.description}
                            </p>

                            {currentStepData.link && (
                                <Link
                                    href={currentStepData.link}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-surface-alt border border-border rounded-xl hover:bg-surface transition-all text-foreground font-medium"
                                >
                                    <PlayCircle size={18} />
                                    Ouvrir dans un nouvel onglet
                                </Link>
                            )}

                            <div className="flex items-center gap-4 mt-8">
                                {currentStep > 0 && (
                                    <button
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="px-4 py-2 text-text-secondary hover:text-foreground transition-colors"
                                    >
                                        Précédent
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => handleStepComplete(currentStepData.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-semibold"
                                >
                                    {currentStepData.autoCheck && <CheckCircle size={18} />}
                                    {currentStepData.action || 'Continuer'}
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right - Visual Guide */}
                    <div className="space-y-6">
                        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Target size={18} className="text-primary" />
                                Objectifs de cette étape
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={12} />
                                    </div>
                                    <span className="text-text-secondary">Comprendre l'interface principale</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={12} />
                                    </div>
                                    <span className="text-text-secondary">Explorer les fonctionnalités clés</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle size={12} />
                                    </div>
                                    <span className="text-text-secondary">Se sentir à l'aise avec la plateforme</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Award size={18} className="text-primary" />
                                Progression
                            </h3>
                            <div className="space-y-3">
                                {steps.map((step, index) => (
                                    <div 
                                        key={step.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                                            index === currentStep ? 'bg-primary/5 border border-primary/20' : 
                                            completedSteps.includes(step.id) ? 'bg-success/5 border border-success/20' : 
                                            'bg-surface-alt border border-border'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            completedSteps.includes(step.id) ? 'bg-success text-white' : 
                                            index === currentStep ? 'bg-primary text-white' : 'bg-surface text-text-tertiary'
                                        }`}>
                                            {completedSteps.includes(step.id) ? <CheckCircle size={16} /> : 
                                             index === currentStep ? <span className="text-sm font-bold">{index + 1}</span> : 
                                             <span className="text-xs">{index + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground">{step.title}</div>
                                            <div className="text-xs text-text-tertiary">{step.duration}</div>
                                        </div>
                                        {index === currentStep && (
                                            <ChevronRight size={16} className="text-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
