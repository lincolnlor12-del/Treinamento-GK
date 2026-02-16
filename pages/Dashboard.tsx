
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Trophy, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Clock,
  Filter,
  ChevronRight,
  Target,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Search,
  ShieldX
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useGoalkeepers } from '../context/GoalkeeperContext';
import { CATEGORIES } from '../constants';

const StatCard = ({ title, value, icon: Icon, trend, color, onClick, negative = false }: any) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-gray-800 rounded-2xl p-6 transition-all hover:border-gray-700 ${onClick ? 'cursor-pointer hover:bg-gray-900/50' : ''} group shadow-lg`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gray-900 text-${color}-500 transition-transform group-hover:scale-110 shadow-inner border border-gray-800`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={`${negative ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'} text-[10px] font-black flex items-center px-2 py-0.5 rounded uppercase tracking-tighter`}>
        {negative ? <ArrowUpRight size={12} className="mr-1 rotate-90" /> : <TrendingUp size={12} className="mr-1" />} {trend}
      </span>
      <span className="text-gray-600 text-[9px] font-bold uppercase tracking-tight">Consolidação</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { keepers, scouts } = useGoalkeepers();
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState<string>('Todas');

  const filteredKeepers = useMemo(() => {
    if (selectedDashboardCategory === 'Todas') return keepers;
    return keepers.filter(k => k.category === selectedDashboardCategory);
  }, [keepers, selectedDashboardCategory]);

  const filteredKeeperIds = useMemo(() => filteredKeepers.map(k => k.id), [filteredKeepers]);

  const filteredScouts = useMemo(() => {
    return scouts.filter(s => filteredKeeperIds.includes(s.goalkeeperId));
  }, [scouts, filteredKeeperIds]);

  const aggregates = useMemo(() => {
    return filteredScouts.reduce((acc, s) => {
      // Usamos tanto os erros técnicos gerais quanto os erros críticos específicos (decisivos)
      const technicalErrors = Object.values(s.actions || {}).reduce((sum, a) => sum + a.neg, 0);
      const criticalErrors = s.specialActions?.erroCritico || 0;
      const superSaves = s.specialActions?.superSave || 0;
      const difficultSaves = s.specialActions?.defesaDificil || 0;
      const totalSaves = (s.specialActions?.defesaBasica || 0) + difficultSaves + superSaves;
      
      const goalsFromZones = Object.values(s.goalZones || {}).reduce((sum, z) => sum + (z.goals || 0), 0);
      const goalsConceded = s.cleanSheet ? 0 : Math.max(1, goalsFromZones); 
      const shotsAgainst = totalSaves + goalsConceded;

      return {
        superSaves: acc.superSaves + superSaves,
        technicalErrors: acc.technicalErrors + criticalErrors, // Focamos o card principal nos decisivos
        goalsConceded: acc.goalsConceded + goalsConceded,
        cleanSheets: acc.cleanSheets + (s.cleanSheet ? 1 : 0),
        totalSaves: acc.totalSaves + totalSaves,
        shotsAgainst: acc.shotsAgainst + shotsAgainst,
      };
    }, { 
      superSaves: 0,
      technicalErrors: 0, 
      goalsConceded: 0, 
      cleanSheets: 0, 
      totalSaves: 0, 
      shotsAgainst: 0
    });
  }, [filteredScouts]);

  const technicalCorrections = useMemo(() => {
    return filteredScouts
      .filter(s => (s.specialActions?.erroCritico || 0) > 0 || Object.values(s.actions || {}).reduce((sum, a) => sum + a.neg, 0) > 0)
      .map(s => {
        const errorCount = (s.specialActions?.erroCritico || 0) + Object.values(s.actions || {}).reduce((sum, a) => sum + a.neg, 0);
        return {
          keeperName: keepers.find(k => k.id === s.goalkeeperId)?.name || 'Goleiro',
          errorCount,
          opponent: s.opponent,
          date: s.date,
          critical: (s.specialActions?.erroCritico || 0) > 0
        };
      })
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 4);
  }, [filteredScouts, keepers]);

  const categoryPerformance = useMemo(() => {
    return CATEGORIES.filter(c => c !== 'Coordenador').map(cat => {
      const catKeepers = keepers.filter(k => k.category === cat);
      const catScouts = scouts.filter(s => catKeepers.some(k => k.id === s.goalkeeperId));
      
      let score = 0;
      if (catScouts.length > 0) {
        const totalSaves = catScouts.reduce((sum, s) => 
          sum + (s.specialActions?.defesaBasica || 0) + (s.specialActions?.defesaDificil || 0) + (s.specialActions?.superSave || 0), 0);
        const totalDifficult = catScouts.reduce((sum, s) => sum + (s.specialActions?.defesaDificil || 0) + (s.specialActions?.superSave || 0), 0);
        const totalErrors = catScouts.reduce((sum, s) => sum + (s.specialActions?.erroCritico || 0) * 2 + Object.values(s.actions || {}).reduce((sum, a) => sum + a.neg, 0), 0);
        score = Math.min(100, Math.max(0, (totalSaves * 5 + totalDifficult * 10 - totalErrors * 8) / (catScouts.length || 1) + 60));
      }

      return {
        name: cat,
        avg: Math.round(score),
        count: catKeepers.length
      };
    }).filter(c => c.count > 0 || c.name === selectedDashboardCategory);
  }, [keepers, scouts, selectedDashboardCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Painel de <span className="gold-text">Performance</span></h1>
          <p className="text-gray-400 mt-1">Indicadores globais de rendimento individual e coletivo</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl focus-within:border-gold transition-colors shadow-inner">
            <Filter size={14} className="gold-text" />
            <select 
              value={selectedDashboardCategory}
              onChange={(e) => setSelectedDashboardCategory(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase outline-none cursor-pointer pr-4"
            >
              <option value="Todas" className="bg-black text-white">Todas Categorias</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Clean Sheets" 
          value={aggregates.cleanSheets.toString()} 
          icon={ShieldCheck} 
          trend={`Gols Zero`} 
          color="blue" 
          onClick={() => navigate('/scout')}
        />
        <StatCard 
          title="Super Saves" 
          value={aggregates.superSaves.toString()} 
          icon={Zap} 
          trend={`Milagres`} 
          color="gold" 
          onClick={() => navigate('/scout')}
        />
        <StatCard 
          title="Erros Decisivos" 
          value={aggregates.technicalErrors.toString()} 
          icon={ShieldAlert} 
          trend={`Alerta Crítico`} 
          color="red" 
          negative={true}
          onClick={() => navigate('/scout')}
        />
        <StatCard 
          title="Gols Sofridos" 
          value={aggregates.goalsConceded.toString()} 
          icon={ShieldX} 
          trend={`Total`} 
          color="gray" 
          negative={true}
          onClick={() => navigate('/scout')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-gray-800 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                Evolução Técnica
                <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black uppercase border border-gold/20">
                  {selectedDashboardCategory}
                </span>
              </h2>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryPerformance}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} tick={{fontWeight: 'bold', fill: '#666'}} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tick={{fontWeight: 'bold', fill: '#666'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#D4AF37' }}
                />
                <Area type="monotone" dataKey="avg" stroke="#D4AF37" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={3} animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-6 flex flex-col shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tighter flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={20} />
            Alertas de Falha
          </h2>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {technicalCorrections.length > 0 ? technicalCorrections.map((item, idx) => (
              <div key={idx} className={`p-4 bg-black border ${item.critical ? 'border-red-600/50 shadow-lg shadow-red-900/10' : 'border-gray-800'} rounded-xl group/item transition-all`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-black text-white uppercase truncate">{item.keeperName}</span>
                  <span className={`px-1.5 py-0.5 rounded ${item.critical ? 'bg-red-600 text-white' : 'bg-red-500/10 text-red-500'} text-[9px] font-black`}>
                    {item.errorCount} Erros {item.critical && '!!'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">Partida: vs {item.opponent}</p>
                {item.critical && <p className="text-[8px] text-red-500 font-black uppercase mt-2 animate-pulse">Falha Decisiva Identificada</p>}
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-800 rounded-2xl">
                <ShieldCheck size={32} className="text-gray-700 mb-2" />
                <p className="text-[10px] text-gray-500 font-bold uppercase">Sem registros de falhas técnicas</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/avaliacoes')}
            className="w-full mt-6 py-3 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all"
          >
            Análise Individual
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
