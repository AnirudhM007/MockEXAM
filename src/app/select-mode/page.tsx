'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Full CEH Module List
const MODULES = [
    "Introduction to Ethical Hacking",
    "Footprinting and Reconnaissance",
    "Scanning Networks",
    "Enumeration",
    "Vulnerability Analysis",
    "System Hacking",
    "Malware Threats",
    "Sniffing",
    "Social Engineering",
    "Denial-of-Service",
    "Session Hijacking",
    "Evading IDS, Firewalls, and Honeypots",
    "Hacking Web Servers",
    "Hacking Web Applications",
    "SQL Injection",
    "Hacking Wireless Networks",
    "Hacking Mobile Platforms",
    "IoT Hacking",
    "Cloud Computing",
    "Cryptography"
];

function SelectModeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const exam = searchParams.get('exam') || 'CEH';
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [mode, setMode] = useState('short');
    const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        // Fetch question counts
        fetch('/api/modules/stats')
            .then(res => res.json())
            .then(data => setModuleCounts(data))
            .catch(err => console.error(err));
    }, []);

    // Map user-friendly module name to DB name
    const toggleModule = (index: number) => {
        const dbName = MODULES[index];
        setSelectedModules(prev =>
            prev.includes(dbName)
                ? prev.filter(m => m !== dbName)
                : [...prev, dbName]
        );
    };

    const startQuiz = () => {
        const params = new URLSearchParams();
        params.set('exam', exam);
        params.set('mode', mode);
        if (selectedModules.length > 0) {
            params.set('modules', selectedModules.join(','));
        }
        router.push(`/quiz?${params.toString()}`);
    };

    const modes = [
        { id: 'short', label: 'Quick Scan', desc: '15 Questions - Rapid assessment' },
        { id: 'medium', label: 'Standard Audit', desc: '25 Questions - Balanced test' },
        { id: 'grind', label: 'Deep Dive', desc: '50 Questions - Comprehensive' },
        { id: 'custom', label: 'Targeted', desc: 'Custom module selection' }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-cyber-dark)] bg-cyber-grid text-gray-200 pb-20">
            {/* Header */}
            <div className="bg-[var(--color-cyber-gray)] border-b border-[var(--color-cyber-highlight)] py-6 mb-8 shadow-lg">
                <div className="max-w-5xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white">Configure Test Series: <span className="text-[var(--color-cyber-blue)] text-glow">{exam}</span></h1>
                    <p className="text-gray-400 mt-2">Select your settings and start practicing.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Config (Left) */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Mode Selection */}
                        <section className="bg-[var(--color-cyber-gray)] rounded-xl border border-[var(--color-cyber-highlight)] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-[var(--color-cyber-blue)] text-black flex items-center justify-center mr-3 text-sm font-bold shadow-[var(--shadow-neon-blue)]">1</span>
                                Select Difficulty
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {modes.map((m) => (
                                    <div
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`
                        cursor-pointer rounded-lg p-4 border transition-all relative overflow-hidden
                        ${mode === m.id
                                                ? 'border-[var(--color-cyber-blue)] bg-[var(--color-cyber-blue)]/10 text-[var(--color-cyber-blue)] shadow-[var(--shadow-neon-blue)]'
                                                : 'border-[var(--color-cyber-highlight)] hover:border-[var(--color-cyber-blue)]/50 hover:bg-[var(--color-cyber-highlight)]/50'}
                      `}
                                    >
                                        <div className="font-bold">{m.label}</div>
                                        <div className="text-sm text-gray-400 mt-1">{m.desc}</div>
                                        {mode === m.id && (
                                            <div className="absolute top-2 right-2 text-[var(--color-cyber-blue)]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Module Selection */}
                        <section className="bg-[var(--color-cyber-gray)] rounded-xl border border-[var(--color-cyber-highlight)] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-full bg-[var(--color-cyber-blue)] text-black flex items-center justify-center mr-3 text-sm font-bold shadow-[var(--shadow-neon-blue)]">2</span>
                                Select Modules
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {MODULES.map((mod, index) => {
                                    const isSelected = selectedModules.includes(mod);
                                    const count = moduleCounts[mod] || 0;
                                    const isEmpty = count === 0;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => !isEmpty && toggleModule(index)}
                                            className={`
                          p-3 rounded border transition-all flex items-center justify-between text-sm
                          ${isEmpty ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/50' : 'cursor-pointer'}
                          ${!isEmpty && isSelected
                                                    ? 'border-[var(--color-cyber-green)] bg-[var(--color-cyber-green)]/20 text-white shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                                                    : !isEmpty ? 'border-[var(--color-cyber-highlight)] text-gray-400 hover:bg-[var(--color-cyber-highlight)]/50' : ''}
                        `}
                                        >
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate font-medium">{mod}</span>
                                                <span className={`text-xs ${isEmpty ? 'text-gray-600' : 'text-gray-500'}`}>{count} Questions</span>
                                            </div>
                                            {!isEmpty && (
                                                <div className={`w-5 h-5 border rounded flex items-center justify-center ${isSelected ? 'bg-[var(--color-cyber-green)] border-[var(--color-cyber-green)] shadow-[var(--shadow-neon-green)]' : 'border-gray-600 bg-transparent'}`}>
                                                    {isSelected && <svg className="w-3.5 h-3.5 text-black font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 italic">Select none to include questions from all modules.</p>
                        </section>

                    </div>

                    {/* Sidebar / Summary (Right) */}
                    <div className="md:col-span-1">
                        <div className="bg-[var(--color-cyber-gray)] rounded-xl border border-[var(--color-cyber-highlight)] p-6 shadow-sm sticky top-6">
                            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Exam</span>
                                    <span className="font-medium text-[var(--color-cyber-blue)]">{exam}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mode</span>
                                    <span className="font-medium capitalize text-white">{mode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Modules</span>
                                    <span className="font-medium text-white">{selectedModules.length > 0 ? selectedModules.length : 'All Topics'}</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-[var(--color-cyber-highlight)]">
                                <Button
                                    size="lg"
                                    className="w-full py-6 text-lg tracking-wider font-bold shadow-[var(--shadow-neon-green)] bg-[var(--color-cyber-green)] text-black border-none hover:bg-[#00cc44] hover:shadow-[0_0_25px_#00ff41] whitespace-nowrap flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02]"
                                    onClick={startQuiz}
                                >
                                    START TEST SERIES
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SelectModePage() {
    return (
        <Suspense fallback={<div className="text-center text-cyber-blue p-20">Loading Configuration...</div>}>
            <SelectModeContent />
        </Suspense>
    );
}
