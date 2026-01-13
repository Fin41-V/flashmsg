'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { decryptMessage } from '@/utils/crypto';
import LetterGlitch from '@/components/LetterGlitch';
import { ShieldAlert, ShieldCheck, Terminal, LockKeyhole, Zap, RefreshCw, KeyRound } from 'lucide-react';

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
    const { id } = use(params);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('pending_code'); // New state for room code entry
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const burntRef = useRef(false);

    const handleDecrypt = async () => {
        if (roomCode.length !== 6 || loading) return;
        setLoading(true);

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

            // 2. Decrypt using the provided 6-digit Room Code
            const decrypted = decryptMessage(data.content, roomCode);

            if (!decrypted) {
                // If decryption fails, the code was wrong
                alert("INVALID ACCESS CODE: Decryption failed.");
                setLoading(false);
            } else {
                setMessage(decrypted);
                setStatus('success');
                // 3. Optional: Burn on read
                await supabase.from('notes').delete().eq('id', id);
            }
        } catch (err) {
            console.error("Decryption protocol failure:", err);
            setStatus('error');
        }
    };

    return (
        <main className="main-viewport">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
                
                :root { --font-quicksand: 'Quicksand', sans-serif; }

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

                .code-input {
                    background: #121212;
                    border: 1px solid #3c4043;
                    border-radius: 100px;
                    padding: 16px;
                    text-align: center;
                    font-size: 1.5rem;
                    letter-spacing: 0.5em;
                    font-weight: bold;
                    color: #4fd1c5;
                    outline: none;
                    width: 100%;
                    margin-bottom: 24px;
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
                <LetterGlitch glitchColors={['#ffffff']} glitchSpeed={180} centerVignette />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center px-6">
                <AnimatePresence mode="wait">
                    {status === 'pending_code' ? (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="gemini-pill-view text-center"
                        >
                            <KeyRound className="mx-auto mb-6 text-[#4fd1c5]" size={48} />
                            <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Enter Access Code</h2>
                            <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest">A 6-digit room code is required to decrypt this fragment.</p>

                            <input
                                type="text"
                                maxLength={6}
                                className="code-input"
                                placeholder="000000"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))}
                            />

                            <button
                                onClick={handleDecrypt}
                                disabled={roomCode.length !== 6 || loading}
                                className="w-full h-14 bg-[#e3e3e3] text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-[#4fd1c5] transition-all disabled:opacity-20"
                            >
                                {loading ? 'Processing...' : 'Decrypt Transmission'}
                            </button>
                        </motion.div>
                    ) : status === 'success' ? (
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
                                        Fragment Decrypted // Room: {roomCode}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest">Scrubbed</span>
                                </div>
                            </header>

                            <div className="text-zinc-200 text-xl leading-relaxed italic mb-12 min-h-[100px]">
                                <TypewriterText text={message} />
                            </div>

                            <footer className="flex items-center gap-4 p-5 bg-black/20 rounded-2xl border border-white/5">
                                <ShieldCheck size={20} className="text-[#4fd1c5] shrink-0" />
                                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 leading-tight">
                                    Privacy Node: This data was decrypted using PBKDF2 derivation. The server-side blob has been purged.
                                </p>
                            </footer>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1e1f20] rounded-[2.5rem] p-12 text-center max-w-md border border-red-500/20 shadow-2xl"
                        >
                            <ShieldAlert className="mx-auto mb-6 text-red-500" size={52} />
                            <h2 className="text-white font-bold text-xl uppercase tracking-[0.2em] mb-4">Access Denied</h2>
                            <p className="text-zinc-500 text-[11px] uppercase leading-relaxed tracking-widest mb-10">
                                Link expired or room nuked. No data found at this coordinate.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full h-14 bg-[#e3e3e3] text-black rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg"
                            >
                                Return to Terminal
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <footer className="fixed bottom-10 flex gap-12 opacity-20 text-[10px] font-bold text-white uppercase tracking-[0.5em] italic pointer-events-none">
                <div className="flex items-center gap-2"><LockKeyhole size={14} /> PBKDF2-AES</div>
                <div className="flex items-center gap-2"><Zap size={14} /> Ephemeral</div>
            </footer>
        </main>
    );
}