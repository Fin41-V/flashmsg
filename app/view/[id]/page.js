'use client';
import { useEffect, useState, useRef, use } from 'react';
import LetterGlitch from '@/components/LetterGlitch';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { decryptMessage } from '@/utils/crypto';
import { ShieldAlert, Lock, Trash2, UserCircle, Clock, ShieldCheck } from 'lucide-react';

export default function ViewNote({ params }) {
    const { id } = use(params);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('connecting');
    const burntRef = useRef(false);

    useEffect(() => {
        const fetchAndBurn = async () => {
            if (burntRef.current) return;
            burntRef.current = true;
            const hash = window.location.hash.substring(1);
            if (!hash) { setStatus('error'); return; }

            const { data, error } = await supabase.from('notes').select('content').eq('id', id).single();
            if (error || !data) { setStatus('error'); return; }

            const decrypted = decryptMessage(data.content, hash);
            if (!decrypted) { setStatus('error'); }
            else {
                setMessage(decrypted);
                setStatus('success');
                await supabase.from('notes').delete().eq('id', id);
            }
        };
        fetchAndBurn();
    }, [id]);

    return (
        <main className="relative h-screen w-screen overflow-hidden bg-black font-mono">
            <div className="absolute inset-0 z-0 opacity-40">
                <LetterGlitch
                    glitchColors={['#1a2e25', '#2b4539', '#61dca3']}
                    glitchSpeed={80}
                    centerVignette={true}
                />
            </div>

            <div className="relative z-10 flex h-full items-center justify-center p-4">
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl discord-glass overflow-hidden shadow-[0_0_50px_rgba(97,220,163,0.1)]">
                            <div className="bg-black/40 p-4 border-b border-[#61dca3]/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-[#61dca3]/20 flex items-center justify-center text-[#61dca3]">
                                        <Lock size={16} />
                                    </div>
                                    <span className="text-[10px] text-[#61dca3] font-bold uppercase tracking-widest">Decrypted Transmission</span>
                                </div>
                                <div className="text-zinc-600 uppercase text-[9px] font-bold tracking-tighter">Burn-On-Read Active</div>
                            </div>

                            <div className="p-8">
                                <div className="flex gap-4 mb-8">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700">
                                        <UserCircle size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-[#61dca3] font-bold text-sm">GHOST_USER</span>
                                            <span className="text-[9px] text-zinc-600 uppercase italic">Packet {id.slice(0, 8)}</span>
                                        </div>
                                        <div className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap selection:bg-[#61dca3]/30">
                                            {message}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-[#61dca3]/60">
                                    <ShieldCheck size={18} />
                                    <p className="text-[10px] uppercase font-bold tracking-widest">Database entry scrubbed from server core.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="discord-glass p-8 text-center max-w-sm border-t-4 border-red-900">
                            <ShieldAlert className="mx-auto mb-4 text-red-600" size={48} />
                            <h2 className="text-white font-black text-xl uppercase italic">Link Terminated</h2>
                            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-tighter">This message has self-destructed or the key is invalid.</p>
                            <button onClick={() => window.location.href = '/'} className="mt-6 w-full py-2 border border-zinc-800 text-zinc-500 text-[10px] uppercase hover:text-white hover:border-white transition-all">
                                Return to Network
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}