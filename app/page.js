'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, SendHorizontal, RefreshCw, Zap, LockKeyhole, Users, Terminal, UserCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { encryptMessage, decryptMessage } from '@/utils/crypto';
import LetterGlitch from '@/components/LetterGlitch';

export default function Home() {
  const [note, setNote] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [alias, setAlias] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const textareaRef = useRef(null);
  const scrollRef = useRef(null);

  // 1. GENERATE COMPLEX 6-CHAR CODE (Letters, Numbers, Symbols)
  const generateComplexCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 2. CREATE NEW ROOM (With 1 Hour Expiry)
  const handleCreateRoom = async () => {
    if (!alias) return alert("Please set an ALIAS first.");
    setLoading(true);

    const newCode = generateComplexCode();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // 1 Hour Timer

    // Ensure code is unique by trying to insert
    const { error } = await supabase.from('notes').insert([{
      content: encryptMessage(`[SYSTEM]: Room initialized by ${alias}. Manual Nuke or 1-hour timer active.`, newCode),
      room_code: newCode,
      expires_at: expiryDate.toISOString()
    }]);

    if (error) {
      // If code exists, try once more
      handleCreateRoom();
    } else {
      setRoomCode(newCode);
      setInRoom(true);
    }
    setLoading(false);
  };

  // 3. JOIN EXISTING ROOM (Strict Check)
  const handleJoinRoom = async () => {
    if (!alias || roomCode.length < 6) return alert("Enter Alias and 6-char Code.");
    setLoading(true);

    const { data, error } = await supabase
      .from('notes')
      .select('id')
      .eq('room_code', roomCode)
      .limit(1);

    if (data && data.length > 0) {
      setInRoom(true);
    } else {
      alert("ACCESS DENIED: Room not found or expired.");
    }
    setLoading(false);
  };

  // 4. REALTIME SYNC (Presence & Auto-Nuke)
  useEffect(() => {
    if (!roomCode || !inRoom) return;

    const fetchHistory = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('room_code', roomCode)
        .order('created_at', { ascending: true });

      if (data) {
        const decrypted = data.map(msg => ({
          ...msg,
          content: decryptMessage(msg.content, roomCode) || "[Encrypted Fragment]"
        }));
        setMessages(decrypted);
      }
    };

    fetchHistory();

    const channel = supabase.channel(`room_${roomCode}`, {
      config: { presence: { key: alias } }
    });

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `room_code=eq.${roomCode}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new;
          const decrypted = decryptMessage(newMsg.content, roomCode);
          setMessages(prev => [...prev, { ...newMsg, content: decrypted || "[Encrypted Fragment]" }]);
        } else if (payload.eventType === 'DELETE') {
          // KICK EVERYONE IMMEDIATELY
          handleExit();
          alert("SESSION TERMINATED: Data purged by user or timer.");
        }
      })
      .on('presence', { event: 'sync' }, () => {
        setActiveUsers(Object.keys(channel.presenceState()));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await channel.track({ alias });
      });

    return () => { supabase.removeChannel(channel); };
  }, [roomCode, inRoom]);

  const handleExit = () => {
    setInRoom(false);
    setRoomCode('');
    setMessages([]);
    window.location.reload();
  };

  const postMessage = async () => {
    if (!note.trim() || !alias) return;
    const encrypted = encryptMessage(`[${alias}]: ${note}`, roomCode);
    await supabase.from('notes').insert([{ content: encrypted, room_code: roomCode }]);
    setNote('');
  };

  const initiateNuke = async () => {
    if (!confirm("CRITICAL: This will kick all users and delete all data. Proceed?")) return;
    await supabase.from('notes').delete().eq('room_code', roomCode);
  };

  return (
    <main className="main-viewport font-quicksand">
      <style jsx global>{`
        * { color: #ffffff; }
        .main-viewport { background-color: #050505; min-height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; font-family: 'Quicksand', sans-serif; }
        .glitch-fullscreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; opacity: 0.15; pointer-events: none; }
        .gemini-pill { background-color: #121212; border-radius: 32px; border: 1px solid #2d3748; width: 100%; max-width: 720px; padding: 12px; z-index: 10; }
        .stealth-textarea { background: transparent; border: none; outline: none; width: 100%; min-height: 80px; padding: 16px 24px; color: #ffffff; font-size: 1.1rem; resize: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4fd1c5; border-radius: 10px; }
      `}</style>

      <div className="glitch-fullscreen">
        <LetterGlitch glitchColors={['#2d3748', '#4fd1c5']} glitchSpeed={80} centerVignette={false} outerVignette={false} />
      </div>

      <div className="relative z-10 w-full max-w-[700px] flex flex-col items-center px-6">
        <AnimatePresence mode="wait">
          {!inRoom ? (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
              <Shield className="text-[#4fd1c5] mx-auto mb-6" size={60} />
              <h1 className="text-4xl font-bold mb-10 tracking-[0.2em] uppercase">FlashMsg Terminal</h1>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <input
                  type="text" placeholder="SET ALIAS" value={alias}
                  onChange={(e) => setAlias(e.target.value.toUpperCase())}
                  className="w-full py-4 bg-[#121212] border border-[#2d3748] rounded-full text-center tracking-widest font-bold text-xs outline-none focus:border-[#4fd1c5]"
                />

                <div className="flex gap-2">
                  <input
                    type="text" placeholder="6-CHAR CODE" value={roomCode} maxLength={6}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-4/5 py-4 bg-[#121212] border border-[#2d3748] rounded-full text-center tracking-[0.4em] font-bold text-lg outline-none focus:border-[#4fd1c5]"
                  />
                  <button onClick={handleJoinRoom} className="w-1/5 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700">
                    <SendHorizontal size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-2 my-2 opacity-30"><div className="h-[1px] bg-white w-full"></div><span className="text-[10px]">OR</span><div className="h-[1px] bg-white w-full"></div></div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-5 bg-white text-black rounded-full font-bold uppercase text-[11px] tracking-widest hover:bg-[#4fd1c5] transition-all"
                >
                  Create Ephemeral Space
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <header className="flex items-center justify-between mb-8 px-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4fd1c5]">Room: {roomCode}</span>
                  <div className="flex gap-2">
                    {activeUsers.map(u => (
                      <span key={u} className="text-[7px] bg-[#4fd1c5]/20 text-[#4fd1c5] px-2 py-0.5 rounded-full border border-[#4fd1c5]/30 font-bold uppercase tracking-tighter">● {u}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExit} className="p-2 rounded-full hover:bg-white/10 text-zinc-500"><LogOut size={18} /></button>
                  <button onClick={initiateNuke} className="px-6 py-2 rounded-full bg-red-600/20 border border-red-600/40 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                    <Zap size={14} /> Nuke
                  </button>
                </div>
              </header>

              <div ref={scrollRef} className="w-full max-h-[400px] overflow-y-auto mb-8 space-y-4 px-2 custom-scrollbar scroll-smooth">
                {messages.length === 0 ? (
                  <p className="text-center text-zinc-500 text-[9px] uppercase tracking-[0.4em] py-20 italic">LINE SECURED. AUTO-NUKE IN 60 MIN.</p>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={msg.id || i} className="p-5 bg-[#111111] border border-white/10 rounded-2xl shadow-xl">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-bold text-[#4fd1c5] uppercase tracking-widest flex items-center gap-2"><Terminal size={12} /> FRAGMENT</span>
                        <span className="text-[8px] text-zinc-500 font-mono italic">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-md text-white font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="gemini-pill">
                <textarea
                  ref={textareaRef} className="stealth-textarea" placeholder="Transmit fragment..."
                  value={note} onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postMessage(); } }}
                />
                <div className="flex items-center justify-between px-6 pb-2">
                  <div className="flex gap-4 text-zinc-500"><LockKeyhole size={18} className="opacity-40" /><span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-40">AES-256 E2EE</span></div>
                  <button onClick={postMessage} disabled={!note} className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-[#4fd1c5] transition-colors disabled:opacity-20">
                    <SendHorizontal size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}