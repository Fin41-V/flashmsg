'use client';
import { useEffect, useState, useRef, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { decryptMessage } from '@/utils/crypto';
import {
    ShieldAlert,
    Lock,
    Trash2,
    UserCircle,
    Clock,
    ExternalLink,
    Ghost,
    ShieldCheck
} from 'lucide-react';

export default function ViewNote({ params }) {
    const { id } = use(params);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('initializing');
    const burntRef = useRef(false);

    useEffect(() => {
        const fetchAndBurn = async () => {
            if (burntRef.current) return;
            burntRef.current = true;
            const hash = window.location.hash.substring(1);

            if (!hash) {
                setStatus('error_key');
                return;
            }

            setStatus('connecting');
            // Simulated Discord handshake delay
            await new Promise(r => setTimeout(r, 1500));

            const { data, error } = await supabase.from('notes').select('content').eq('id', id).single();

            if (error || !data) {
                setStatus('error_notfound');
                return;
            }

            const decrypted = decryptMessage(data.content, hash);

            if (!decrypted) {
                setStatus('error_decrypt');
            } else {
                setMessage(decrypted);
                setStatus('success');
                // Burn on read
                await supabase.from('notes').delete().eq('id', id);
            }
        };
        fetchAndBurn();
    }, [id]);

    return (
        <main className="min-h-screen bg-[#313338] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#5865f2]/40">

            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">

                    {/* 1. LOADING SCREEN (DISCORD HANDSHAKE) */}
                    {(status === 'initializing' || status === 'connecting') && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 bg-[#2b2d31] rounded-[30px] flex items-center justify-center shadow-2xl border border-white/5">
                                    <img src="/logo.png" className="w-12 h-12 invert animate-pulse" alt="Logo" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#f0b232] border-[4px] border-[#313338] rounded-full"></div>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-black uppercase text-xs tracking-[0.2em] mb-1">Connecting</p>
                                <p className="text-[#949ba4] text-[10px] font-medium italic">Establishing end-to-end tunnel...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. ERROR STATE (DISCORD STYLE) */}
                    {status.startsWith('error') && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="pro-card p-10 text-center space-y-6 border-t-4 border-[#f23f43]"
                        >
                            <div className="w-20 h-20 bg-[#f23f43]/10 text-[#f23f43] rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <ShieldAlert size={40} />
                            </div>
                            <div>
                                <h2 className="text-white text-2xl font-black tracking-tight uppercase">Packet Loss / Expired</h2>
                                <p className="text-[#949ba4] mt-3 text-sm leading-relaxed max-w-xs mx-auto">
                                    {status === 'error_key' && "The decryption hash is missing from the request."}
                                    {status === 'error_notfound' && "This transmission has already been intercepted and destroyed."}
                                    {status === 'error_decrypt' && "The encryption key provided is invalid."}
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="pro-button w-full py-4 text-xs tracking-widest"
                            >
                                Return to Network
                            </button>
                        </motion.div>
                    )}

                    {/* 3. SUCCESS STATE (PRIVATE MESSAGE BUBBLE) */}
                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            className="pro-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        >
                            {/* DM Header Bar */}
                            <div className="bg-[#2b2d31] p-4 border-b border-black/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center shadow-lg">
                                            <img src="/logo.png" className="w-6 h-6 invert" alt="Bot" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#23a559] border-[3px] border-[#2b2d31] rounded-full"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-bold text-sm">FlashMsg Secure DM</h3>
                                            <span className="bg-[#5865f2] text-[9px] px-1.5 py-0.5 rounded-sm text-white font-black tracking-tighter uppercase">Verified</span>
                                        </div>
                                        <p className="text-[10px] text-[#949ba4] font-bold tracking-widest uppercase">E2E Session Active</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-zinc-500">
                                    <Clock size={18} className="hover:text-white cursor-help transition-colors" />
                                    <Trash2 size={18} className="hover:text-[#f23f43] cursor-pointer transition-colors" />
                                </div>
                            </div>

                            {/* Chat Bubble Area */}
                            <div className="p-8">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 bg-[#383a40] rounded-full shrink-0 flex items-center justify-center text-zinc-500 border border-white/5">
                                        <UserCircle size={32} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <span className="text-white font-bold text-base hover:underline cursor-pointer">Ghost_Sender</span>
                                            <span className="text-[11px] text-zinc-500 font-medium">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {/* The actual secret message */}
                                        <div className="text-[#dbdee1] text-[17px] leading-relaxed whitespace-pre-wrap font-medium">
                                            {message}
                                        </div>

                                        {/* Security Confirmation Embed */}
                                        <div className="mt-8 bg-[#1e1f22]/50 rounded-lg p-4 border border-white/5 flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#23a559]/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="text-[#23a559]" size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transmission Scrubbed</h4>
                                                <p className="text-[11px] text-[#949ba4] leading-normal">
                                                    This packet was deleted from the server core the moment you opened this session. No logs remain.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reply Link Footer */}
                            <div className="bg-[#2b2d31]/50 p-4 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="text-xs text-[#00a8fc] font-bold uppercase tracking-widest hover:text-[#00c0ff] transition-colors flex items-center gap-2 group"
                                >
                                    Terminate & Reply <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer Branding */}
            <div className="fixed bottom-8 text-[#4e5058] text-[11px] font-black uppercase tracking-[0.3em] pointer-events-none">
                FlashMsg Neural-Link // Build 2.1.0
            </div>
        </main>
    );
}