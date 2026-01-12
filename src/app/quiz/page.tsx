'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizInterface } from '@/components/quiz/QuizInterface';
import { Button } from '@/components/ui/Button';

// Mock data fallback for failure or empty DB
const MOCK_QUESTIONS = [
    {
        id: "q1",
        text: "Which of the following is a passive reconnaissance technique?",
        options: ["Network Scanners", "Whois Query", "Ping Sweep", "Port Scanning"],
        correct: "Whois Query"
    },
    {
        id: "q2",
        text: "What does the CIA triad stand for?",
        options: [
            "Confidentiality, Integrity, Availability",
            "Control, Intelligence, Authenticity",
            "Computer, Internet, Access",
            "Code, Input, Audit"
        ],
        correct: "Confidentiality, Integrity, Availability"
    }
];

const QuizContent = () => {
    const searchParams = useSearchParams();
    const exam = searchParams.get('exam') || 'CEH';
    const mode = searchParams.get('mode') || 'short';
    const modules = searchParams.get('modules');

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchQuestions() {
            try {
                let url = `/api/quiz?exam=${exam}&mode=${mode}`;
                if (modules) url += `&modules=${modules}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();

                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                } else {
                    // Fallback for demo
                    console.log("No questions found, using mock data.");
                    setQuestions(MOCK_QUESTIONS);
                }
            } catch (err) {
                setError('Failed to load questions. System offline.');
                // Fallback for demo
                setQuestions(MOCK_QUESTIONS);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [exam, mode]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyber-blue animate-pulse">Initializing Test Environment...</p>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
                <div className="text-center space-y-4">
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry Connection</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-cyber-grid bg-fixed">
            <QuizInterface questions={questions} examName={exam} />
        </div>
    );
};

export default function QuizPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-cyber-dark">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyber-blue animate-pulse">Loading Quiz...</p>
                </div>
            </div>
        }>
            <QuizContent />
        </Suspense>
    );
}
