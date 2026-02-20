
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Dumbbell, 
  X, 
  Trash2,
  Save,
  Check,
  Edit2,
  VideoOff,
  Youtube,
  Link as LinkIcon,
  Zap,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Play,
  BarChart3,
  LayoutDashboard,
  Target,
  User,
  ShieldAlert,
  Film,
  Activity,
  Move
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { CATEGORIES, EVALUATION_CRITERIA, PHYSICAL_STRUCTURE } from '../constants';
import { Training, Exercise, Category } from '../types';
import { useGoalkeepers } from '../context/GoalkeeperContext';

const TECHNICAL_OPTIONS = [...EVALUATION_CRITERIA.defensive, ...EVALUATION_CRITERIA.offensive];
const TACTICAL_OPTIONS = EVALUATION_CRITERIA.tactical;
const BEHAVIORAL_OPTIONS = EVALUATION_CRITERIA.behavioral;

const getYoutubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const generateCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (Date | null)[] = [];
  // Add empty placeholders for days before the month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add the actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

const ScrollList = ({ items, selectedItems, onToggle, label, compact = false, icon: Icon }: { items: string[], selectedItems: string[], onToggle: (val: string) => void, label: string, compact?: boolean, icon?: any }) => (
  <div className="flex flex-col w-full h-full">
    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase mb-1 tracking-tight">
      {Icon && <Icon size={10} className="text-gold" />} {label}
    </label>
    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden flex-1 min-h-[80px]">
      <div className={`overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar ${compact ? 'max-h-24' : 'max-h-40'}`}>
        {items.map(item => (
          <div 
            key={item}
            onClick={() => onToggle(item)}
            className={`flex items-center justify-between p-1 rounded cursor-pointer transition-all ${selectedItems.includes(item) ? 'bg-gold/10 border border-gold/20' : 'hover:bg-gray-900 border border-transparent'}`}
          >
            <span className={`text-[10px] font-medium truncate leading-none ${selectedItems.includes(item) ? 'gold-text' : 'text-gray-400'}`}>{item}</span>
            <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${selectedItems.includes(item) ? 'bg-gold border-gold' : 'border-gray-700'}`}>
              {selectedItems.includes(item) && <Check size={8} className="text-black font-bold" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TrainingPage: React.FC = () => {
  const { keepers, trainings, addTraining, updateTraining, deleteTraining } = useGoalkeepers();
  const [viewMode, setViewMode] = useState<'daily' | 'stats'>('daily');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [statsCategory, setStatsCategory] = useState<Category | 'Todas'>('Todas');
  const [statsKeeper, setStatsKeeper] = useState<string>('Todos');

  const calendarDays = useMemo(() => generateCalendarDays(currentMonth), [currentMonth]);

  const [newTraining, setNewTraining] = useState<Partial<Training>>({
    date: new Date().toISOString().split('T')[0],
    category: 'Sub-15',
    goalkeepers: [],
    technicalObjective: [],
    physicalObjective: [],
    tacticalObjective: [],
    behavioralObjective: [],
    exercises: [],
    videoUrl: ''
  });

  const filteredKeepersForForm = keepers.filter(k => k.category === newTraining.category);

  const displayedTrainings = useMemo(() => {
    return selectedDate 
      ? trainings.filter(t => t.date === selectedDate)
      : trainings;
  }, [trainings, selectedDate]);

  const stats = useMemo(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    
    const monthTrainings = trainings.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      const isCorrectMonth = d.getMonth() === month && d.getFullYear() === year;
      const categoryMatch = statsCategory === 'Todas' || t.category === statsCategory;
      const keeperMatch = statsKeeper === 'Todos' || t.goalkeepers.includes(statsKeeper);
      return isCorrectMonth && categoryMatch && keeperMatch;
    });

    const groups: Record<string, Record<string, number>> = {
      'Técnico': {},
      'Tático': {},
      'Físico': {},
      'Comportamental': {}
    };

    monthTrainings.forEach(t => {
      (t.technicalObjective || []).forEach(v => groups['Técnico'][v] = (groups['Técnico'][v] || 0) + 1);
      (t.tacticalObjective || []).forEach(v => groups['Tático'][v] = (groups['Tático'][v] || 0) + 1);
      (t.physicalObjective || []).forEach(v => groups['Físico'][v] = (groups['Físico'][v] || 0) + 1);
      (t.behavioralObjective || []).forEach(v => groups['Comportamental'][v] = (groups['Comportamental'][v] || 0) + 1);
    });

    return {
      totalSessions: monthTrainings.length,
      groups: Object.entries(groups).map(([name, items]) => ({
        name,
        data: Object.entries(items).map(([subject, value]) => ({
          subject: subject.length > 15 ? subject.substring(0, 12) + '...' : subject,
          fullSubject: subject,
          value
        })).sort((a, b) => b.value - a.value)
      }))
    };
  }, [trainings, currentMonth, statsCategory, statsKeeper]);

  const toggleSelection = (field: keyof Training, value: string) => {
    const current = (newTraining[field] as string[]) || [];
    const updated = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    setNewTraining({...newTraining, [field]: updated});
  };

  const handleSaveTraining = () => {
    const training: Training = {
      ...newTraining as Training,
      id: isEditing ? newTraining.id! : Math.random().toString(36).substr(2, 9),
      exercises: newTraining.exercises || [],
      goalkeepers: newTraining.goalkeepers || [],
      videoUrl: newTraining.videoUrl || ''
    };

    if (isEditing) {
      updateTraining(training);
    } else {
      addTraining(training);
    }
    setShowForm(false);
  };

  const videoId = useMemo(() => getYoutubeId(newTraining.videoUrl || ''), [newTraining.videoUrl]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Gestão de Treinamento</h1>
          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => setViewMode('daily')}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${viewMode === 'daily' ? 'border-gold text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Sessões Diárias
            </button>
            <button 
              onClick={() => setViewMode('stats')}
              className={`text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all ${viewMode === 'stats' ? 'border-gold text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              Quantificação (Mesociclo)
            </button>
          </div>
        </div>
        
        {viewMode === 'daily' && (
          <button 
            onClick={() => {
              setNewTraining({ date: selectedDate || new Date().toISOString().split('T')[0], category: 'Sub-15', goalkeepers: [], technicalObjective: [], physicalObjective: [], tacticalObjective: [], behavioralObjective: [], exercises: [], videoUrl: '' });
              setIsEditing(false);
              setShowForm(true);
            }}
            className="gold-gradient text-black font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs uppercase hover:brightness-110 transition-all"
          >
            <Plus size={18} /> Nova Sessão
          </button>
        )}
      </div>

      {viewMode === 'daily' ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          <div className="bg-card border border-gray-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
                <CalendarIcon size={14} className="gold-text" /> Calendário
              </h2>
              <div className="flex gap-1 items-center">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:text-gold text-gray-600 transition-colors"><ChevronLeft size={16}/></button>
                <span className="text-[10px] font-bold text-white w-20 text-center uppercase tracking-widest">
                  {currentMonth.toLocaleString('pt-BR', { month: 'short' })} {currentMonth.getFullYear()}
                </span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:text-gold text-gray-600 transition-colors"><ChevronRight size={16}/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-[9px] font-bold text-gray-700 uppercase">{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;
                
                const dateStr = day.toISOString().split('T')[0];
                const hasTraining = trainings.some(t => t.date === dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button 
                    key={dateStr} 
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold border transition-all relative
                      ${isSelected 
                        ? 'bg-gold border-gold text-black' 
                        : hasTraining 
                          ? 'bg-gold/10 border-gold/40 text-gold' 
                          : 'bg-black border-gray-900 text-gray-600 hover:border-gray-700'}
                      ${isToday && !isSelected ? 'border-gold/60' : ''}
                    `}
                  >
                    {day.getDate()}
                    {isToday && <span className="absolute bottom-0.5 w-1 h-1 bg-gold rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-3 space-y-4">
            {displayedTrainings.map(t => (
              <div key={t.id} className="bg-card border border-gray-800 rounded-2xl p-5 hover:border-gold/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center text-black font-black uppercase">GK</div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      {t.videoUrl && <Youtube size={14} className="text-red-500" />}
                    </h3>
                    <p className="text-[10px] gold-text font-black uppercase">{t.category}</p>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">
                      {t.goalkeepers.length} Goleiro(s) Participante(s)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setNewTraining(t); setIsEditing(true); setShowForm(true); }} className="p-2 text-gray-500 hover:text-gold"><Edit2 size={16}/></button>
                  <button onClick={() => deleteTraining(t.id)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {displayedTrainings.length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                 <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">Nenhuma sessão registrada para este filtro</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card border border-gray-800 p-6 rounded-2xl shadow-lg">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Mesociclo</label>
              <div className="flex items-center gap-4 bg-black p-2.5 rounded-xl border border-gray-800 text-white font-bold text-xs uppercase">
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="text-gold"><ChevronLeft size={16}/></button>
                 <span className="flex-1 text-center">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="text-gold"><ChevronRight size={16}/></button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Filtrar Categoria</label>
              <select 
                value={statsCategory} 
                onChange={e => { 
                  setStatsCategory(e.target.value as any); 
                  setStatsKeeper('Todos'); 
                }} 
                className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-gold"
              >
                <option value="Todas">Todas</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Filtrar Goleiro</label>
              <select 
                value={statsKeeper} 
                onChange={e => setStatsKeeper(e.target.value)} 
                className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-gold"
              >
                <option value="Todos">Todos</option>
                {keepers.filter(k => statsCategory === 'Todas' || k.category === statsCategory).map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.groups.map(group => (
              <div key={group.name} className="bg-card border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <h3 className="text-xs font-black text-gold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                  <BarChart3 size={14} /> Bloco {group.name}
                </h3>
                <div className="h-[300px] w-full mt-4 flex items-center justify-center relative z-10">
                  {group.data.length >= 3 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={group.data}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#666', fontSize: 9, fontWeight: 700 }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 'auto']} 
                          tick={false} 
                          axisLine={false} 
                        />
                        <Radar
                          name={group.name}
                          dataKey="value"
                          stroke="#D4AF37"
                          fill="#D4AF37"
                          fillOpacity={0.4}
                          strokeWidth={2}
                          animationDuration={1500}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111', 
                            border: '1px solid #333', 
                            borderRadius: '12px', 
                            fontSize: '10px', 
                            color: '#fff' 
                          }}
                          itemStyle={{ color: '#D4AF37' }}
                          formatter={(value: any, name: any, props: any) => [value, props.payload.fullSubject]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : group.data.length > 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
                       <div className="space-y-3 w-full max-w-[250px]">
                          {group.data.map((item: any) => (
                            <div key={item.fullSubject} className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                <span>{item.fullSubject}</span>
                                <span className="gold-text">{item.value}x</span>
                              </div>
                              <div className="h-1 bg-black border border-gray-800 rounded-full overflow-hidden">
                                <div className="h-full gold-gradient rounded-full" style={{ width: `${(item.value / stats.totalSessions) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                       </div>
                       <p className="text-[9px] text-gray-600 italic uppercase">Gráfico de Teia requer pelo menos 3 objetivos trabalhados</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                      <BarChart3 size={32} className="text-gray-600 mb-2" />
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sem registros neste período</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-card border border-gray-800 w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-card shrink-0">
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Dumbbell className="gold-text" size={18} /> {isEditing ? 'Editar Sessão' : 'Lançar Treino'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-black text-gray-600 uppercase">Data</label>
                        <input type="date" value={newTraining.date} onChange={e => setNewTraining({...newTraining, date: e.target.value})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-xs text-white outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-600 uppercase">Categoria</label>
                        <select value={newTraining.category} onChange={e => setNewTraining({...newTraining, category: e.target.value as Category, goalkeepers: []})} className="w-full p-2 bg-black border border-gray-800 rounded-lg text-xs text-white outline-none">
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase">Goleiros Participantes</label>
                      <div className="max-h-32 overflow-y-auto bg-black border border-gray-800 rounded-lg p-1 space-y-1 custom-scrollbar">
                        {filteredKeepersForForm.length > 0 ? filteredKeepersForForm.map(k => (
                          <button key={k.id} onClick={() => toggleSelection('goalkeepers', k.id)} className={`w-full p-2 text-left text-[9px] font-bold rounded border transition-all ${newTraining.goalkeepers?.includes(k.id) ? 'bg-gold/10 border-gold gold-text' : 'bg-black border-transparent text-gray-500 hover:bg-gray-900'}`}>
                            {k.name}
                          </button>
                        )) : <p className="p-2 text-[9px] text-gray-600 italic">Nenhum goleiro nesta categoria</p>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-800">
                      <label className="text-[9px] font-black text-gray-600 uppercase flex items-center gap-1">
                        <Youtube size={12} className="text-red-500" /> Vídeo de Referência (YouTube)
                      </label>
                      <input 
                        type="url" 
                        placeholder="Link da sessão ou exercício..." 
                        value={newTraining.videoUrl || ''} 
                        onChange={e => setNewTraining({...newTraining, videoUrl: e.target.value})}
                        className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-gold transition-all"
                      />
                      <div className="aspect-video bg-black border border-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative group">
                        {videoId ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-700">
                            <VideoOff size={32} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Aguardando Link Válido</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScrollList label="Conteúdo Técnico Principal" icon={Target} items={TECHNICAL_OPTIONS} selectedItems={newTraining.technicalObjective || []} onToggle={v => toggleSelection('technicalObjective', v)} />
                    <ScrollList label="Conteúdo Tático Principal" icon={Move} items={TACTICAL_OPTIONS} selectedItems={newTraining.tacticalObjective || []} onToggle={v => toggleSelection('tacticalObjective', v)} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-800/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Dumbbell size={14} className="gold-text" /> Treino Acadêmico / Fisiologia
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                       <ScrollList label="MMSS" items={PHYSICAL_STRUCTURE.academic.mmss} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="MMII" items={PHYSICAL_STRUCTURE.academic.mmii} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="Core / Estabilidade" items={PHYSICAL_STRUCTURE.academic.core} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="Mobilidade" items={PHYSICAL_STRUCTURE.academic.mobility} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-800/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-blue-500" /> Treino de Campo / Específico
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                       <ScrollList label="Velocidade" items={PHYSICAL_STRUCTURE.academic.maxSpeed} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="Reação" items={['Reação de Campo', 'Reação Cognitiva', 'Reação de Bloqueio']} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="Agilidade" items={['Agilidade Específica', 'Agilidade em Circuito', 'Agilidade Lateral']} selectedItems={newTraining.physicalObjective || []} onToggle={v => toggleSelection('physicalObjective', v)} compact />
                       <ScrollList label="Comportamental" items={BEHAVIORAL_OPTIONS} selectedItems={newTraining.behavioralObjective || []} onToggle={v => toggleSelection('behavioralObjective', v)} compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-card shrink-0">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-800 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSaveTraining} className="gold-gradient text-black px-8 py-2 rounded-xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95"><Save size={16} /> Salvar Sessão</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
