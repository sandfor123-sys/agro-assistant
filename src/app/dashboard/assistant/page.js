'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, CloudRain, ListChecks, Lightbulb, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function AssistantPage() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Bonjour ! Je suis AgriAssist, votre conseiller agricole intelligent. Comment puis-je vous aider aujourd'hui ?",
            time: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: text,
            time: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Call our local "intelligence" API
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await response.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: data.text,
                data: data.data,
                link: data.link,
                time: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'bot',
                text: "Désolé, je rencontre une petite difficulté technique. Veuillez réessayer.",
                time: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const QuickAction = ({ icon: Icon, label, query }) => (
        <button
            onClick={() => handleSend(query)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-text-secondary whitespace-nowrap"
        >
            <Icon size={16} className="text-primary" />
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-background text-foreground">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-border bg-surface flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-surface-alt rounded-lg md:hidden">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            AgriAssist AI
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </h1>
                        <p className="text-xs text-text-tertiary">Conseiller intelligent actif</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <Sparkles size={14} />
                    MODE EXPERT
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex gap-3 max-w-[85%] md:max-w-[70%]",
                            msg.type === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            msg.type === 'bot' ? "bg-primary text-white" : "bg-surface-alt border border-border"
                        )}>
                            {msg.type === 'bot' ? <Bot size={18} /> : <User size={18} />}
                        </div>
                        <div className="space-y-2">
                            <div className={clsx(
                                "p-4 rounded-2xl shadow-sm leading-relaxed",
                                msg.type === 'bot'
                                    ? "bg-surface border border-border text-foreground rounded-tl-none"
                                    : "bg-primary text-white rounded-tr-none"
                            )}>
                                {msg.text}

                                {/* Data Display Logic */}
                                {msg.data && Array.isArray(msg.data) && (
                                    <div className="mt-4 space-y-2">
                                        {msg.data.map((item, i) => (
                                            <div key={i} className="p-3 bg-surface-alt/50 border border-border/50 rounded-xl flex items-center gap-3">
                                                <span className="text-xl">{item.icon || '📍'}</span>
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-text-secondary">{item.parcelle || 'Action'}</div>
                                                    <div className="text-sm">{item.task || item.message}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {msg.link && (
                                    <Link
                                        href={msg.link}
                                        className="mt-4 inline-flex items-center gap-2 text-primary hover:underline font-bold text-sm"
                                    >
                                        Accéder à l'outil <TrendingUp size={14} />
                                    </Link>
                                )}
                            </div>
                            <div className={clsx(
                                "text-[10px] text-text-tertiary px-1",
                                msg.type === 'user' ? "text-right" : ""
                            )}>
                                {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-surface-alt border border-border flex items-center justify-center">
                            <Bot size={18} className="text-text-tertiary" />
                        </div>
                        <div className="bg-surface border border-border p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <div className="p-4 border-t border-border bg-surface/80 backdrop-blur-md sticky bottom-0">
                {/* Quick Actions Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide no-scrollbar">
                    <QuickAction icon={CloudRain} label="Météo actuelle" query="Quelle est la météo ?" />
                    <QuickAction icon={ListChecks} label="Tâches du jour" query="Quelles sont mes tâches ?" />
                    <QuickAction icon={Lightbulb} label="Conseil financier" query="Donne moi un conseil financier" />
                    <QuickAction icon={TrendingUp} label="Simulation profits" query="Simuler ma rentabilité" />
                </div>

                <div className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Posez votre question à AgriAssist..."
                        className="w-full bg-surface-alt border border-border rounded-2xl pl-4 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all shadow-inner"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-text-tertiary mt-3">
                    L'IA peut faire des erreurs. Vérifiez toujours les données critiques sur le terrain.
                </p>
            </div>
        </div>
    );
}
