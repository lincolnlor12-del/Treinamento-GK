
import React, { useState, useMemo } from 'react';
import { Target, Shield, Zap, Save, Trophy, User, Check, Minus, Plus, Map, Goal, X as CloseIcon, FileText, Download, History, ChevronDown, ChevronUp, Trash2, ShieldX, ShieldAlert, Crosshair, Clock, UserPlus, AlertCircle, Star } from 'lucide-react';
import { useGoalkeepers } from '../context/GoalkeeperContext';
import { MatchScout } from '../types';

const SCOUT_METRICS = [
  { label: 'Punho', id: 'punho' },
  { label: 'Encaixe', id: 'encaixe' },
  { label: 'Entrada', id: 'entrada' },
  { label: 'Entrada Completa', id: 'entradaCompleta' },
  { label: 'Queda Rasteira', id: 'quedaRasteira' },
  { label: 'Queda Meia Altura', id: 'quedaMeiaAltura' },
  { label: 'Queda Alta', id: 'quedaAlta' },
  { label: 'Queda Mão Trocada', id: 'quedaMaoTrocada' },
  { label: 'Saída Rasteira', id: 'saidaRasteira' },
  { label: 'Enfrentamentos', id: 'enfrentamentos' },
  { label: 'Saída Alta', id: 'saidaAlta' },
  { label: 'Saída Alta Direcionada', id: 'saidaAltaDirecionada' },
  { label: 'Coberturas', id: 'coberturas' },
  { label: 'Bola Ao Chão', id: 'bolaAoChao' },
  { label: 'Tiro de Meta', id: 'tiroDeMeta' },
  { label: 'Reposição de Mão', id: 'reposicaoMao' },
  { label: 'Reposição Voleio', id: 'reposicaoVoleio' },
  { label: 'Passe Circulação', id: 'passeCirculacao' },
  { label: 'Passe Ruptura', id: 'passeRuptura' },
  { label: 'Lançamento', id: 'lancamento' },
];

