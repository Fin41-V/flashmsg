'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { generateKey, encryptMessage } from '@/utils/crypto';
import {
  PlusCircle, Hash, Copy, CheckCircle2,
  Smile, Gift, StickyNote, AtSign, Inbox, Users, Search,
  Settings, Mic, Headphones, Ghost
} from 'lucide-react';

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
    <div className="flex h-screen bg-[#313338] text-[#dbdee1] overflow-hidden">

      {/* 1. ULTRA-MINIMAL SERVER RAIL */}
      <div className="hidden md:flex w-[72px] flex-col items-center py-3 bg-[#1e1f22] gap-2 border-r border-black/20">
        <motion.div
          whileHover={{ borderRadius: "16px" }}
          className="w-12 h-12 bg-[#5865f2] rounded-[24px] flex items-center justify-center cursor-pointer transition-all shadow-lg"
        >
          <img src="/logo.png" className="w-8 h-8 invert" alt="Logo" />
        </motion.div>
        <div className="w-8 h-[2px] bg-white/5 rounded-full my-1"></div>
        <div className="w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-xl hover:bg-[#23a559] hover:text-white transition-all duration-200 flex items-center justify-center text-zinc-500 cursor-pointer">
          <PlusCircle size={24} />
        </div>
      </div>

      {/* 2. CHANNELS GLASS PANEL */}
      <div className="hidden lg:flex w-60 flex-col bg-[#2b2d31]">
        <div className="h-12 px-4 shadow-sm border-b border-black/20 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
          <span className="font-bold text-white truncate text-sm">FlashMsg Network</span>
          <Settings size={14} className="text-zinc-400" />
        </div>
        <div className="flex-1 p-3 space-y-4 pt-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-zinc-500 uppercase px-2 mb-1 tracking-wider">Privacy Zones</p>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#3f4147] text-white cursor-default">
              <Hash size={18} className="text-zinc-400" /> <span className="text-sm font-medium">classified-chat</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
              <Hash size={18} className="text-zinc-400" /> <span className="text-sm">burn-logs</span>
            </div>
          </div>
        </div>

        {/* DISCORD USER BAR */}
        <div className="p-2 bg-[#232428] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                <img src="/logo.png" className="w-5 h-5 invert opacity-70" alt="pfp" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23a559] border-2 border-[#232428] rounded-full"></div>
            </div>
            <div className="text-[11px]">
              <p className="font-bold text-white leading-tight">GhostUser</p>
              <p className="text-zinc-400">#0001</p>
            </div>
          </div>
          <div className="flex gap-1 text-zinc-400">
            <Mic size={14} className="hover:text-white cursor-pointer p-0.5" />
            <Headphones size={14} className="hover:text-white cursor-pointer p-0.5" />
            <Settings size={14} className="hover:text-white cursor-pointer p-0.5" />
          </div>
        </div>
      </div>

      {/* 3. MAIN MESSAGE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">

        {/* HEADER */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-black/20 bg-[#313338] z-10 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-white overflow-hidden">
            <Hash size={24} className="text-[#949ba4] shrink-0" />
            <span className="truncate">classified-chat</span>
          </div>
          <div className="flex items-center gap-4 text-[#949ba4] shrink-0">
            <AtSign size={20} className="hover:text-white cursor-pointer" />
            <Inbox size={20} className="hover:text-white cursor-pointer" />
            <Users size={20} className="hover:text-white cursor-pointer" />
            <div className="hidden sm:block relative">
              <input type="text" placeholder="Search" className="bg-[#1e1f22] text-xs py-1 px-2 rounded w-32 focus:w-48 transition-all outline-none" />
              <Search size={14} className="absolute right-2 top-1.5" />
            </div>
          </div>
        </header>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="mt-10 mb-8 px-2">
            <div className="w-16 h-16 bg-[#41434a] rounded-full flex items-center justify-center mb-4">
              <Hash size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Welcome to #classified-chat!</h2>
            <p className="text-zinc-400 text-sm">This is the start of the channel. Send a ghost message to see encryption in action.</p>
          </div>

          <AnimatePresence>
            {link && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 group">
                <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center shrink-0 shadow-lg">
                  <Ghost className="w-6 h-6 text-white" />
                </div>
                <div className="pro-embed flex-1 max-w-2xl border-l-4 border-[#5865f2]">
                  <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-tight">Security Protocol Initialized</h4>
                  <p className="text-sm text-zinc-400 mb-4 leading-snug">Data is locked. The following link is valid for <strong>one-time access</strong> only.</p>

                  <div className="bg-[#1e1f22] p-3 rounded-lg border border-black/20 font-mono text-sm text-[#00a8fc] break-all shadow-inner">
                    {link}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                      className="pro-button px-6"
                    >
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={() => setLink('')} className="bg-[#4e5058] hover:bg-[#676a74] text-white px-4 py-2 rounded font-bold text-xs uppercase transition-colors">
                      Clear
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT FOOTER */}
        <div className="px-4 pb-6">
          <div className="pro-input-wrapper">
            <PlusCircle size={24} className="text-[#b5bac1] hover:text-white cursor-pointer transition-colors" />
            <textarea
              className="w-full bg-transparent border-none outline-none text-[#dbdee1] placeholder-[#4e5058] resize-none h-6 mt-0.5 text-[15px]"
              placeholder="Message #classified-chat"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  createNote();
                }
              }}
            />
            <div className="flex gap-4 text-[#b5bac1]">
              <Gift size={22} className="hover:text-white cursor-pointer hidden sm:block" />
              <StickyNote size={22} className="hover:text-white cursor-pointer hidden sm:block" />
              <Smile size={22} className="hover:text-white cursor-pointer" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 px-1 uppercase font-bold tracking-widest">
            {loading ? 'Encrypting Packets...' : 'Zero-Knowledge Encryption Active'}
          </p>
        </div>
      </div>
    </div>
  );
}