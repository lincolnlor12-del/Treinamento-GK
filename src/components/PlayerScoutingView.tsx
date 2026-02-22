import React, { useState, useMemo } from 'react';
import { useGoalkeepers } from '../../context/GoalkeeperContext';
import { User, Calendar, ShieldCheck, ShieldAlert, Target } from 'lucide-react';

const PlayerScoutingView: React.FC = () => {
  const { keepers, scouts } = useGoalkeepers();
  const [selectedKeeperId, setSelectedKeeperId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const filteredScouts = useMemo(() => {
    return scouts.filter(scout => {
      const keeperMatch = !selectedKeeperId || scout.goalkeeperId === selectedKeeperId;
      const dateMatch = !selectedDate || scout.date === selectedDate;
      return keeperMatch && dateMatch;
    });
  }, [scouts, selectedKeeperId, selectedDate]);

  const metrics = useMemo(() => {
    if (filteredScouts.length === 0) {
      return { totalSaves: 0, cleanSheets: 0, goalsConceded: 0 };
    }

    const totalSaves = filteredScouts.reduce((sum, s) => sum + (s.specialActions?.defesaBasica || 0) + (s.specialActions?.defesaDificil || 0) + (s.specialActions?.superSave || 0), 0);
    const cleanSheets = filteredScouts.filter(s => s.cleanSheet).length;
    const goalsConceded = filteredScouts.reduce((sum, s) => sum + Object.values(s.goalZones || {}).reduce((zsum, z) => zsum + (z.goals || 0), 0), 0);
    
    return { totalSaves, cleanSheets, goalsConceded };
  }, [filteredScouts]);

  return (
    <div className="space-y-6">
      <div className="bg-card border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Filtros de Scout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Goleiro</label>
            <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl">
              <User size={16} className="text-gray-500" />
              <select
                value={selectedKeeperId}
                onChange={(e) => setSelectedKeeperId(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
              >
                <option value="">Todos os Goleiros</option>
                {keepers.map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
            <div className="flex items-center gap-2 mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Target size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-400">Total de Defesas</p>
              <p className="text-2xl font-bold text-white">{metrics.totalSaves}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <ShieldCheck size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-400">Clean Sheets</p>
              <p className="text-2xl font-bold text-white">{metrics.cleanSheets}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <ShieldAlert size={24} className="text-red-500" />
            <div>
              <p className="text-sm text-gray-400">Gols Sofridos</p>
              <p className="text-2xl font-bold text-white">{metrics.goalsConceded}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-gray-800 rounded-2xl">
        <h2 className="text-lg font-bold text-white p-6 border-b border-gray-800">Scouts Encontrados ({filteredScouts.length})</h2>
        <div className="divide-y divide-gray-800">
          {filteredScouts.length > 0 ? filteredScouts.map(scout => {
            const keeper = keepers.find(k => k.id === scout.goalkeeperId);
            return (
              <div key={scout.id} className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-white">{keeper?.name || 'Desconhecido'}</p>
                    <p className="text-sm text-gray-400">vs {scout.opponent} em {new Date(scout.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                     <p className={`font-bold ${scout.cleanSheet ? 'text-green-500' : 'text-gray-300'}`}>{scout.cleanSheet ? 'Clean Sheet' : 'Com Gols'}</p>
                     <p className="text-sm text-gray-400">{scout.minutesPlayed} min jogados</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="p-6 text-gray-500">Nenhum scout encontrado para os filtros selecionados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerScoutingView;
