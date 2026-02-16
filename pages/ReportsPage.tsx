
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Download, Brain, TrendingUp, Award, Zap, User, Shield, Target, Activity, FileText, Play, Link as LinkIcon } from 'lucide-react';
import { getPerformanceSummary } from '../geminiService';
import { useGoalkeepers } from '../context/GoalkeeperContext';

const ReportsPage: React.FC = () => {
  const { keepers, scouts, evaluations } = useGoalkeepers();
  const [selectedKeeperId, setSelectedKeeperId] = useState<string>(keepers[0]?.id || '');
  const [summary, setSummary] = useState('Selecione um goleiro para iniciar a análise inteligente...');
  const [loadingAI, setLoadingAI] = useState(false);

  const selectedKeeper = useMemo(() => 
    keepers.find(k => k.id === selectedKeeperId), 
    [keepers, selectedKeeperId]
  );

  const keeperEvaluations = useMemo(() => 
    evaluations.filter(e => e.goalkeeperId === selectedKeeperId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [evaluations, selectedKeeperId]
  );

  const keeperScouts = useMemo(() => 
    scouts.filter(s => s.goalkeeperId === selectedKeeperId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [scouts, selectedKeeperId]
  );

  // Radar Data based on the latest evaluation
  const radarData = useMemo(() => {
    const latest = keeperEvaluations[0];
    if (!latest) return [
      { subject: 'Defensivo', A: 0, fullMark: 5 },
      { subject: 'Ofensivo', A: 0, fullMark: 5 },
      { subject: 'Tático', A: 0, fullMark: 5 },
      { subject: 'Físico', A: 0, fullMark: 5 },
      { subject: 'Comportamental', A: 0, fullMark: 5 },
    ];

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

  // Aggregate Scout Metrics
  const scoutStats = useMemo(() => {
    if (keeperScouts.length === 0) return { totalSaves: 0, goalsConceded: 0, cleanSheets: 0, avgSaves: 0 };
    
    const totalSaves = keeperScouts.reduce((sum, s) => 
      sum + (s.specialActions?.defesaBasica || 0) + (s.specialActions?.defesaDificil || 0) + (s.specialActions?.superSave || 0), 0);
    const cleanSheets = keeperScouts.filter(s => s.cleanSheet).length;
    
    // In our logic, each scout is 1 game. If not clean sheet, assume at least 1 goal for stats
    const goalsConceded = keeperScouts.reduce((sum, s) => sum + (s.cleanSheet ? 0 : 1), 0);

    return {
      totalSaves,
      goalsConceded,
      cleanSheets,
      avgSaves: (totalSaves / keeperScouts.length).toFixed(1),
      games: keeperScouts.length
    };
  }, [keeperScouts]);

  // Ranking calculation
  const ranking = useMemo(() => {
    return keepers.map(k => {
      const kEvals = evaluations.filter(e => e.goalkeeperId === k.id);
      const latest = kEvals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      let score = 0;
      if (latest) {
        const allScores = [
          ...Object.values(latest.technicalDefensive),
          ...Object.values(latest.technicalOffensive),
          ...Object.values(latest.tactical),
          ...Object.values(latest.physical),
          ...Object.values(latest.behavioral),
        ];
        score = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
      }
      
      return {
        id: k.id,
        name: k.name,
        category: k.category,
        score: parseFloat(score.toFixed(1)),
        photo: k.photo
      };
    }).sort((a, b) => b.score - a.score);
  }, [keepers, evaluations]);

  useEffect(() => {
    const fetchAI = async () => {
      if (!selectedKeeper) return;
      setLoadingAI(true);
      const res = await getPerformanceSummary(
        selectedKeeper.name, 
        radarData, 
        { 
          totalSaves: scoutStats.totalSaves, 
          cleanSheets: scoutStats.cleanSheets,
          totalGames: scoutStats.games 
        }
      );
      setSummary(res || 'Não foi possível gerar a análise.');
      setLoadingAI(false);
    };
    if (selectedKeeperId) fetchAI();
  }, [selectedKeeperId, radarData, scoutStats]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Header & Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Relatórios <span className="gold-text">Performance</span></h1>
          <p className="text-gray-400 mt-1">Análise baseada em dados reais de treino e scout</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl focus-within:border-gold transition-all shadow-inner">
            <User size={16} className="gold-text" />
            <select 
              value={selectedKeeperId}
              onChange={(e) => setSelectedKeeperId(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase outline-none cursor-pointer pr-4"
            >
              <option value="" disabled className="bg-black">Selecione o Goleiro</option>
              {keepers.map(k => (
                <option key={k.id} value={k.id} className="bg-black">{k.name} ({k.category})</option>
              ))}
            </select>
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-gray-900 text-gray-400 font-black px-6 py-2.5 rounded-xl border border-gray-800 hover:text-white hover:border-gray-600 transition-all shadow-lg text-[10px] uppercase tracking-widest">
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>

      {selectedKeeper ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Analytics Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Insights Panel */}
            <div className="bg-card border border-gray-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-gold/10 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gold/20 border border-gold/30">
                    <Brain className="gold-text" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tighter uppercase">GK AI Insights</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Análise baseada no histórico longitudinal</p>
                  </div>
                </div>
                {loadingAI && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                    <span className="text-[9px] font-black text-gold uppercase">Processando</span>
                  </div>
                )}
              </div>

              <div className={`p-6 bg-black/40 border border-gray-800 rounded-2xl relative z-10 min-h-[120px] transition-opacity ${loadingAI ? 'opacity-50' : 'opacity-100'}`}>
                <p className="text-gray-300 leading-relaxed italic text-sm">
                  "{summary}"
                </p>
                {!loadingAI && summary !== 'Não foi possível gerar a análise.' && (
                  <div className="mt-6 flex flex-wrap gap-4">
                     <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-lg border border-green-500/20">
                       <Shield size={12} className="text-green-500" />
                       <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Status: Evolução Positiva</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                       <Zap size={12} className="text-blue-500" />
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Foco: Reação de Campo</span>
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radar Chart Section */}
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="gold-text" size={18} />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Perfil Multidisciplinar</h2>
                </div>
                <div className="h-[320px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar
                        name={selectedKeeper.name}
                        dataKey="A"
                        stroke="#D4AF37"
                        fill="#D4AF37"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                         itemStyle={{ color: '#D4AF37' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Media & Resources Section */}
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <LinkIcon className="gold-text" size={18} />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Mídias e Recursos</h2>
                </div>
                
                <div className="space-y-4 flex-1">
                  {keeperEvaluations[0] ? (
                    <>
                      <div className="p-4 bg-black border border-gray-800 rounded-2xl group hover:border-gold/50 transition-all">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-3">Últimos Melhores Momentos</p>
                        {keeperEvaluations[0].highlightsLink ? (
                          <a 
                            href={keeperEvaluations[0].highlightsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gold/10 border border-gold/30 rounded-xl text-gold group-hover:bg-gold/20 transition-all"
                          >
                            <span className="text-xs font-black uppercase">Assistir Clipe</span>
                            <Play size={16} />
                          </a>
                        ) : (
                          <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-600 italic text-[10px]">Nenhum link cadastrado</div>
                        )}
                      </div>

                      <div className="p-4 bg-black border border-gray-800 rounded-2xl group hover:border-blue-500/50 transition-all">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-3">Plano de Melhoria</p>
                        {keeperEvaluations[0].improvementsLink ? (
                          <a 
                            href={keeperEvaluations[0].improvementsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-500 group-hover:bg-blue-500/20 transition-all"
                          >
                            <span className="text-xs font-black uppercase">Ver Diretrizes</span>
                            <Zap size={16} />
                          </a>
                        ) : (
                          <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-gray-600 italic text-[10px]">Nenhum recurso cadastrado</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-700 opacity-50">
                       <LinkIcon size={32} className="mb-2" />
                       <p className="text-[10px] font-black uppercase">Sem avaliações recentes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Scout Aggregates Section */}
            <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Target className="gold-text" size={18} />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Resumo de Temporada</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-black border border-gray-800 rounded-2xl relative overflow-hidden group">
                  <div className="absolute right-0 bottom-0 opacity-5 -rotate-12 translate-x-2 translate-y-2">
                     <Shield size={80} className="text-gold" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Volume Defensivo</p>
                  <div className="flex items-end justify-between">
                     <div>
                       <p className="text-4xl font-black text-white">{scoutStats.totalSaves}</p>
                       <p className="text-[9px] gold-text font-black uppercase">Defesas Totais</p>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-black border border-gray-800 rounded-2xl relative overflow-hidden group">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Segurança</p>
                  <div className="flex items-end justify-between">
                     <div>
                       <p className="text-4xl font-black text-blue-500">{scoutStats.cleanSheets}</p>
                       <p className="text-[9px] text-blue-400 font-black uppercase">Jogos sem Vazamento</p>
                     </div>
                  </div>
                </div>

                <div className="p-6 bg-black border border-gray-800 rounded-2xl relative overflow-hidden group">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Constância Técnica</p>
                  <div className="flex items-end justify-between">
                     <div>
                       <p className="text-4xl font-black text-white">{scoutStats.avgSaves}</p>
                       <p className="text-[9px] text-gray-500 font-black uppercase">Média Defesa/Jogo</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ranking & Highlights */}
          <div className="lg:col-span-4 space-y-8">
             {/* Ranking Card */}
             <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-2xl">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                   <Award className="gold-text" size={18} /> Ranking Geral
                 </h2>
                 <span className="text-[9px] text-gray-500 font-bold uppercase">Base: Média Evals</span>
               </div>
               
               <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {ranking.map((k, i) => (
                    <div 
                      key={k.id} 
                      onClick={() => setSelectedKeeperId(k.id)}
                      className={`
                        flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer
                        ${selectedKeeperId === k.id 
                          ? 'bg-gold/10 border-gold/50 shadow-lg shadow-gold/5' 
                          : 'bg-black border-gray-800 hover:border-gray-700'}
                      `}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-black text-gray-600 shrink-0 border border-gray-800">
                        {i + 1}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shrink-0">
                         {k.photo ? (
                           <img src={k.photo} alt={k.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gold font-bold">{k.name.charAt(0)}</div>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${selectedKeeperId === k.id ? 'text-white' : 'text-gray-400'}`}>{k.name}</p>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">{k.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${k.score >= 4 ? 'text-green-500' : k.score >= 3 ? 'gold-text' : 'text-gray-500'}`}>{k.score}</p>
                        <p className="text-[8px] text-gray-700 font-bold uppercase">Nota</p>
                      </div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Dynamic Performance Badge */}
             <div className="bg-gradient-to-br from-gold to-yellow-600 rounded-3xl p-8 text-black shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform">
                   <Award size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                     <Activity size={24} className="animate-pulse" />
                     <h2 className="text-xl font-black uppercase tracking-tighter italic">Elite Tracker</h2>
                  </div>
                  <p className="text-sm font-bold opacity-80 mb-6 leading-tight">
                    {selectedKeeper.name} atingiu {(radarData.reduce((a, b) => a + b.A, 0) / 5).toFixed(1)} de média técnica no último microciclo.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-black/5">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Evolução</p>
                      <p className="text-xl font-black">+14%</p>
                    </div>
                    <div className="bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-black/5">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Frequência</p>
                      <p className="text-xl font-black">100%</p>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
                    <FileText size={16} /> Ver Analytics Detalhado
                  </button>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-800 rounded-[40px]">
           <User size={64} className="text-gray-800 mb-6" />
           <h2 className="text-xl font-black text-gray-600 uppercase tracking-widest">Nenhum Goleiro Selecionado</h2>
           <p className="text-gray-500 text-sm mt-2 max-w-sm">Selecione um atleta no menu superior para visualizar os relatórios técnicos e de scout integrados.</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;