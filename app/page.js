'use client';
import { useState } from 'react';
import LetterGlitch from '../components/LetterGlitch';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { generateKey, encryptMessage } from '@/utils/crypto';
import { Terminal, Lock, Copy, CheckCircle2, Hash, Shield } from 'lucide-react';

export default function Home() {
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createNote = async () => {
    if (!note || loading) return;
    setLoading(true);
    try {
      const key = generateKey();
      const encrypted = encryptMessage(note, key);
      const { data } = await supabase.from('notes').insert([{ content: encrypted }]).select().single();
      if (data) setLink(`${window.location.origin}/view/${data.id}#${key}`);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-mono">
      {/* THE GLITCH BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={['#1a2e25', '#2b4539', '#61dca3']}
          glitchSpeed={60}
          centerVignette={true}
          outerVignette={false}
        />
      </div>

      {/* THE UI OVERLAY */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[500px] discord-glass overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 p-4 bg-black/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#61dca3]/20 text-[#61dca3]">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-[#61dca3] uppercase">FlashMsg Terminal</h1>
              <p className="text-[10px] text-zinc-500 uppercase">Secure Handshake: Established</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {!link ? (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="terminal-input p-4 mb-4">
                    <textarea
                      className="w-full bg-transparent border-none outline-none text-sm resize-none h-32 placeholder-zinc-700 text-[#61dca3]"
                      placeholder="ENTER CLASSIFIED DATA..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={createNote}
                    disabled={loading || !note}
                    className="w-full py-3 bg-[#61dca3] text-black font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#4ebf8b] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {loading ? 'ENCRYPTING...' : <><Lock size={14} /> INITIATE GHOST SEQUENCE</>}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="link" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="bg-black/60 rounded p-4 border border-[#61dca3]/30">
                    <p className="text-[10px] text-[#61dca3] uppercase font-bold mb-2 tracking-widest">Target URL Generated:</p>
                    <div className="text-xs break-all text-zinc-300 font-mono bg-black/40 p-3 rounded border border-white/5">
                      {link}
                    </div>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="w-full py-3 border border-[#61dca3] text-[#61dca3] font-bold uppercase text-xs tracking-widest hover:bg-[#61dca3]/10 transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    {copied ? 'COPIED TO CLIPBOARD' : 'COPY SECRET LINK'}
                  </button>
                  <button onClick={() => { setLink(''); setNote(''); }} className="w-full text-[10px] text-zinc-600 uppercase text-center hover:text-zinc-400">
                    Destroy Session and Restart
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-black/60 p-3 text-center border-t border-white/5">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.3em]">
              Zero-Knowledge Architecture // Burn-On-Read Enabled
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}