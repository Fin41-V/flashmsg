'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, activity, Zap, DollarSign, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total: 0, recent: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { count } = await supabase.from('notes').select('*', { count: 'exact', head: true });
            setStats(prev => ({ ...prev, total: count }));
        };
        fetchStats();
    }, []);

    return (
        <div className="flex h-screen bg-[#313338] text-white p-8">
            <div className="w-full max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="p-3 bg-blurple rounded-xl shadow-lg shadow-blurple/20">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Command Center</h1>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">System Administrator Access Only</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Ghosts Card */}
                    <div className="pro-card p-6 border-l-4 border-blurple">
                        <div className="flex justify-between items-start mb-4 text-zinc-500">
                            <Zap size={20} />
                            <span className="text-[10px] font-bold uppercase">Active Links</span>
                        </div>
                        <div className="text-4xl font-black">{stats.total}</div>
                        <p className="text-xs text-zinc-500 mt-2 italic">Ghosts currently in the void</p>
                    </div>

                    {/* Revenue Card */}
                    <div className="pro-card p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-4 text-zinc-500">
                            <DollarSign size={20} />
                            <span className="text-[10px] font-bold uppercase">Monthly Revenue</span>
                        </div>
                        <div className="text-4xl font-black">$0.00</div>
                        <p className="text-xs text-zinc-500 mt-2 italic">Upgrade to Stripe Pro to track</p>
                    </div>

                    {/* System Status */}
                    <div className="pro-card p-6 border-l-4 border-zinc-500">
                        <div className="flex justify-between items-start mb-4 text-zinc-500">
                            <Trash2 size={20} />
                            <span className="text-[10px] font-bold uppercase">Janitor Status</span>
                        </div>
                        <div className="text-sm font-bold text-green-500 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            CLEANING ACTIVE
                        </div>
                        <p className="text-xs text-zinc-500 mt-4 italic">Next purge: Midnight UTC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}