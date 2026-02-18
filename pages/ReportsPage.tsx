
import React, { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Download, Brain, TrendingUp, Award, Zap, User, Shield, Target, Activity, FileText, Play, Link as LinkIcon, Clock, Crosshair, Goal, X as CloseIcon } from 'lucide-react';
import { getPerformanceSummary } from '../geminiService';
import { useGoalkeepers } from '../context/GoalkeeperContext';

const ReportsPage: React.FC = () => {
  const { keepers, scouts, evaluations } = useGoalkeepers();
  const [selectedKeeperId, setSelectedKeeperId] = useState<string>(keepers[0]?.id || '');
  const [summary, setSummary] = useState('Selecione um goleiro para iniciar a análise inteligente...');
  const [loadingAI, setLoadingAI] = useState(false);

  const selectedKeeper = useMemo(() => keepers.find(k => k.id === selectedKeeperId), [keepers, selectedKeeperId]);
  const keeperEvaluations = useMemo(() => evaluations.filter(e => e.goalkeeperId === selectedKeeperId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [evaluations, selectedKeeperId]);
  const keeperScouts = useMemo(() => scouts.filter(s => s.goalkeeperId === selectedKeeperId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [scouts, selectedKeeperId]);

  const radarData = useMemo(() => {
    const latest = keeperEvaluations[0];
    if (!latest) return [{ subject: 'Defensivo', A: 0, fullMark: 5 }, { subject: 'Ofensivo', A: 0, fullMark: 5 }, { subject: 'Tático', A: 0, fullMark: 5 }, { subject: 'Físico', A: 0, fullMark: 5 }, { subject: 'Comportamental', A: 0, fullMark: 5 }];
    const calcAvg = (obj: Record<string, number>) => {
      const vals = Object.values(obj);
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };
    return [
      { subject: 'Defensivo', A: calcAvg(latest.technicalDefensive), fullMark: 5 },
      { subject: 'Ofensivo', A: calcAvg(latest.technicalOffensive), fullMark: 5 },
      { subject: 'Tático', A: calcAvg(latest.tactical), fullMark: 5 },
      { subject: 'Físico', A: calcAvg(latest.physical), fullMark: 5 },
      { subject: 'Comportamental', A: calcAvg(latest.behavioral), fullMark: 5 },
    ];
  }, [keeperEvaluations]);

  const scoutStats = useMemo(() => {
    if (keeperScouts.length === 0) return { totalSaves: 0, goalsConceded: 0, cleanSheets: 0, avgSaves: 0, minutesPlayed: 0, games: 0, assists: 0, goalsScored: 0 };
    const totalSaves = keeperScouts.reduce((sum, s) => sum + (s.specialActions?.defesaBasica || 0) + (s.specialActions?.defesaDificil || 0) + (s.specialActions?.superSave || 0), 0);
    const cleanSheets = keeperScouts.filter(s => s.cleanSheet).length;
    const goalsConceded = keeperScouts.reduce((sum, s) => sum + Object.values(s.goalZones || {}).reduce((zsum, z) => zsum + (z.goals || 0), 0), 0);
    const minutesPlayed = keeperScouts.reduce((sum, s) => sum + (s.minutesPlayed || 0), 0);
    const assists = keeperScouts.reduce((sum, s) => sum + (s.assists || 0), 0);
    const goalsScored = keeperScouts.reduce((sum, s) => sum + (s.goalsScored || 0), 0);
    return { totalSaves, goalsConceded, cleanSheets, avgSaves: (totalSaves / (keeperScouts.length || 1)).toFixed(1), games: keeperScouts.length, minutesPlayed, assists, goalsScored };
  }, [keeperScouts]);

  const pitchGoalOriginData = useMemo(() => {
    const originMap: Record<number, number> = {};
    keeperScouts.forEach(s => Object.entries(s.pitchZones || {}).forEach(([zone, count]) => { originMap[parseInt(zone)] = (originMap[parseInt(zone)] || 0) + count; }));
    return originMap;
  }, [keeperScouts]);

  const goalMouthConcedeData = useMemo(() => {
    const concedeMap: Record<number, number> = {};
    keeperScouts.forEach(s => Object.entries(s.goalZones || {}).forEach(([zone, data]) => { concedeMap[parseInt(zone)] = (concedeMap[parseInt(zone)] || 0) + (data.goals || 0); }));
    return concedeMap;
  }, [keeperScouts]);

  const ranking = useMemo(() => keepers.map(k => {
    const kEvals = evaluations.filter(e => e.goalkeeperId === k.id);
    const latest = kEvals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    let score = 0;
    if (latest) {
      const allScores = [...Object.values(latest.technicalDefensive), ...Object.values(latest.technicalOffensive), ...Object.values(latest.tactical), ...Object.values(latest.physical), ...Object.values(latest.behavioral)];
      score = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    }
    return { id: k.id, name: k.name, category: k.category, score: parseFloat(score.toFixed(1)), photo: k.photo };
  }).sort((a, b) => b.score - a.score), [keepers, evaluations]);

  useEffect(() => {
    const fetchAI = async () => {
      if (!selectedKeeper) return;
      setLoadingAI(true);
      const res = await getPerformanceSummary(selectedKeeper.name, radarData, { totalSaves: scoutStats.totalSaves, cleanSheets: scoutStats.cleanSheets, totalGames: scoutStats.games });
      setSummary(res || 'Análise não disponível.');
      setLoadingAI(false);
    };
    if (selectedKeeperId) fetchAI();
  }, [selectedKeeperId, radarData, scoutStats]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Relatórios <span className="gold-text">Performance</span></h1>
          <p className="text-gray-400 mt-1 uppercase text-[10px] font-black tracking-widest">Análise profissional de formação de goleiros</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl focus-within:border-gold transition-colors">
            <User size={16} className="gold-text" />
            <select value={selectedKeeperId} onChange={(e) => setSelectedKeeperId(e.target.value)} className="bg-transparent text-xs font-black text-white uppercase outline-none cursor-pointer pr-4">
              {keepers.map(k => (<option key={k.id} value={k.id} className="bg-black">{k.name} ({k.category})</option>))}
            </select>
          </div>
          <button className="bg-gray-900 text-gray-400 font-black px-6 py-2.5 rounded-xl border border-gray-800 text-[10px] uppercase tracking-widest hover:text-white transition-all"><Download size={16} /> PDF</button>
        </div>
      </div>

      {selectedKeeper ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 relative z-10"><Brain className="gold-text group-hover:scale-110 transition-transform" size={20} /><h2 className="text-sm font-bold text-white uppercase">GK AI Insights</h2></div>
                    <div className={`p-4 bg-black/40 border border-gray-800 rounded-2xl min-h-[100px] relative z-10 ${loadingAI ? 'opacity-50' : 'opacity-100'}`}><p className="text-gray-300 italic text-xs leading-relaxed">"{summary}"</p></div>
                </div>
                <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 mb-2"><Clock className="text-blue-500" size={20} /><h2 className="text-sm font-bold text-white uppercase">Dados Consolidados</h2></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-black/40 border border-gray-800 rounded-xl"><p className="text-[9px] font-black text-gray-500 uppercase">Minutos</p><p className="text-lg font-black text-blue-500">{scoutStats.minutesPlayed}</p></div>
                      <div className="p-3 bg-black/40 border border-gray-800 rounded-xl"><p className="text-[9px] font-black text-gray-500 uppercase">Partidas</p><p className="text-lg font-black text-white">{scoutStats.games}</p></div>
                      <div className="p-3 bg-black/40 border border-gray-800 rounded-xl"><p className="text-[9px] font-black text-gray-500 uppercase">Assistências</p><p className="text-lg font-black text-blue-400">{scoutStats.assists}</p></div>
                      <div className="p-3 bg-black/40 border border-gray-800 rounded-xl"><p className="text-[9px] font-black text-gray-500 uppercase">Gols Atleta</p><p className="text-lg font-black text-gold">{scoutStats.goalsScored}</p></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4"><Crosshair className="text-red-500" size={18} /><h2 className="text-sm font-black text-white uppercase">Zona de Finalizações (Gols)</h2></div>
                    <div className="relative bg-[#050c05] border-2 border-green-950/40 p-2 rounded-2xl shadow-inner aspect-[16/10] overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 60">
                        <rect x="0" y="0" width="100" height="60" fill="none" stroke="#22c55e" strokeWidth="0.4" />
                        <rect x="25" y="0" width="50" height="15" fill="none" stroke="#22c55e" strokeWidth="0.4" />
                        <rect x="38" y="0" width="24" height="6" fill="none" stroke="#22c55e" strokeWidth="0.4" />
                        <rect x="42" y="-0.5" width="16" height="1" fill="#fff" fillOpacity="0.4" />
                        <circle cx="50" cy="11" r="0.4" fill="#22c55e" />
                        <path d="M 40 15 A 10 10 0 0 0 60 15" fill="none" stroke="#22c55e" strokeWidth="0.4" />
                        <line x1="0" y1="58" x2="100" y2="58" stroke="#22c55e" strokeWidth="0.5" />
                        <path d="M 40 58 A 10 10 0 0 1 60 58" fill="none" stroke="#22c55e" strokeWidth="0.5" />
                      </svg>
                      <div className="relative h-full grid grid-cols-5 grid-rows-[1fr_1fr_0.8fr] gap-1 z-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((z) => {
                          const count = pitchGoalOriginData[z] || 0;
                          return (
                            <div key={`pz-${z}`} className={`relative flex items-center justify-center border transition-all rounded-lg ${count > 0 ? 'bg-red-600/30 border-red-500/50 text-white' : 'bg-white/5 border-white/5 text-gray-800/10'}`}>
                              <span className="text-[6px] absolute top-0.5 left-1 tracking-tighter uppercase text-gray-600">Z{z}</span>
                              {count > 0 && <span className="text-xl font-black">{count}</span>}
                            </div>
                          );
                        })}
                        <div className={`col-span-5 relative flex items-center justify-center border transition-all rounded-lg ${pitchGoalOriginData[11] > 0 ? 'bg-red-600/30 border-red-500/50 text-white' : 'bg-white/5 border-white/5 text-gray-800/10'}`}>
                          <span className="text-[6px] absolute top-0.5 left-1 tracking-tighter uppercase text-gray-600">Z11</span>
                          {pitchGoalOriginData[11] > 0 && <span className="text-2xl font-black">{pitchGoalOriginData[11]}</span>}
                        </div>
                      </div>
                    </div>
                </div>
                <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4"><Goal className="gold-text" size={18} /><h2 className="text-sm font-black text-white uppercase">Mapa da Baliza (Gols Sofridos)</h2></div>
                    <div className="bg-[#030308] border-2 border-blue-950/30 p-1.5 rounded-2xl shadow-inner aspect-[16/10] grid grid-cols-3 grid-rows-3 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((zone) => {
                            const count = goalMouthConcedeData[zone] || 0;
                            return (
                                <div key={`gz-${zone}`} className={`relative flex items-center justify-center border-2 border-white/5 rounded-xl transition-all ${count > 0 ? 'bg-red-600/40 text-white font-black' : 'bg-black/20'}`}>
                                    <span className="text-[6px] absolute top-0.5 left-1/2 -translate-x-1/2 text-gray-800">{zone}</span>
                                    {count > 0 && <span className="text-white text-3xl font-black drop-shadow-lg">{count}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6"><TrendingUp className="gold-text" size={18} /><h2 className="text-sm font-black text-white uppercase">Radar de Proficiência</h2></div>
                <div className="h-[280px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#333" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 800 }} />
                      <Radar name={selectedKeeper.name} dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.5} strokeWidth={2} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 mb-6"><Activity className="gold-text" size={18} /><h2 className="text-sm font-black text-white uppercase">KPIs Consolidados</h2></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-black border border-gray-800 rounded-2xl"><p className="text-[9px] text-gray-500 font-black uppercase mb-1">Média Defesas</p><p className="text-2xl font-black text-white">{scoutStats.avgSaves}</p></div>
                    <div className="p-4 bg-black border border-gray-800 rounded-2xl"><p className="text-[9px] text-gray-500 font-black uppercase mb-1">Clean Sheets</p><p className="text-2xl font-black text-blue-500">{scoutStats.cleanSheets}</p></div>
                    <div className="p-4 bg-black border border-gray-800 rounded-2xl"><p className="text-[9px] text-gray-500 font-black uppercase mb-1">Gols Sofridos</p><p className="text-2xl font-black text-red-500">{scoutStats.goalsConceded}</p></div>
                    <div className="p-4 bg-black border border-gray-800 rounded-2xl"><p className="text-[9px] text-gray-500 font-black uppercase mb-1">Partidas</p><p className="text-2xl font-black text-gray-300">{scoutStats.games}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-2xl">
               <h2 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-6"><Award className="gold-text" size={18} /> Ranking Geral</h2>
               <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {ranking.map((k, i) => (
                    <div key={k.id} onClick={() => setSelectedKeeperId(k.id)} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer ${selectedKeeperId === k.id ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5' : 'bg-black border-gray-800 hover:border-gray-700'}`}>
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-black text-gray-600 shrink-0 border border-gray-800">{i + 1}</div>
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shrink-0">{k.photo ? <img src={k.photo} alt={k.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gold font-bold">{k.name.charAt(0)}</div>}</div>
                      <div className="flex-1 min-w-0"><p className={`text-xs font-bold truncate ${selectedKeeperId === k.id ? 'text-white' : 'text-gray-400'}`}>{k.name}</p><p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">{k.category}</p></div>
                      <div className="text-right"><p className={`text-sm font-black ${k.score >= 4 ? 'text-green-500' : k.score >= 3 ? 'gold-text' : 'text-gray-500'}`}>{k.score}</p></div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;
