'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionContext } from './QuestionContext';

interface Question {
    id: string;
    text: string;
    options: string[];
    correct: string;
    answerCount?: number;  // Number of correct answers (1 = single, 2+ = multi)
    correctAnswers?: string;  // JSON string of correct answers for multi-select
    contexts?: Array<{
        id: string;
        type: string;
        content: string;
        position: number;
        metadata?: string;
    }>;
}

interface QuizInterfaceProps {
    questions: Question[];
    examName: string;
}

export function QuizInterface({ questions, examName }: QuizInterfaceProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});  // Support both single and multi-select
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Scroll to top when question changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentIndex]);

    const handleOptionSelect = (option: string) => {
        if (showFeedback) return; // Don't allow changing answer after feedback is shown

        const currentQuestion = questions[currentIndex];
        const isMultiSelect = (currentQuestion.answerCount || 1) > 1;

        if (isMultiSelect) {
            // Multi-select: toggle option in array
            setAnswers(prev => {
                const currentAnswers = (prev[currentQuestion.id] as string[]) || [];
                const newAnswers = currentAnswers.includes(option)
                    ? currentAnswers.filter(a => a !== option)
                    : [...currentAnswers, option];
                return {
                    ...prev,
                    [currentQuestion.id]: newAnswers
                };
            });
        } else {
            // Single-select: replace answer and show feedback
            setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: option
            }));

            // Show immediate feedback for single-select
            const correct = currentQuestion.correct === option;
            setIsCorrect(correct);
            setShowFeedback(true);
        }
    };

    // Handle submit for multi-select questions
    const handleMultiSelectSubmit = () => {
        const currentQuestion = questions[currentIndex];
        const selectedAnswers = answers[currentQuestion.id] as string[] || [];
        const correctAnswers = currentQuestion.correctAnswers
            ? JSON.parse(currentQuestion.correctAnswers)
            : [currentQuestion.correct];

        // Check if all correct answers selected and no incorrect ones
        const allCorrectSelected = correctAnswers.every((ans: string) => selectedAnswers.includes(ans));
        const noIncorrectSelected = selectedAnswers.every(ans => correctAnswers.includes(ans));
        const correct = allCorrectSelected && noIncorrectSelected && selectedAnswers.length === correctAnswers.length;

        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowFeedback(false);
            setIsCorrect(null);
        } else {
            // Last question - go to results
            handleSubmit();
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
            const answer = answers[q.id];
            const isMultiSelect = (q.answerCount || 1) > 1;

            if (isMultiSelect) {
                // Multi-select scoring
                const selectedAnswers = (answer as string[]) || [];
                const correctAnswers = q.correctAnswers ? JSON.parse(q.correctAnswers) : [q.correct];

                const allCorrectSelected = correctAnswers.every((ans: string) => selectedAnswers.includes(ans));
                const noIncorrectSelected = selectedAnswers.every(ans => correctAnswers.includes(ans));
                if (allCorrectSelected && noIncorrectSelected && selectedAnswers.length === correctAnswers.length) {
                    score++;
                }
            } else {
                // Single-select scoring
                if (answer === q.correct) score++;
            }
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
                            {/* Display question context (code blocks, images, etc.) before question */}
                            {currentQuestion.contexts && currentQuestion.contexts.filter(c => c.position === 0).length > 0 && (
                                <QuestionContext contexts={currentQuestion.contexts.filter(c => c.position === 0)} />
                            )}

                            <h2 className="text-xl font-medium text-white leading-relaxed">
                                {currentQuestion.text}
                            </h2>

                            {/* Display question context after question text */}
                            {currentQuestion.contexts && currentQuestion.contexts.filter(c => c.position > 0).length > 0 && (
                                <QuestionContext contexts={currentQuestion.contexts.filter(c => c.position > 0)} />
                            )}

                            {/* Multi-select hint */}
                            {(currentQuestion.answerCount || 1) > 1 && !showFeedback && (
                                <div className="bg-[var(--color-cyber-highlight)] border border-[var(--color-cyber-blue)] rounded-lg p-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[var(--color-cyber-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-[var(--color-cyber-blue)] text-sm font-medium">
                                        Select {currentQuestion.answerCount} answers for this question
                                    </span>
                                </div>
                            )}

                            <div className="grid gap-3">
                                {currentQuestion.options.map((option, idx) => {
                                    const isMultiSelect = (currentQuestion.answerCount || 1) > 1;
                                    const selectedAnswers = isMultiSelect ? (answers[currentQuestion.id] as string[] || []) : [];
                                    const isSelected = isMultiSelect
                                        ? selectedAnswers.includes(option)
                                        : answers[currentQuestion.id] === option;

                                    // Get all correct answers for multi-select
                                    const correctAnswers = currentQuestion.correctAnswers
                                        ? JSON.parse(currentQuestion.correctAnswers)
                                        : [currentQuestion.correct];
                                    const isCorrectAnswer = correctAnswers.includes(option);
                                    const letter = String.fromCharCode(65 + idx);

                                    // Determine styling based on feedback state
                                    let optionStyles = "";
                                    if (showFeedback) {
                                        if (isCorrectAnswer) {
                                            optionStyles = "border-green-500 bg-green-500/20 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                                        } else if (isSelected) {
                                            optionStyles = "border-red-500 bg-red-500/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                                        } else {
                                            optionStyles = "border-gray-700 text-gray-500 opacity-50";
                                        }
                                    } else {
                                        optionStyles = isSelected
                                            ? "border-[var(--color-cyber-blue)] bg-[var(--color-cyber-blue)]/10 text-white shadow-[var(--shadow-neon-blue)]"
                                            : "border-[var(--color-cyber-highlight)] hover:border-[var(--color-cyber-blue)]/50 hover:bg-[var(--color-cyber-highlight)]/50 text-gray-400";
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            className={cn(
                                                "group flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200",
                                                optionStyles,
                                                showFeedback && "cursor-default"
                                            )}
                                        >
                                            <span className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full border mr-4 font-bold text-sm transition-colors",
                                                showFeedback && isCorrectAnswer
                                                    ? "bg-green-500 text-white border-green-500"
                                                    : showFeedback && isSelected
                                                        ? "bg-red-500 text-white border-red-500"
                                                        : isSelected
                                                            ? "bg-[var(--color-cyber-blue)] text-black border-[var(--color-cyber-blue)]"
                                                            : "text-gray-500 border-gray-600 group-hover:border-[var(--color-cyber-blue)] group-hover:text-[var(--color-cyber-blue)]"
                                            )}>
                                                {showFeedback && isCorrectAnswer ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                ) : showFeedback && isSelected ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                ) : (
                                                    letter
                                                )}
                                            </span>
                                            <span className={cn(
                                                "text-base flex-1",
                                                showFeedback && isCorrectAnswer ? "text-green-400 font-medium" :
                                                    showFeedback && isSelected ? "text-red-400" :
                                                        isSelected ? "text-[var(--color-cyber-blue)] font-medium" : "text-gray-300"
                                            )}>
                                                {option}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Feedback Banner */}
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-lg border-2 flex items-center gap-3",
                                    isCorrect
                                        ? "bg-green-500/20 border-green-500 text-green-400"
                                        : "bg-red-500/20 border-red-500 text-red-400"
                                )}
                            >
                                {isCorrect ? (
                                    <>
                                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-medium">Correct! Well done! 🎉</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="font-medium">Incorrect. The correct answer is highlighted in green above.</span>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-4 border-t border-[var(--color-cyber-highlight)]">
                            <Button
                                onClick={handlePrev}
                                disabled={currentIndex === 0 || !showFeedback}
                                variant="ghost"
                                className={cn(
                                    "text-gray-500 hover:text-white",
                                    (currentIndex === 0 || !showFeedback) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                &larr; Previous
                            </Button>

                            {/* Submit/Continue buttons */}
                            {(currentQuestion.answerCount || 1) > 1 && !showFeedback ? (
                                // Multi-select: Show submit button
                                <Button
                                    variant="primary"
                                    onClick={handleMultiSelectSubmit}
                                    disabled={(answers[currentQuestion.id] as string[] || []).length === 0}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Answers
                                </Button>
                            ) : currentIndex === questions.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={() => showFeedback && handleSubmit()}
                                    disabled={isSubmitting || !showFeedback}
                                    className="bg-[var(--color-cyber-green)] hover:bg-[var(--color-cyber-green)] hover:text-black hover:shadow-[var(--shadow-neon-green)] text-black border-none disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : showFeedback ? 'View Results' : 'Select Answer'}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => showFeedback && handleNext()}
                                    disabled={!showFeedback}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {showFeedback ? 'Continue →' : 'Select an Answer'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
