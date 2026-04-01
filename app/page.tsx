'use client'
import { useEffect, useState } from "react";
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const typeColors: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export default function Home() {
  const [types, setTypes] = useState<any[]>([]);
  const [type1, setType1] = useState('');
  const [type2, setType2] = useState('');
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Types for Dropdowns on Mount
  useEffect(() => {
    async function getTypes() {
      const { data } = await supabase.from('types').select('*').order('id');
      if (data) setTypes(data);
    }
    getTypes();
  }, []);

  // 2. The Core Calculation Logic
  const checkWeaknesses = async () => {
    if (!type1) return alert("Select at least the first type!");
    setLoading(true);

    const activeTypes = type2 ? [type1, type2] : [type1];
    
    const { data, error } = await supabase
      .from('type_interactions')
      .select('attacker_id, multiplier, attacker:types!attacker_id(name)')
      .in('defender_id', activeTypes) as any;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Combine multipliers
    const effectiveness: Record<string, number> = {};
    // Initialize all types to 1x first (so we see neutral hits too if we want)
    types.forEach(t => effectiveness[t.name] = 1);

    data.forEach((row: { attacker: { name: any; }; multiplier: number; }) => {
      const name = row.attacker.name;
      effectiveness[name] *= row.multiplier;
    });

    setResults(effectiveness);
    setLoading(false);
  };

  return (
  <div className="min-h-screen bg-slate-50 text-slate-900 p-4 pb-12 font-sans selection:bg-blue-100">
    <div className="max-w-md mx-auto">
      
      {/* --- HEADER --- */}
      <header className="pt-12 pb-10 text-center flex flex-col items-center relative overflow-hidden">
        {/* The Scanline Overlay - Pure CSS magic */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50" 
            style={{ 
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 4px, 3px 100%' 
            }}>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {/* Pixel Fire */}
          <div className="drop-shadow-[0_2px_0_rgba(0,0,0,0.1)]">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7" y="2" width="2" height="2" fill="#000" />
              <rect x="5" y="4" width="6" height="2" fill="#000" />
              <rect x="3" y="6" width="10" height="8" fill="#000" />
              <rect x="5" y="14" width="6" height="2" fill="#000" />
              <rect x="7" y="4" width="2" height="2" fill="#F08030" />
              <rect x="5" y="6" width="6" height="6" fill="#F08030" />
              <rect x="4" y="8" width="8" height="4" fill="#F08030" />
              <rect x="7" y="8" width="2" height="4" fill="#F8D030" />
              <rect x="6" y="10" width="4" height="2" fill="#F8D030" />
            </svg>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
            PokéAgainst
          </h1>

          {/* Pixel Water */}
          <div className="drop-shadow-[0_2px_0_rgba(0,0,0,0.1)]">
            <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="7" y="2" width="2" height="2" fill="#000" />
              <rect x="6" y="4" width="4" height="2" fill="#000" />
              <rect x="5" y="6" width="6" height="2" fill="#000" />
              <rect x="4" y="8" width="8" height="6" fill="#000" />
              <rect x="6" y="14" width="4" height="2" fill="#000" />
              <rect x="7" y="4" width="2" height="2" fill="#6890F0" />
              <rect x="6" y="6" width="4" height="2" fill="#6890F0" />
              <rect x="5" y="8" width="6" height="6" fill="#6890F0" />
              <rect x="6" y="9" width="2" height="2" fill="#C0D0F0" />
            </svg>
          </div>
        </div>
        
        <p className="text-slate-400 text-[16px] mt-3 relative z-10">
          Introduce up to 2 Pokémon types to see their weaknesses and resistances!
        </p>
      </header>

      {/* --- INPUT CARD --- */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <div className="space-y-5 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Primary</span>
            <select 
              className="w-full mt-1 p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
              onChange={(e) => setType1(e.target.value)}
            >
              <option value="">Select Type</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secondary</span>
            <select 
              className="w-full mt-1 p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
              onChange={(e) => setType2(e.target.value)}
            >
              <option value="">NONE</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        
        <button 
          onClick={checkWeaknesses}
          disabled={loading}
          className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          {loading ? 'Checking...' : 'Analyze'}
        </button>
      </div>

      {/* --- RESULTS --- */}
      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* WEAKNESSES */}
          <section>
            <h2 className="text-slate-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-4 px-1">Weaknesses</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(results).filter(([_, v]) => v > 1).map(([name, v]) => (
                <div key={name} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-700" style={{ color: typeColors[name.toLowerCase()] }}>
                    {name.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${v >= 4 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {v}x
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* RESISTANCES */}
          <section>
            <h2 className="text-slate-400 text-[11px] font-bold tracking-[0.2em] uppercase mb-4 px-1">Resistances</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(results).filter(([_, v]) => v < 1).map(([name, v]) => (
                <div key={name} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-xs font-bold text-slate-700" style={{ color: typeColors[name.toLowerCase()] }}>
                    {name.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                    {v === 0 ? 'IMMUNE' : `${v}x`}
                  </span>
                </div>
              ))}
            </div>
          </section>
          
        </div>
      )}
    </div>

    {/* --- FLOATING FOOTER DOCK --- */}
<footer className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-lg shadow-slate-200/50 flex items-center gap-8">
      
      {/* GitHub Link */}
      <a 
        href="https://github.com/volmosg/poke-against" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex flex-col items-center gap-1 transition-all active:scale-90"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-900 transition-colors">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-slate-900">Github repo</span>
      </a>

      {/* Vertical Divider */}
      <div className="h-4 w-[1px] bg-slate-200"></div>

        {/* Ko-fi Link */}
        <a 
          href="https://ko-fi.com/volmosg" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-1 transition-all active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-rose-500 transition-colors">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-rose-500">Support</span>
        </a>

      </div>
    </footer>
  </div>
);
}