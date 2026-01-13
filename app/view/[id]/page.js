'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { decryptMessage } from '@/utils/crypto';
import LetterGlitch from '@/components/LetterGlitch';
import { ShieldAlert, ShieldCheck, Terminal, LockKeyhole, Zap, RefreshCw } from 'lucide-react';

// Refined Typewriter Effect for a premium feel
const TypewriterText = ({ text, delay = 25 }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i++;
            if (i > text.length) clearInterval(timer);
        }, delay);
        return () => clearInterval(timer);
    }, [text, delay]);
    return <span>{displayedText}</span>;
};

export default function ViewNote({ params }) {
    // Correctly unwrapping params for Next.js 15+
    const { id } = use(params);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('decrypting');
    const burntRef = useRef(false);

    useEffect(() => {
        const fetchAndBurn = async () => {
            // Prevents double-firing in React Strict Mode which would "burn" the note before showing it
            if (burntRef.current) return;
            burntRef.current = true;

            // CRITICAL: Extract the key from the URL hash (everything after #)
            const hash = window.location.hash.substring(1);

            if (!hash) {
                console.error("Decryption key missing from URL");
                setStatus('error');
                return;
            }

            try {
                // 1. Fetch encrypted content from Supabase
                const { data, error } = await supabase
                    .from('notes')
                    .select('content')
                    .eq('id', id)
                    .single();

                if (error || !data) {
                    setStatus('error');
                    return;
                }

                // 2. Decrypt the content using the hash key
                const decrypted = decryptMessage(data.content, hash);

                if (!decrypted) {
                    setStatus('error');
                } else {
                    setMessage(decrypted);
                    setStatus('success');

                    // 3. IMMEDIATELY DELETE from database (Burn-on-Read)
                    await supabase.from('notes').delete().eq('id', id);
                }
            } catch (err) {
                console.error("Decryption protocol failure:", err);
                setStatus('error');
            }
        };

        fetchAndBurn();
    }, [id]);

    return (
        <main className="main-viewport">
            {/* CSS INJECTION: Matching the Gemini Homepage exactly */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
                
                :root {
                    --font-quicksand: 'Quicksand', sans-serif;
                }

                .main-viewport {
                    background-color: #0e0e0e;
                    min-height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e3e3e3;
                    position: relative;
                    overflow: hidden;
                    font-family: var(--font-quicksand);
                }

                .gemini-pill-view {
                    background-color: #1e1f20;
                    border-radius: 32px;
                    border: 1px solid #3c4043;
                    width: 100%;
                    max-width: 768px;
                    padding: 48px;
                    z-index: 10;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }

                .glitch-wrapper {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    opacity: 0.08;
                    pointer-events: none;
                    filter: grayscale(100%);
                }
            `}</style>

            <div className="glitch-wrapper">
                <LetterGlitch
                    glitchColors={['#ffffff']}
                    glitchSpeed={180}
                    centerVignette
                />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center px-6">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="gemini-pill-view"
                        >
                            <header className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <Terminal size={20} className="text-[#4fd1c5]" />
                                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                                        Secure Content Decrypted
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Purged</span>
                                </div>
                            </header>

                            <div className="text-zinc-200 text-xl leading-relaxed italic mb-12 min-h-[100px]">
                                <TypewriterText text={message} />
                            </div>

                            <footer className="flex items-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5">
                                <ShieldCheck size={20} className="text-[#4fd1c5] shrink-0" />
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 leading-tight">
                                    Privacy Verification: This message was decrypted locally. The source fragment has been erased from the network.
                                </p>
                            </footer>
                        </motion.div>
                    ) : status === 'error' ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1e1f20] rounded-[2.5rem] p-12 text-center max-w-md border border-red-500/20 shadow-2xl"
                        >
                            <ShieldAlert className="mx-auto mb-6 text-red-500" size={52} />
                            <h2 className="text-white font-bold text-xl uppercase tracking-[0.2em] mb-4">Access Denied</h2>
                            <p className="text-zinc-500 text-[11px] uppercase leading-relaxed tracking-widest mb-10">
                                This link has either expired, been previously accessed, or contains an invalid decryption key.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full h-14 bg-[#e3e3e3] text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg"
                            >
                                Return to Terminal
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key="loading" className="flex flex-col items-center gap-6">
                            <RefreshCw className="animate-spin text-[#4fd1c5]" size={40} />
                            <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-zinc-600 animate-pulse">
                                Accessing Core...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="fixed bottom-10 flex gap-12 opacity-20 text-[10px] font-bold text-white uppercase tracking-[0.5em] italic pointer-events-none">
                <div className="flex items-center gap-2 font-quicksand"><LockKeyhole size={14} /> AES-256-GCM</div>
                <div className="flex items-center gap-2 font-quicksand"><Zap size={14} /> Ephemeral</div>
            </footer>
        </main>
    );
}