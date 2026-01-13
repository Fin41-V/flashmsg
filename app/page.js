'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, SendHorizontal, Copy, CheckCircle2, RefreshCw, Zap, LockKeyhole } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { generateKey, encryptMessage } from '@/utils/crypto';
import LetterGlitch from '@/components/LetterGlitch';

export default function Home() {
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const createNote = async () => {
    if (!note || loading) return;
    setLoading(true);
    try {
      const key = generateKey();
      const encrypted = encryptMessage(note, key);
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content: encrypted }])
        .select()
        .single();

      if (error) throw error;
      if (data) setLink(`${window.location.origin}/view/${data.id}#${key}`);
    } catch (e) {
      console.error("Transmission failure:", e);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="main-viewport">
      {/* 1. CSS INJECTION: Forces Quicksand and Layout fix */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
        
        :root {
          --font-quicksand: 'Quicksand', sans-serif;
        }

        .main-viewport {
          background-color: #0a0a0a;
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

        .gemini-pill {
          background-color: #121212;
          border-radius: 32px;
          border: 1px solid #2d3748;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          max-width: 700px;
          padding: 8px;
          z-index: 10;
        }

        .gemini-pill:focus-within {
          border-color: #4fd1c5;
          background-color: #161616;
          box-shadow: 0 0 40px rgba(79, 209, 197, 0.08);
        }

        .stealth-textarea {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          min-height: 140px;
          padding: 20px 28px;
          color: #e3e3e3;
          font-size: 1.15rem;
          resize: none;
          font-family: var(--font-quicksand);
          font-weight: 500;
        }

        .glitch-wrapper {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.15;
          pointer-events: none;
        }
      `}</style>

      {/* 2. THE LETTER GLITCH BACKGROUND */}
      <div className="glitch-wrapper">
        <LetterGlitch
          glitchColors={['#2d3748', '#4fd1c5']}
          glitchSpeed={100}
          centerVignette={true}
          outerVignette={true}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">

        {/* HEADER SECTION */}
        {!link && (
          <motion.header
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-3">
              <Shield className="text-[#4fd1c5]" size={36} />
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase">FlashMsg</h1>
            </div>
            <p className="text-[10px] font-bold tracking-[0.4em] text-zinc-500 uppercase">
              End-to-End Ephemeral Encryption
            </p>
          </motion.header>
        )}

        {/* INTERACTION AREA */}
        <div className="w-full max-w-[700px]">
          <AnimatePresence mode="wait">
            {!link ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <div className="gemini-pill">
                  <textarea
                    ref={textareaRef}
                    className="stealth-textarea"
                    placeholder="Enter message for one-time secure extraction..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <div className="flex items-center justify-between px-6 pb-3">
                    <div className="flex gap-5 text-zinc-600">
                      <LockKeyhole size={20} className="hover:text-zinc-400 transition-colors cursor-help" title="AES-256-GCM" />
                      <Zap size={20} className="hover:text-zinc-400 transition-colors cursor-help" title="Burn-on-Read" />
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">Verified Node</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={createNote}
                      disabled={loading || !note.trim()}
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${note.trim() && !loading ? 'bg-[#4fd1c5] text-black shadow-lg shadow-teal-500/20' : 'bg-zinc-800 text-zinc-500'
                        }`}
                    >
                      {loading ? <RefreshCw className="animate-spin" /> : <SendHorizontal size={24} />}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="link"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="bg-[#121212] rounded-[2.5rem] border border-[#4fd1c5]/30 p-10 text-center shadow-2xl">
                  <div className="flex items-center justify-center gap-2 text-[#4fd1c5] mb-6">
                    <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em]">
                      Secure Payload Prepared
                    </h2>
                  </div>

                  <div className="bg-black/40 p-6 rounded-2xl font-mono text-zinc-400 break-all text-sm mb-10 border border-white/5 selection:bg-[#4fd1c5]/30">
                    {link}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full h-16 bg-white text-black rounded-full font-bold uppercase text-[11px] tracking-[0.3em] hover:bg-[#4fd1c5] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Transmission Link'}
                  </button>

                  <button
                    onClick={() => { setLink(''); setNote(''); }}
                    className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest hover:text-white transition-colors font-bold"
                  >
                    [ Purge Buffer and Restart ]
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FIXED FOOTER SPECS */}
      <footer className="fixed bottom-10 w-full flex justify-center gap-10 opacity-30 pointer-events-none text-[10px] font-bold text-white uppercase tracking-[0.4em] italic">
        <span>AES-GCM-256</span>
        <span>Zero-Knowledge</span>
        <span>Ephemeral Node</span>
      </footer>
    </main>
  );
}