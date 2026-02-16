
import React, { useState, useMemo } from 'react';
import { Target, Shield, Zap, Save, Trophy, User, Check, Minus, Plus, Map, Goal, X as CloseIcon, FileText, Download, History, ChevronDown, ChevronUp, Trash2, ShieldX, ShieldAlert } from 'lucide-react';
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
  const [expandedScoutId, setExpandedScoutId] = useState<string | null>(null);

  const [activeKeeperId, setActiveKeeperId] = useState('');
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');
  const [result, setResult] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [cleanSheet, setCleanSheet] = useState(false);
  const [goalParticipation, setGoalParticipation] = useState(false);
  
  const [actions, setActions] = useState<Record<string, { pos: number, neg: number }>>(
    SCOUT_METRICS.reduce((acc, m) => ({ ...acc, [m.id]: { pos: 0, neg: 0 } }), {})
  );

  const [specialActions, setSpecialActions] = useState({
    defesaBasica: 0,
    defesaDificil: 0,
    superSave: 0,
    erroCritico: 0
  });

  const [pitchZones, setPitchZones] = useState<Record<number, number>>({});
  const [goalZones, setGoalZones] = useState<Record<number, { saves: number, goals: number }>>({});

  const keeperScouts = useMemo(() => {
    return scouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [scouts]);

  const handleActionChange = (id: string, type: 'pos' | 'neg', delta: number) => {
    setActions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: Math.max(0, prev[id][type] + delta)
      }
    }));
  };

  const handleSpecialAction = (id: keyof typeof specialActions, delta: number) => {
    setSpecialActions(prev => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }));
  };

  const handlePitchZoneClick = (zoneId: number, delta: number = 1) => {
    setPitchZones(prev => ({
      ...prev,
      [zoneId]: Math.max(0, (prev[zoneId] || 0) + delta)
    }));
  };

  const handleGoalZoneAction = (zoneId: number, type: 'saves' | 'goals', delta: number = 1) => {
    setGoalZones(prev => {
      const current = prev[zoneId] || { saves: 0, goals: 0 };
      return {
        ...prev,
        [zoneId]: {
          ...current,
          [type]: Math.max(0, current[type] + delta)
        }
      };
    });
  };

  const handleClearGoalZone = (e: React.MouseEvent, zoneId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setGoalZones(prev => {
      const newState = { ...prev };
      delete newState[zoneId];
      return newState;
    });
  };

  const handleClearPitchZone = (e: React.MouseEvent, zoneId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setPitchZones(prev => {
      const newState = { ...prev };
      delete newState[zoneId];
      return newState;
    });
  };

  const handleSaveScout = () => {
    if (!activeKeeperId || !opponent) {
      alert("Selecione um goleiro e informe o adversário.");
      return;
    }

    const newScout: MatchScout = {
      id: Math.random().toString(36).substr(2, 9),
      goalkeeperId: activeKeeperId,
      opponent,
      date,
      competition,
      result,
      cleanSheet,
      goalParticipation,
      actions,
      specialActions,
      pitchZones,
      goalZones
    };

    addScout(newScout);
    alert("Scout registrado com sucesso!");
    resetForm();
  };

  const resetForm = () => {
    setOpponent('');
    setResult('');
    setCleanSheet(false);
    setGoalParticipation(false);
    setActions(SCOUT_METRICS.reduce((acc, m) => ({ ...acc, [m.id]: { pos: 0, neg: 0 } }), {}));
    setSpecialActions({ defesaBasica: 0, defesaDificil: 0, superSave: 0, erroCritico: 0 });
    setPitchZones({});
    setGoalZones({});
  };

  const exportToPDF = (scout: MatchScout) => {
    const keeper = keepers.find(k => k.id === scout.goalkeeperId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Scout - ${keeper?.name} vs ${scout.opponent}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 20px; }
            .gold { color: #D4AF37; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .card { border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
            h1, h2, h3 { margin-top: 0; text-transform: uppercase; }
            .stat-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f9f9f9; font-size: 12px; }
            .val { font-weight: bold; }
            .pos { color: green; }
            .neg { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="gold">GK Performance Pro - Scout de Jogo</h1>
            <p><strong>Goleiro:</strong> ${keeper?.name} (${keeper?.category}) | <strong>Data:</strong> ${new Date(scout.date + 'T00:00:00').toLocaleDateString()}</p>
            <p><strong>Partida:</strong> vs ${scout.opponent} | <strong>Resultado:</strong> ${scout.result}</p>
          </div>
          
          <div class="grid">
            <div class="card">
              <h3>Ações Técnicas</h3>
              ${SCOUT_METRICS.map(m => {
                const act = scout.actions[m.id];
                return `<div class="stat-row"><span>${m.label}</span><span><span class="pos">+${act.pos}</span> / <span class="neg">-${act.neg}</span></span></div>`;
              }).join('')}
            </div>
            <div>
              <div class="card">
                <h3>Destaques</h3>
                <div class="stat-row"><span>Defesa Básica</span><span class="val">${scout.specialActions.defesaBasica}</span></div>
                <div class="stat-row"><span>Defesa Difícil</span><span class="val">${scout.specialActions.defesaDificil}</span></div>
                <div class="stat-row"><span>Super Save</span><span class="val">${scout.specialActions.superSave}</span></div>
                <div class="stat-row"><span>Erro Crítico</span><span class="val">${scout.specialActions.erroCritico || 0}</span></div>
                <div class="stat-row"><span>Clean Sheet</span><span class="val">${scout.cleanSheet ? 'SIM' : 'NÃO'}</span></div>
                <div class="stat-row"><span>Part. em Gol</span><span class="val">${scout.goalParticipation ? 'SIM' : 'NÃO'}</span></div>
              </div>
              <div class="card">
                <h3>Zonais</h3>
                <p><strong>Zonas de Atuação (Pitch):</strong> ${Object.entries(scout.pitchZones).map(([z, c]) => `Z${z}(${c}x)`).join(', ') || 'Nenhuma'}</p>
                <p><strong>Zonas do Gol:</strong> ${Object.entries(scout.goalZones).map(([z, val]) => `Z${z}(D:${val.saves}/G:${val.goals})`).join(', ') || 'Nenhuma'}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Scout Profissional <span className="gold-text">2026</span></h1>
          <p className="text-gray-400 mt-1">Modelo baseado no caderno de formação técnica</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-gray-400 font-black px-6 py-3 rounded-xl hover:text-white hover:border-gray-700 transition-all uppercase text-xs"
          >
            <History size={18} />
            {showHistory ? 'Voltar para Lançamento' : 'Histórico de Scouts'}
          </button>
          {!showHistory && (
            <button 
              onClick={handleSaveScout}
              className="flex items-center justify-center gap-2 gold-gradient text-black font-black px-10 py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase text-xs tracking-widest"
            >
              <Save size={20} />
              Finalizar Relatório
            </button>
          )}
        </div>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-20">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Trophy size={14} className="gold-text" /> Dados da Partida
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Atleta</label>
                  <select 
                    value={activeKeeperId}
                    onChange={(e) => setActiveKeeperId(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold"
                  >
                    <option value="">Selecione...</option>
                    {keepers.map(k => <option key={k.id} value={k.id}>{k.name} ({k.category})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Adversário</label>
                  <input type="text" value={opponent} onChange={(e) => setOpponent(e.target.value)} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold" placeholder="Ex: Grêmio" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setCleanSheet(!cleanSheet)}
                    className={`p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${cleanSheet ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 'bg-black border-gray-800 text-gray-500'}`}
                  >
                    Clean Sheet
                  </button>
                  <button 
                    onClick={() => setGoalParticipation(!goalParticipation)}
                    className={`p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${goalParticipation ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 'bg-black border-gray-800 text-gray-500'}`}
                  >
                    Part. em Gol
                  </button>
                </div>

                <div className="pt-4 space-y-3 border-t border-gray-800">
                  {[
                    { label: 'Defesa Básica (+)', id: 'defesaBasica', icon: <Shield size={12} className="text-blue-400" /> },
                    { label: 'Defesa Difícil (+)', id: 'defesaDificil', icon: <Zap size={12} className="text-yellow-400" /> },
                    { label: 'Super Save (+)', id: 'superSave', icon: <Trophy size={12} className="gold-text" /> },
                    { label: 'Erro Crítico (-)', id: 'erroCritico', icon: <ShieldAlert size={12} className="text-red-500" /> },
                  ].map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1">
                        {item.icon} {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                         <button onClick={() => handleSpecialAction(item.id as any, -1)} className="w-7 h-7 bg-gray-900 rounded border border-gray-800 text-gray-400 font-bold">-</button>
                         <span className={`w-4 text-center text-xs font-black ${item.id === 'erroCritico' ? 'text-red-500' : 'text-gold'}`}>{specialActions[item.id as keyof typeof specialActions]}</span>
                         <button onClick={() => handleSpecialAction(item.id as any, 1)} className={`w-7 h-7 rounded border font-bold ${item.id === 'erroCritico' ? 'bg-red-600 border-red-600 text-white' : 'bg-gold border-gold text-black'}`}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-800">
                {SCOUT_METRICS.map(metric => (
                  <div key={metric.id} className="bg-card p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-tight">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-800">
                        <button 
                          onClick={() => handleActionChange(metric.id, 'neg', -1)}
                          className="w-7 h-7 rounded-lg bg-red-950/20 text-red-500 border border-red-900/30 flex items-center justify-center hover:bg-red-900/30"
                        ><Minus size={14} /></button>
                        <span className="w-5 text-center text-xs font-black text-red-500">{actions[metric.id].neg}</span>
                        <button 
                          onClick={() => handleActionChange(metric.id, 'neg', 1)}
                          className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:scale-105 transition-all"
                        ><Plus size={14} /></button>
                        <span className="text-[8px] font-black text-red-500/50 uppercase ml-1">ERRO</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-xl border border-gray-800">
                        <button 
                          onClick={() => handleActionChange(metric.id, 'pos', -1)}
                          className="w-7 h-7 rounded-lg bg-green-950/20 text-green-500 border border-green-900/30 flex items-center justify-center hover:bg-green-900/30"
                        ><Minus size={14} /></button>
                        <span className="w-5 text-center text-xs font-black text-green-500">{actions[metric.id].pos}</span>
                        <button 
                          onClick={() => handleActionChange(metric.id, 'pos', 1)}
                          className="w-7 h-7 rounded-lg gold-gradient text-black flex items-center justify-center hover:scale-105 transition-all"
                        ><Plus size={14} /></button>
                        <span className="text-[8px] font-black text-green-500/50 uppercase ml-1">OK</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Map size={14} className="gold-text" /> Zonas do Campo (Atuação)
                </h3>
                <p className="text-[8px] text-gray-600 uppercase font-bold mb-3">Clique para contar • Botão direito -1 • "X" Limpar</p>
                <div className="relative aspect-[16/9] bg-green-900/10 border-2 border-green-800/30 rounded-xl overflow-hidden grid grid-cols-5 grid-rows-3 gap-1 p-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((zone, idx) => {
                    const count = pitchZones[zone] || 0;
                    const isSelected = count > 0;
                    const spans = zone === 11 ? 'col-span-5 row-start-3' : '';
                    if (zone === 11 && idx < 10) return null;
                    if (zone > 10 && zone !== 11) return null;

                    return (
                      <button 
                        key={zone}
                        onClick={() => handlePitchZoneClick(zone, 1)}
                        onContextMenu={(e) => { e.preventDefault(); handlePitchZoneClick(zone, -1); }}
                        className={`
                          relative flex items-center justify-center rounded border transition-all active:scale-95
                          ${isSelected ? 'bg-green-600 border-white text-white font-black shadow-lg' : 'bg-black/40 border-green-900/40 text-green-700 hover:border-green-600'}
                          ${spans}
                        `}
                      >
                        <span className="text-[10px]">Z{zone}</span>
                        {count > 0 && (
                          <>
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center border border-white shadow-sm">
                              {count}
                            </div>
                            <div 
                              onClick={(e) => handleClearPitchZone(e, zone)}
                              role="button"
                              className="absolute top-1 left-1 p-1 bg-black/40 hover:bg-black rounded-full text-white/70 hover:text-white transition-all cursor-pointer z-10"
                            >
                              <CloseIcon size={10} />
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-gray-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Goal size={14} className="gold-text" /> Zonas do Gol (Defesa vs Gol)
                </h3>
                <p className="text-[8px] text-gray-600 uppercase font-bold mb-3">
                  <span className="gold-text">DEFESA: Lado Esq.</span> • 
                  <span className="text-red-500 ml-1">GOL: Lado Dir.</span> • 
                  <span>Botão Direito: -1</span> • 
                  <span>"X" Limpar</span>
                </p>
                <div className="relative aspect-[16/9] bg-black/40 border-4 border-gray-800 border-b-0 rounded-t-xl overflow-hidden grid grid-cols-3 grid-rows-3 gap-2 p-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((zone) => {
                    const data = goalZones[zone] || { saves: 0, goals: 0 };
                    const hasActivity = data.saves > 0 || data.goals > 0;
                    
                    return (
                      <div key={zone} className="relative group border border-gray-800 rounded-lg overflow-hidden flex shadow-inner">
                        <button 
                          onClick={() => handleGoalZoneAction(zone, 'saves', 1)}
                          onContextMenu={(e) => { e.preventDefault(); handleGoalZoneAction(zone, 'saves', -1); }}
                          className={`flex-1 flex flex-col items-center justify-center transition-all ${data.saves > 0 ? 'bg-gold/20' : 'hover:bg-gold/5'}`}
                        >
                          <span className={`text-[9px] font-black uppercase mb-1 ${data.saves > 0 ? 'gold-text' : 'text-gray-700'}`}>DEF</span>
                          <span className={`text-xl font-black ${data.saves > 0 ? 'gold-text' : 'text-gray-800'}`}>{data.saves}</span>
                        </button>
                        <div className="w-px bg-gray-800 h-full flex items-center justify-center">
                           <span className="bg-black text-gray-600 text-[8px] font-black p-0.5 rounded border border-gray-800 absolute z-10">{zone}</span>
                        </div>
                        <button 
                          onClick={() => handleGoalZoneAction(zone, 'goals', 1)}
                          onContextMenu={(e) => { e.preventDefault(); handleGoalZoneAction(zone, 'goals', -1); }}
                          className={`flex-1 flex flex-col items-center justify-center transition-all ${data.goals > 0 ? 'bg-red-950/30' : 'hover:bg-red-900/5'}`}
                        >
                          <span className={`text-[9px] font-black uppercase mb-1 ${data.goals > 0 ? 'text-red-500' : 'text-gray-700'}`}>GOL</span>
                          <span className={`text-xl font-black ${data.goals > 0 ? 'text-red-500' : 'text-gray-800'}`}>{data.goals}</span>
                        </button>
                        {hasActivity && (
                          <button 
                            onClick={(e) => handleClearGoalZone(e, zone)}
                            className="absolute top-1 left-1/2 -translate-x-1/2 p-1 bg-black/60 hover:bg-black rounded-full text-white/50 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100"
                          >
                            <CloseIcon size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="h-2 bg-gray-800 rounded-b-xl"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold uppercase tracking-widest flex items-center gap-2">
              <History className="gold-text" size={18} /> Histórico de Scouts Realizados
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {keeperScouts.length > 0 ? keeperScouts.map(sc => {
              const keeper = keepers.find(k => k.id === sc.goalkeeperId);
              const isExpanded = expandedScoutId === sc.id;
              const totalSaves = sc.specialActions.defesaBasica + sc.specialActions.defesaDificil + sc.specialActions.superSave;
              const zoneGols = Object.values(sc.goalZones || {}).reduce((sum, z) => sum + (z.goals || 0), 0);
              const criticalErrors = sc.specialActions.erroCritico || 0;
              
              return (
                <div key={sc.id} className="group hover:bg-white/[0.01] transition-colors">
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedScoutId(isExpanded ? null : sc.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-black text-gold overflow-hidden">
                        {keeper?.photo ? <img src={keeper.photo} className="w-full h-full object-cover" /> : keeper?.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{keeper?.name || 'Atleta não encontrado'} vs {sc.opponent}</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(sc.date + 'T00:00:00').toLocaleDateString()} • {sc.result}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="hidden md:flex flex-col items-end mr-4">
                          <span className="text-[10px] font-black text-gold uppercase">{totalSaves} Defesas</span>
                          {criticalErrors > 0 && <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1"><ShieldAlert size={10}/> {criticalErrors} Erros Decisivos</span>}
                          <span className={`text-[8px] font-black uppercase ${zoneGols > 0 ? 'text-red-500' : 'text-blue-400'}`}>
                            {zoneGols > 0 ? `${zoneGols} Gols Sofridos` : 'Clean Sheet'}
                          </span>
                       </div>
                       <button 
                        onClick={(e) => { e.stopPropagation(); exportToPDF(sc); }}
                        className="p-2 text-gray-400 hover:text-gold transition-colors"
                        title="Gerar PDF"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteScout(sc.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      {isExpanded ? <ChevronUp className="text-gold" /> : <ChevronDown className="text-gray-600" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-8 pt-2 animate-in slide-in-from-top-2">
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                         {SCOUT_METRICS.map(m => {
                           const val = sc.actions[m.id];
                           if (val.pos === 0 && val.neg === 0) return null;
                           return (
                             <div key={m.id} className="bg-black/40 border border-gray-800 p-3 rounded-xl">
                               <p className="text-[8px] text-gray-500 font-black uppercase truncate">{m.label}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-black text-green-500">+{val.pos}</span>
                                  <span className="text-xs font-black text-red-500">-{val.neg}</span>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                       <div className="mt-6 flex flex-wrap gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl">
                          <div className="flex items-center gap-2">
                             <Goal size={14} className="gold-text" />
                             <span className="text-[9px] font-black text-white uppercase tracking-widest">Mapa de Zonas:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(sc.goalZones || {}).map(([zone, val]) => (
                              <div key={zone} className="flex items-center gap-1.5 px-2.5 py-1 bg-black rounded-lg border border-gray-800 text-[10px] font-bold">
                                 <span className="text-gray-500">Z{zone}</span>
                                 <span className="gold-text">D:{val.saves}</span>
                                 <span className="text-red-500">G:{val.goals}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-20 text-center">
                 <Target size={48} className="text-gray-800 mx-auto mb-4" />
                 <p className="text-gray-500 font-bold uppercase text-xs">Nenhum scout registrado no histórico.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutPage;
