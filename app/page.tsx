'use client'
import { useEffect, useState } from "react";
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      .in('defender_id', activeTypes);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Combine multipliers
    const effectiveness: Record<string, number> = {};
    // Initialize all types to 1x first (so we see neutral hits too if we want)
    types.forEach(t => effectiveness[t.name] = 1);

    data.forEach((row) => {
      const name = Array.isArray(row.attacker) ? row.attacker[0].name : row.attacker.name;
      effectiveness[name] *= row.multiplier;
    });

    setResults(effectiveness);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-red-600">PokéAgainst</h1>
      <div>
        <p>Introduce up to two Pokémon types to check their effectiveness!</p>
      </div>

      {/* --- INPUT SECTION --- */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold mb-1">Primary Type</label>
            <select 
              className="w-full p-2 border rounded bg-white"
              onChange={(e) => setType1(e.target.value)}
            >
              <option value="">Select Type</option>
              {/*String(val).charAt(0).toUpperCase() + String(val).slice(1)*/}
              {types.map(t => <option key={t.id} value={t.id}>{t.name.charAt(0).toUpperCase() + t.name.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Secondary Type (Optional)</label>
            <select 
              className="w-full p-2 border rounded bg-white"
              onChange={(e) => setType2(e.target.value)}
            >
              <option value="">None</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name.charAt(0).toUpperCase() + t.name.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={checkWeaknesses}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Analyzing...' : 'Check Weaknesses'}
        </button>
      </div>

      {/* --- RESULTS SECTION --- */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weaknesses */}
          <div className="border p-4 rounded-lg border-red-200 bg-red-50">
            <h2 className="font-bold text-red-700 mb-2 underline text-lg">Weaknesses (Take More Damage)</h2>
            {Object.entries(results).filter(([_, v]) => v > 1).map(([name, v]) => (
              <div key={name} className="flex justify-between py-1 border-b border-red-100 last:border-0">
                <span className="font-medium">{name}</span>
                <span className={`font-bold ${v >= 4 ? 'text-red-600' : 'text-orange-600'}`}>{v}x</span>
              </div>
            ))}
          </div>

          {/* Resistances & Immunities */}
          <div className="border p-4 rounded-lg border-green-200 bg-green-50">
            <h2 className="font-bold text-green-700 mb-2 underline text-lg">Strengths (Take Less Damage)</h2>
            {Object.entries(results).filter(([_, v]) => v < 1).map(([name, v]) => (
              <div key={name} className="flex justify-between py-1 border-b border-green-100 last:border-0">
                <span className="font-medium">{name}</span>
                <span className="font-bold text-green-600">{v === 0 ? 'IMMUNE' : `${v}x`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}