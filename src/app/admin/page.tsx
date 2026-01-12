'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function AdminPage() {
    const [selectedExam, setSelectedExam] = useState('CEH');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus('Uploading and parsing...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('exam', selectedExam);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setStatus(`Success: ${data.message}`);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (e) {
            setStatus('System Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-black text-white flex flex-col items-center">
            <h1 className="text-3xl font-mono text-cyber-blue mb-8">ADMIN TERMINAL</h1>

            <Card className="w-full max-w-md p-8 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Exam</label>
                    <select
                        className="w-full bg-cyber-dark border border-gray-700 rounded p-2 text-white"
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                    >
                        <option value="CEH">CEH (Certified Ethical Hacker)</option>
                        <option value="ISC2_CC">ISC2 CC (Certified in Cybersecurity)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Exam Dump PDF</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-cyber-blue file:text-black
              hover:file:bg-white"
                    />
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full"
                >
                    {loading ? 'Processing...' : 'Upload & Extract Questions'}
                </Button>

                {status && (
                    <div className="p-4 bg-white/5 rounded border border-gray-700 font-mono text-sm break-all">
                        {status}
                    </div>
                )}
            </Card>

            <Link href="/" className="mt-8 text-gray-500 hover:text-white">
                &larr; Exit Admin Mode
            </Link>
        </div>
    );
}
