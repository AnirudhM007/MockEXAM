'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';

interface QuestionContext {
    id: string;
    type: string;
    content: string;
    position: number;
    metadata?: string;
}

interface Props {
    contexts?: QuestionContext[];
}

export function QuestionContext({ contexts }: Props) {
    useEffect(() => {
        Prism.highlightAll();
    }, [contexts]);

    if (!contexts || contexts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 my-6">
            {contexts.map((ctx) => {
                const metadata = ctx.metadata ? JSON.parse(ctx.metadata) : {};

                if (ctx.type === 'code_block' || ctx.type === 'rule') {
                    return (
                        <div key={ctx.id} className="bg-gray-900 rounded-lg border border-cyber-highlight overflow-hidden">
                            <div className="px-4 py-2 bg-cyber-gray border-b border-cyber-highlight flex items-center justify-between">
                                <span className="text-xs text-gray-400 uppercase font-mono">
                                    {metadata.language || ctx.type}
                                </span>
                                <span className="text-xs text-cyber-blue">
                                    {ctx.position === 0 ? 'Referenced Below' : 'Referenced Above'}
                                </span>
                            </div>
                            <pre className="p-4 overflow-x-auto">
                                <code className={`language-${metadata.language || 'bash'} text-sm`}>
                                    {ctx.content}
                                </code>
                            </pre>
                        </div>
                    );
                }

                if (ctx.type === 'image') {
                    return (
                        <div key={ctx.id} className="rounded-lg border border-cyber-highlight overflow-hidden bg-gray-900">
                            <div className="px-4 py-2 bg-cyber-gray border-b border-cyber-highlight">
                                <span className="text-xs text-gray-400 uppercase">
                                    Diagram/Image
                                </span>
                            </div>
                            <div className="p-4 flex justify-center">
                                <img
                                    src={ctx.content}
                                    alt="Question context"
                                    className="max-w-full h-auto rounded border border-gray-700"
                                    style={{ maxHeight: metadata.maxHeight || '400px' }}
                                />
                            </div>
                        </div>
                    );
                }

                if (ctx.type === 'diagram') {
                    return (
                        <div key={ctx.id} className="rounded-lg border border-cyber-highlight overflow-hidden bg-cyber-dark p-4">
                            <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                {ctx.content}
                            </div>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}
