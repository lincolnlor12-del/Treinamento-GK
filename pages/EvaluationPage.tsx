
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Save, 
  Info, 
  ChevronRight, 
  User, 
  Calendar, 
  History, 
  Trash2, 
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Zap,
  Play
} from 'lucide-react';
import { EVALUATION_CRITERIA } from '../constants';
import { useGoalkeepers } from '../context/GoalkeeperContext';
import { Evaluation } from '../types';

const EvaluationPage: React.FC = () => {
  const { keepers, evaluations, addEvaluation, deleteEvaluation } = useGoalkeepers();
  const location = useLocation();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<keyof typeof EVALUATION_CRITERIA>('defensive');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null);

  // Form State
  const [selectedKeeperId, setSelectedKeeperId] = useState('');
  const [observations, setObservations] = useState('');
  const [highlightsLink, setHighlightsLink] = useState('');
  const [improvementsLink, setImprovementsLink] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Scores State
  const [technicalDefensive, setTechnicalDefensive] = useState<Record<string, number>>({});
  const [technicalOffensive, setTechnicalOffensive] = useState<Record<string, number>>({});
  const [tactical, setTactical] = useState<Record<string, number>>({});
  const [physical, setPhysical] = useState<Record<string, number>>({});
  const [behavioral, setBehavioral] = useState<Record<string, number>>({});

  // Check if a keeper was passed through navigation state
  useEffect(() => {
    if (location.state?.keeperId) {
      setSelectedKeeperId(location.state.keeperId);
      // Clean history to show form
      setShowHistory(false);
    }
  }, [location.state]);

  const selectedKeeper = useMemo(() => 
    keepers.find(k => k.id === selectedKeeperId), 
    [keepers, selectedKeeperId]
  );

  const keeperEvaluations = useMemo(() => {
    return evaluations
      .filter(e => !selectedKeeperId || e.goalkeeperId === selectedKeeperId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [evaluations, selectedKeeperId]);

  const getCurrentScores = () => {
    switch (activeTab) {
      case 'defensive': return technicalDefensive;
      case 'offensive': return technicalOffensive;
      case 'tactical': return tactical;
      case 'physical': return physical;
      case 'behavioral': return behavioral;
      default: return {};
    }
  };

  const setCurrentScores = (newScores: Record<string, number>) => {
    switch (activeTab) {
      case 'defensive': setTechnicalDefensive(newScores); break;
      case 'offensive': setTechnicalOffensive(newScores); break;
      case 'tactical': setTactical(newScores); break;
      case 'physical': setPhysical(newScores); break;
      case 'behavioral': setBehavioral(newScores); break;
    }
  };

  const handleScoreChange = (criterion: string, score: number) => {
    setCurrentScores({ ...getCurrentScores(), [criterion]: score });
  };

  const handleSaveEvaluation = () => {
    if (!selectedKeeperId) {
      alert("Por favor, selecione um goleiro para realizar a avaliação.");
      return;
    }

    const newEval: Evaluation = {
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      goalkeeperId: selectedKeeperId,
      date,
      technicalDefensive: { ...technicalDefensive },
      technicalOffensive: { ...technicalOffensive },
      tactical: { ...tactical },
      physical: { ...physical },
      behavioral: { ...behavioral },
      frequency: 'Nulo',
      observations,
      highlightsLink,
      improvementsLink
    };

    try {
      addEvaluation(newEval);
      setObservations('');
      setHighlightsLink('');
      setImprovementsLink('');
      setTechnicalDefensive({});
      setTechnicalOffensive({});
      setTactical({});
      setPhysical({});
      setBehavioral({});
      alert("Avaliação registrada com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      alert("Ocorreu um erro ao tentar salvar a avaliação. Tente novamente.");
    }
  };

  const getTabLabel = (key: string) => {
    const labels: Record<string, string> = {
      defensive: 'Técnico Defensivo',
      offensive: 'Técnico Ofensivo',
      tactical: 'Tático',
      physical: 'Físico',
      behavioral: 'Comportamental'
    };
    return labels[key] || key;
  };

  const currentScores = getCurrentScores();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Avaliação Individual</h1>
          <p className="text-gray-400 mt-1">Gestão técnica longitudinal baseada nos pilares do Caderno Técnico</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 text-gray-400 font-black px-6 py-3 rounded-xl hover:text-white hover:border-gray-700 transition-all uppercase text-xs"
          >
            <History size={18} />
            {showHistory ? 'Voltar para Avaliação' : 'Histórico Recente'}
          </button>
          {!showHistory && (
            <button 
              onClick={handleSaveEvaluation}
              className="flex items-center justify-center gap-2 gold-gradient text-black font-black px-8 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase text-xs"
            >
              <Save size={18} />
              Finalizar Registro
            </button>
          )}
        </div>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Controls */}
          <div className="space-y-6">
            <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <User size={60} className="text-gold" />
              </div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User size={14} className="gold-text" /> Seleção do Atleta
              </h3>
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[9px] font-bold text-gray-600 uppercase mb-1">Goleiro</label>
                  <select 
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold focus:border-gold outline-none transition-colors"
                    value={selectedKeeperId}
                    onChange={(e) => setSelectedKeeperId(e.target.value)}
                  >
                    <option value="">Selecione um goleiro...</option>
                    {keepers.map(k => (
                      <option key={k.id} value={k.id}>{k.name} ({k.category})</option>
                    ))}
                  </select>
                </div>

                {selectedKeeper && (
                  <div className="flex items-center gap-3 p-3 bg-black/40 border border-gray-800 rounded-xl animate-in fade-in slide-in-from-left-2">
                    <div className="w-12 h-12 rounded-lg border border-gold/30 overflow-hidden shrink-0 shadow-inner">
                      {selectedKeeper.photo ? (
                        <img src={selectedKeeper.photo} alt={selectedKeeper.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gold font-bold">{selectedKeeper.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-gold uppercase tracking-tighter truncate">{selectedKeeper.name}</p>
                      <p className="text-[8px] text-gray-500 font-bold uppercase truncate">{selectedKeeper.category}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-bold text-gray-600 uppercase mb-1">Data</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 pl-10 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold focus:border-gold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-gray-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Pilares do Caderno</h3>
              {Object.keys(EVALUATION_CRITERIA).map((key) => {
                const isActive = activeTab === key;
                const criteriaList = EVALUATION_CRITERIA[key as keyof typeof EVALUATION_CRITERIA];
                const scoreList = key === 'defensive' ? technicalDefensive : key === 'offensive' ? technicalOffensive : key === 'tactical' ? tactical : key === 'physical' ? physical : behavioral;
                const count = Object.keys(scoreList).length;
                const total = criteriaList.length;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl border transition-all group
                      ${isActive 
                        ? 'bg-gold/10 border-gold gold-text shadow-lg shadow-gold/5' 
                        : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'}
                    `}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-black text-[11px] uppercase tracking-tighter">{getTabLabel(key)}</span>
                      <span className={`text-[9px] font-bold ${isActive ? 'text-gold/60' : 'text-gray-600'}`}>{count}/{total} preenchidos</span>
                    </div>
                    <ChevronRight size={16} className={`${isActive ? 'text-gold' : 'text-gray-700'} group-hover:translate-x-1 transition-transform`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evaluation Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-800 gold-gradient flex items-center justify-between">
                <h2 className="text-black font-black text-xl uppercase tracking-tighter">{getTabLabel(activeTab)}</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full border border-black/10">
                  <Info size={14} className="text-black" />
                  <span className="text-[9px] font-black text-black uppercase">Critérios de Desempenho</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto custom-scrollbar bg-black/20">
                {EVALUATION_CRITERIA[activeTab].map((criterion) => (
                  <div key={criterion} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors border-l-4 border-transparent hover:border-gold">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm tracking-tight">{criterion}</p>
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Nível de proficiência no pilar</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleScoreChange(criterion, num)}
                          className={`
                            w-9 h-9 rounded-lg font-black text-xs transition-all border
                            ${currentScores[criterion] === num 
                              ? 'gold-gradient text-black scale-110 shadow-lg border-gold' 
                              : 'bg-gray-900 text-gray-500 hover:text-white border-gray-800 hover:border-gray-600'}
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Play size={14} className="gold-text" /> Link Melhores Momentos
                </label>
                <input 
                  type="url"
                  value={highlightsLink}
                  onChange={(e) => setHighlightsLink(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-gold transition-all"
                />
              </div>
              <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={14} className="text-blue-500" /> Link Áreas de Melhoria
                </label>
                <input 
                  type="url"
                  value={improvementsLink}
                  onChange={(e) => setImprovementsLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                Feedback Técnico Adicional
              </label>
              <textarea 
                rows={4}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Descreva detalhes específicos observados, pontos a corrigir no microciclo e feedback do atleta..."
                className="w-full p-5 bg-black border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 resize-none transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="gold-text" size={18} /> Histórico de Registros
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {keeperEvaluations.length > 0 ? keeperEvaluations.map(ev => {
              const keeper = keepers.find(k => k.id === ev.goalkeeperId);
              const isExpanded = expandedEvalId === ev.id;
              return (
                <div key={ev.id} className="group hover:bg-white/[0.01] transition-colors">
                  <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedEvalId(isExpanded ? null : ev.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center font-black text-gold overflow-hidden shrink-0">
                        {keeper?.photo ? <img src={keeper.photo} alt={keeper.name} className="w-full h-full object-cover" /> : <div className="bg-gray-800 text-gold">{keeper?.name.charAt(0) || 'G'}</div>}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{keeper?.name || 'Goleiro Removido'}</h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{new Date(`${ev.date}T00:00:00`).toLocaleDateString('pt-BR')} • {keeper?.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ev.highlightsLink && <a href={ev.highlightsLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-gold hover:scale-110 transition-transform"><Play size={16}/></a>}
                      {ev.improvementsLink && <a href={ev.improvementsLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 text-blue-500 hover:scale-110 transition-transform"><Zap size={16}/></a>}
                      <button onClick={(e) => { e.stopPropagation(); deleteEvaluation(ev.id); }} className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={16} /></button>
                      {isExpanded ? <ChevronUp className="text-gold" /> : <ChevronDown className="text-gray-600" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-8 pt-2 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {['defensive', 'offensive', 'tactical', 'physical', 'behavioral'].map(col => {
                          const scores = (ev as any)[col === 'defensive' ? 'technicalDefensive' : col === 'offensive' ? 'technicalOffensive' : col];
                          const filledCount = Object.keys(scores || {}).length;
                          const avg = filledCount > 0 ? (Number(Object.values(scores as any).reduce((a: any, b: any) => a + b, 0)) / filledCount).toFixed(1) : '-';
                          return (
                            <div key={col} className="bg-black/40 border border-gray-800 rounded-xl p-4">
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{getTabLabel(col)}</p>
                              <p className="text-xl font-black text-white">{avg}</p>
                            </div>
                          );
                        })}
                      </div>
                      {(ev.highlightsLink || ev.improvementsLink) && (
                        <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-xl flex flex-wrap gap-4">
                           {ev.highlightsLink && (
                             <a href={ev.highlightsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-gold hover:underline">
                               <Play size={12} /> Melhores Momentos
                             </a>
                           )}
                           {ev.improvementsLink && (
                             <a href={ev.improvementsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:underline">
                               <Zap size={12} /> Áreas de Melhoria
                             </a>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-20 text-center"><AlertCircle size={48} className="text-gray-800 mx-auto mb-4" /><p className="text-gray-500 font-bold uppercase text-xs">Nenhuma avaliação encontrada</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;