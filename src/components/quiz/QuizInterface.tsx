'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: string;
    text: string;
    options: string[];
    correct: string;
}

interface QuizInterfaceProps {
    questions: Question[];
    examName: string;
}

export function QuizInterface({ questions, examName }: QuizInterfaceProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOptionSelect = (option: string) => {
        setAnswers(prev => ({
            ...prev,
            [questions[currentIndex].id]: option
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct) score++;
        });
        return score;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const score = calculateScore();

        // In a real app, save attempt to DB here via API

        // Navigate to results
        const query = new URLSearchParams({
            score: score.toString(),
            total: questions.length.toString(),
            exam: examName,
            answers: JSON.stringify(answers) // Pass answers for review (simple check)
        });

        // Store in localStorage for review page to pick up (avoiding huge URL)
        localStorage.setItem('lastResult', JSON.stringify({
            questions,
            answers,
            score,
            date: new Date().toISOString()
        }));

        router.push(`/results?score=${score}&total=${questions.length}&exam=${examName}`);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto space-y-8 bg-[var(--color-cyber-dark)] min-h-screen p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center text-gray-300 border-b border-[var(--color-cyber-highlight)] pb-4">
                <div>
                    <span className="text-[var(--color-cyber-blue)] text-sm font-medium">EXAM</span>
                    <div className="font-bold text-lg text-white">{examName}</div>
                </div>
                <div className="text-xl font-mono font-bold text-[var(--color-cyber-blue)] bg-[var(--color-cyber-highlight)] px-4 py-2 rounded-lg border border-[var(--color-cyber-blue)]/30 shadow-[var(--shadow-neon-blue)]">
                    {formatTime(timeLeft)}
                </div>
                <div className="text-right">
                    <span className="text-[var(--color-cyber-blue)] text-sm font-medium">QUESTION</span>
                    <div className="font-bold text-lg text-white">{currentIndex + 1} <span className="text-gray-500 text-base font-normal">/ {questions.length}</span></div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-[var(--color-cyber-highlight)] rounded-full overflow-hidden border border-[var(--color-cyber-highlight)]">
                <motion.div
                    className="h-full bg-[var(--color-cyber-blue)] shadow-[var(--shadow-neon-blue)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Question Card */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="min-h-[400px] flex flex-col justify-between p-8 bg-[var(--color-cyber-gray)] shadow-[var(--shadow-glass)] border border-[var(--color-cyber-highlight)] text-gray-200">
                        <div className="space-y-8">
                            <h2 className="text-xl font-medium text-white leading-relaxed">
                                {currentQuestion.text}
                            </h2>

                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.id] === option;
                                    const letter = String.fromCharCode(65 + idx);

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            className={cn(
                                                "group flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200",
                                                isSelected
                                                    ? "border-[var(--color-cyber-blue)] bg-[var(--color-cyber-blue)]/10 text-white shadow-[var(--shadow-neon-blue)]"
                                                    : "border-[var(--color-cyber-highlight)] hover:border-[var(--color-cyber-blue)]/50 hover:bg-[var(--color-cyber-highlight)]/50 text-gray-400"
                                            )}
                                        >
                                            <span className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full border mr-4 font-bold text-sm transition-colors",
                                                isSelected ? "bg-[var(--color-cyber-blue)] text-black border-[var(--color-cyber-blue)]" : "text-gray-500 border-gray-600 group-hover:border-[var(--color-cyber-blue)] group-hover:text-[var(--color-cyber-blue)]"
                                            )}>
                                                {letter}
                                            </span>
                                            <span className={cn("text-base", isSelected ? "text-[var(--color-cyber-blue)] font-medium" : "text-gray-300")}>
                                                {option}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between mt-8 pt-8 border-t border-[var(--color-cyber-highlight)]">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="text-gray-500 hover:text-white"
                            >
                                &larr; Previous
                            </Button>

                            {currentIndex === questions.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-[var(--color-cyber-green)] hover:bg-[var(--color-cyber-green)] hover:text-black hover:shadow-[var(--shadow-neon-green)] text-black border-none"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                                </Button>
                            ) : (
                                <Button variant="primary" onClick={handleNext}>
                                    Next Question &rarr;
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