const ScoutPage: React.FC = () => {
  const { keepers, scouts, addScout, deleteScout } = useGoalkeepers();
  const [showHistory, setShowHistory] = useState(false);
  
  const [titularId, setTitularId] = useState('');
  const [reservaId, setReservaId] = useState('');
  const [scoutingRole, setScoutingRole] = useState<'Titular' | 'Reserva'>('Titular');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [minutesPlayed, setMinutesPlayed] = useState<number>(90);
  const [cleanSheet, setCleanSheet] = useState(false);
  
  const [actions, setActions] = useState<Record<string, { pos: number, neg: number }>>(
    SCOUT_METRICS.reduce((acc, m) => ({ ...acc, [m.id]: { pos: 0, neg: 0 } }), {})
  );

  const [specialActions, setSpecialActions] = useState({
    defesaBasica: 0,
    defesaDificil: 0,
    superSave: 0,
    erroCritico: 0
  });

  const [penalties, setPenalties] = useState({ pos: 0, neg: 0 });
  const [offensiveStats, setOffensiveStats] = useState({ assists: 0, goals: 0 });

  const [pitchZones, setPitchZones] = useState<Record<number, number>>({});
  const [goalZones, setGoalZones] = useState<Record<number, { saves: number, goals: number }>>({});

  const activeKeeperId = useMemo(() => scoutingRole === 'Titular' ? titularId : reservaId, [scoutingRole, titularId, reservaId]);
  const keeperScouts = useMemo(() => scouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [scouts]);

  const handleActionChange = (id: string, type: 'pos' | 'neg', delta: number) => {
    setActions(prev => ({ ...prev, [id]: { ...prev[id], [type]: Math.max(0, prev[id][type] + delta) } }));
  };

  const handleSpecialAction = (id: keyof typeof specialActions, delta: number) => {
    setSpecialActions(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
  };

  const handlePenaltyChange = (type: 'pos' | 'neg', delta: number) => {
    setPenalties(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const handleOffensiveChange = (type: 'assists' | 'goals', delta: number) => {
    setOffensiveStats(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  const handlePitchZoneClick = (zoneId: number, delta: number = 1) => {
    setPitchZones(prev => ({ ...prev, [zoneId]: Math.max(0, (prev[zoneId] || 0) + delta) }));
  };

  const handleClearPitchZone = (zoneId: number) => {
    setPitchZones(prev => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  };

  const handleGoalZoneAction = (zoneId: number, type: 'saves' | 'goals', delta: number = 1) => {
    setGoalZones(prev => {
      const current = prev[zoneId] || { saves: 0, goals: 0 };
      return { ...prev, [zoneId]: { ...current, [type]: Math.max(0, current[type] + delta) } };
    });
  };

  const handleClearGoalZone = (zoneId: number) => {
    setGoalZones(prev => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  };

  const handleSaveScout = () => {
    if (!activeKeeperId) { alert("ERRO: Selecione o goleiro antes de salvar."); return; }
    if (!opponent.trim()) { alert("ERRO: Informe o nome do Adversário."); return; }

    const newScout: MatchScout = {
      id: Math.random().toString(36).substr(2, 9),
      goalkeeperId: activeKeeperId,
      opponent, date, competition: '', result: '',
      minutesPlayed: Number(minutesPlayed) || 0,
      matchPosition: scoutingRole,
      cleanSheet, 
      goalParticipation: offensiveStats.assists > 0 || offensiveStats.goals > 0,
      assists: offensiveStats.assists,
      goalsScored: offensiveStats.goals,
      penalties: { ...penalties },
      actions: JSON.parse(JSON.stringify(actions)),
      specialActions: { ...specialActions },
      pitchZones: { ...pitchZones },
      goalZones: JSON.parse(JSON.stringify(goalZones))
    };

    addScout(newScout);
    alert(`Scout de ${scoutingRole} salvo com sucesso!`);
    resetForm();
  };

  const resetForm = () => {
    setActions(SCOUT_METRICS.reduce((acc, m) => ({ ...acc, [m.id]: { pos: 0, neg: 0 } }), {}));
    setSpecialActions({ defesaBasica: 0, defesaDificil: 0, superSave: 0, erroCritico: 0 });
    setPenalties({ pos: 0, neg: 0 });
    setOffensiveStats({ assists: 0, goals: 0 });
    setPitchZones({}); setGoalZones({}); setCleanSheet(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">GK PERFORMANCE PRO – <span className="gold-text">SCOUT</span></h1>
          <p className="text-gray-400 mt-1 uppercase text-[10px] font-black tracking-widest">Análise profissional de formação de goleiros</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-gray-400 font-black px-6 py-3 rounded-xl hover:text-white transition-all uppercase text-xs">
            <History size={18} /> {showHistory ? 'Voltar para Lançamento' : 'Histórico de Scouts'}
          </button>
          {!showHistory && (
            <button onClick={handleSaveScout} className="flex items-center justify-center gap-2 gold-gradient text-black font-black px-10 py-4 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase text-xs tracking-widest">
              <Save size={20} /> Salvar Relatório {scoutingRole}
            </button>
          )}
        </div>
      </div>

      {!showHistory ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Dados e Participação */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl sticky top-20">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Trophy size={14} className="gold-text" /> Escalação e Partida</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className={`block text-[10px] font-black uppercase mb-2 ${scoutingRole === 'Titular' ? 'gold-text' : 'text-gray-500'}`}>Titular</label>
                      <select value={titularId} onChange={(e) => setTitularId(e.target.value)} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold">
                        <option value="">Selecione...</option>
                        {keepers.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="bg-black/60 p-1.5 rounded-2xl border border-gray-800 flex items-center gap-1.5 shadow-inner">
                     <button onClick={() => setScoutingRole('Titular')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${scoutingRole === 'Titular' ? 'bg-gold text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                       <Shield size={14} /> Titular
                     </button>
                     <button onClick={() => setScoutingRole('Reserva')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${scoutingRole === 'Reserva' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                       <ShieldX size={14} /> Reserva
                     </button>
                  </div>

                  <div className="pt-4 border-t border-gray-800 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Adversário</label>
                        <input type="text" value={opponent} onChange={(e) => setOpponent(e.target.value)} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold" />
                      </div>
                    </div>
                  </div>

                  {/* Pênaltis */}
                  <div className="pt-4 space-y-3 border-t border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pênaltis</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Check size={12} className="text-green-500" /> Positivo (Defesa)</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handlePenaltyChange('pos', -1)} className="w-7 h-7 bg-gray-900 rounded border border-gray-800 text-gray-400 font-bold">-</button>
                        <span className="w-4 text-center text-xs font-black text-green-500">{penalties.pos}</span>
                        <button onClick={() => handlePenaltyChange('pos', 1)} className="w-7 h-7 rounded border font-bold bg-green-600 border-green-600 text-white">+</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><ShieldAlert size={12} className="text-red-500" /> Negativo (Gol)</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handlePenaltyChange('neg', -1)} className="w-7 h-7 bg-gray-900 rounded border border-gray-800 text-gray-400 font-bold">-</button>
                        <span className="w-4 text-center text-xs font-black text-red-500">{penalties.neg}</span>
                        <button onClick={() => handlePenaltyChange('neg', 1)} className="w-7 h-7 rounded border font-bold bg-red-600 border-red-600 text-white">+</button>
                      </div>
                    </div>
                  </div>

                  {/* Participação Ofensiva */}
                  <div className="pt-4 space-y-3 border-t border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Participação Ofensiva</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Zap size={12} className="text-blue-400" /> Assistência</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOffensiveChange('assists', -1)} className="w-7 h-7 bg-gray-900 rounded border border-gray-800 text-gray-400 font-bold">-</button>
                        <span className="w-4 text-center text-xs font-black text-blue-400">{offensiveStats.assists}</span>
                        <button onClick={() => handleOffensiveChange('assists', 1)} className="w-7 h-7 rounded border font-bold bg-blue-600 border-blue-600 text-white">+</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1"><Star size={12} className="gold-text" /> Gol Marcado</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOffensiveChange('goals', -1)} className="w-7 h-7 bg-gray-900 rounded border border-gray-800 text-gray-400 font-bold">-</button>
                        <span className="w-4 text-center text-xs font-black text-gold">{offensiveStats.goals}</span>
                        <button onClick={() => handleOffensiveChange('goals', 1)} className="w-7 h-7 rounded border font-bold bg-gold border-gold text-black">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de Métricas Técnicas */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
                <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Painel de Ações Técnicas</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCleanSheet(!cleanSheet)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${cleanSheet ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      Clean Sheet: {cleanSheet ? 'SIM' : 'NÃO'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800 custom-scrollbar">
                  {SCOUT_METRICS.map(metric => (
                    <div key={metric.id} className="bg-card p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-tight">{metric.label}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-800">
                          <button onClick={() => handleActionChange(metric.id, 'neg', -1)} className="w-7 h-7 rounded-lg bg-red-950/20 text-red-500 border border-red-900/30 flex items-center justify-center"><Minus size={14} /></button>
                          <span className="w-5 text-center text-xs font-black text-red-500">{actions[metric.id].neg}</span>
                          <button onClick={() => handleActionChange(metric.id, 'neg', 1)} className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center"><Plus size={14} /></button>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-800">
                          <button onClick={() => handleActionChange(metric.id, 'pos', -1)} className="w-7 h-7 rounded-lg bg-green-950/20 text-green-500 border border-green-900/30 flex items-center justify-center"><Minus size={14} /></button>
                          <span className="w-5 text-center text-xs font-black text-green-500">{actions[metric.id].pos}</span>
                          <button onClick={() => handleActionChange(metric.id, 'pos', 1)} className="w-7 h-7 rounded-lg gold-gradient text-black flex items-center justify-center"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RODAPÉ: ZONAS LADO A LADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ZONA DE FINALIZAÇÃO (PITCH) */}
            <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black gold-text uppercase tracking-widest mb-1 flex items-center gap-2">
                <Crosshair size={14} className="text-red-500" /> ZONA DE FINALIZAÇÕES (GOLS)
              </h3>
              <p className="text-[8px] font-black text-gray-600 uppercase mb-4 tracking-tighter uppercase">
                CLIQUE PARA CONTAR • BOTÃO DIREITO -1 • "X" LIMPAR
              </p>
              
              <div className="relative bg-[#050c05] border-2 border-green-950/40 p-2 rounded-2xl shadow-inner aspect-[16/10] overflow-hidden">
                {/* Soccer Pitch Markings SVG */}
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

                {/* Grid Overlay */}
                <div className="relative h-full grid grid-cols-5 grid-rows-[1fr_1fr_0.8fr] gap-1.5 z-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((zone) => {
                    const count = pitchZones[zone] || 0;
                    return (
                      <div key={zone} className="relative">
                        <button 
                          onClick={() => handlePitchZoneClick(zone, 1)}
                          onContextMenu={(e) => { e.preventDefault(); handlePitchZoneClick(zone, -1); }}
                          className={`w-full h-full relative flex flex-col items-center justify-center border-2 transition-all rounded-xl overflow-hidden ${count > 0 ? 'bg-red-600/30 border-red-500/50' : 'bg-black/10 border-white/5 hover:border-green-600/30'}`}
                        >
                          <span className={`text-[10px] font-black absolute top-1.5 left-2 ${count > 0 ? 'text-red-400' : 'text-green-900/40'}`}>Z{zone}</span>
                          {count > 0 && <span className="text-4xl font-black text-white drop-shadow-md">{count}</span>}
                        </button>
                        {count > 0 && (
                          <button onClick={(e) => { e.stopPropagation(); handleClearPitchZone(zone); }} className="absolute top-1 right-1 p-1 bg-black/40 rounded-md text-gray-400 hover:text-white transition-colors z-20">
                            <CloseIcon size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div className="col-span-5 relative">
                    <button 
                      onClick={() => handlePitchZoneClick(11, 1)}
                      onContextMenu={(e) => { e.preventDefault(); handlePitchZoneClick(11, -1); }}
                      className={`w-full h-full relative flex flex-col items-center justify-center border-2 transition-all rounded-xl overflow-hidden ${pitchZones[11] > 0 ? 'bg-red-600/30 border-red-500/50' : 'bg-black/10 border-white/5 hover:border-green-600/30'}`}
                    >
                      <span className={`text-[10px] font-black absolute top-1.5 left-2 ${pitchZones[11] > 0 ? 'text-red-400' : 'text-green-900/40'}`}>Z11</span>
                      {pitchZones[11] > 0 && <span className="text-5xl font-black text-white drop-shadow-md">{pitchZones[11]}</span>}
                    </button>
                    {pitchZones[11] > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); handleClearPitchZone(11); }} className="absolute top-1 right-1 p-1 bg-black/40 rounded-md text-gray-400 hover:text-white transition-colors z-20">
                        <CloseIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ZONA DO GOL (BALIZA) */}
            <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xs font-black gold-text uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target size={14} className="gold-text" /> ZONAS DO GOL (DEFESA VS GOL)
              </h3>
              <p className="text-[8px] font-black uppercase mb-4 tracking-tighter uppercase">
                <span className="text-amber-500">DEFESA: LADO ESQ.</span> • <span className="text-red-500">GOL: LADO DIR.</span> • BOTÃO DIREITO -1 • "X" LIMPAR
              </p>
              
              <div className="bg-[#030308] border-2 border-blue-950/30 p-2 rounded-2xl shadow-inner aspect-[16/10] grid grid-cols-3 grid-rows-3 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((zone) => {
                  const data = goalZones[zone] || { saves: 0, goals: 0 };
                  const hasData = data.saves > 0 || data.goals > 0;
                  return (
                    <div key={zone} className="relative border border-white/5 rounded-2xl overflow-hidden flex bg-black/40 shadow-inner group transition-colors hover:bg-white/[0.02]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 bg-[#1a1a1a] border-x border-b border-gray-800 rounded-b-lg flex items-center gap-1.5">
                        <span className="text-[8px] font-black text-gray-600">{zone}</span>
                        {hasData && (
                          <button onClick={(e) => { e.stopPropagation(); handleClearGoalZone(zone); }} className="p-0.5 text-gray-700 hover:text-red-500 transition-colors">
                            <CloseIcon size={10} />
                          </button>
                        )}
                      </div>

                      <button onClick={() => handleGoalZoneAction(zone, 'saves', 1)} onContextMenu={(e) => { e.preventDefault(); handleGoalZoneAction(zone, 'saves', -1); }} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${data.saves > 0 ? 'bg-blue-600/15' : 'hover:bg-white/5'}`}>
                        <span className={`text-[8px] font-black ${data.saves > 0 ? 'text-blue-400' : 'text-gray-800'} uppercase tracking-tighter`}>DEF</span>
                        <span className={`text-3xl font-black ${data.saves > 0 ? 'text-white' : 'text-gray-900'}`}>{data.saves}</span>
                      </button>

                      <div className="w-px bg-white/5 h-full shrink-0"></div>

                      <button onClick={() => handleGoalZoneAction(zone, 'goals', 1)} onContextMenu={(e) => { e.preventDefault(); handleGoalZoneAction(zone, 'goals', -1); }} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${data.goals > 0 ? 'bg-red-600/15' : 'hover:bg-white/5'}`}>
                        <span className={`text-[8px] font-black ${data.goals > 0 ? 'text-red-500' : 'text-gray-800'} uppercase tracking-tighter`}>GOL</span>
                        <span className={`text-3xl font-black ${data.goals > 0 ? 'text-red-500' : 'text-gray-900'}`}>{data.goals}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold uppercase tracking-widest flex items-center gap-2"><History className="gold-text" size={18} /> Histórico de Scouts</h2>
          </div>
          <div className="divide-y divide-gray-800">
            {keeperScouts.length > 0 ? keeperScouts.map(sc => {
              const keeper = keepers.find(k => k.id === sc.goalkeeperId);
              return (
                <div key={sc.id} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-black text-gold overflow-hidden">
                      {keeper?.photo ? <img src={keeper.photo} alt={keeper.name} className="w-full h-full object-cover" /> : keeper?.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{keeper?.name} vs {sc.opponent}</h3>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(sc.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {sc.matchPosition}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteScout(sc.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              );
            }) : (
              <div className="p-20 text-center text-gray-600 font-bold uppercase text-xs tracking-widest">Sem registros</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutPage;
