'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ResultsContent = () => {
    const searchParams = useSearchParams();
    const score = parseInt(searchParams.get('score') || '0');
    const total = parseInt(searchParams.get('total') || '0');
    const exam = searchParams.get('exam') || 'Exam';

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPass = percentage >= 70;

    const [reviewData, setReviewData] = useState<any>(null);

    useEffect(() => {
        // Retrieve detailed data from local storage to avoid URL limits
        const stored = localStorage.getItem('lastResult');
        if (stored) {
            setReviewData(JSON.parse(stored));
        }
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8 bg-cyber-grid bg-fixed text-white">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Score Card */}
                <Card className={cn(
                    "text-center py-12 border-2",
                    isPass ? "border-cyber-green shadow-neon-green" : "border-cyber-danger shadow-[0_0_20px_#ff005530]"
                )}>
                    <h1 className="text-4xl font-bold mb-4">{exam} Results</h1>

                    <div className="mb-8">
                        <span className={cn(
                            "text-8xl font-black tracking-tighter",
                            isPass ? "text-cyber-green" : "text-cyber-danger"
                        )}>
                            {percentage}%
                        </span>
                    </div>

                    <p className="text-2xl mb-8">
                        You scored <span className="font-bold text-white">{score}</span> out of <span className="font-bold text-white">{total}</span>
                    </p>

                    <div className={cn(
                        "inline-block px-8 py-2 rounded-full text-xl font-bold border",
                        isPass ? "bg-cyber-green/10 text-cyber-green border-cyber-green" : "bg-cyber-danger/10 text-cyber-danger border-cyber-danger"
                    )}>
                        {isPass ? 'PASSED' : 'FAILED'}
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <Link href="/">
                            <Button variant="ghost">Return to Base</Button>
                        </Link>
                        <Link href={`/select-mode?exam=${exam}`}>
                            <Button variant="primary">Retake Exam</Button>
                        </Link>
                    </div>
                </Card>

                {/* Detailed Review */}
                {reviewData && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-cyber-blue border-b border-cyber-blue/30 pb-2">
                            Mission Debrief
                        </h2>

                        {reviewData.questions.map((q: any, idx: number) => {
                            const userAnswer = reviewData.answers[q.id];
                            // Assuming direct text match for simplicity in this version, 
                            // or using the option value.
                            const isCorrect = userAnswer === q.correct;

                            return (
                                <Card key={idx} className={cn(
                                    "p-6 border-l-4",
                                    isCorrect ? "border-l-cyber-green border-white/10" : "border-l-cyber-danger border-white/10"
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {isCorrect ? (
                                                <CheckCircle className="text-cyber-green w-6 h-6" />
                                            ) : (
                                                <XCircle className="text-cyber-danger w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-lg font-medium text-gray-200">
                                                <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                                                {q.text}
                                            </h3>

                                            <div className="grid gap-2 text-sm">
                                                <div className="bg-white/5 p-3 rounded flex justify-between">
                                                    <span className="text-gray-400">Your Answer:</span>
                                                    <span className={cn("font-bold", isCorrect ? "text-cyber-green" : "text-cyber-danger")}>
                                                        {userAnswer || "Not Answered"}
                                                    </span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="bg-cyber-green/5 p-3 rounded flex justify-between border border-cyber-green/20">
                                                        <span className="text-gray-400">Correct Answer:</span>
                                                        <span className="font-bold text-cyber-green">
                                                            {q.correct}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyber-blue animate-pulse">Calculating Results...</p>
                </div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
