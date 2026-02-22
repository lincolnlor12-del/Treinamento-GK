import React, { useState } from 'react';
import { useGoalkeepers } from '../../context/GoalkeeperContext';
import { Shield, Zap, Trophy, ShieldAlert } from 'lucide-react';
import PropTypes from 'prop-types';

const ActionCounter = ({ label, value, onIncrement, onDecrement, icon: Icon, iconColor, isNegative = false }) => (
  <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-gray-800">
    <div className="flex items-center gap-3">
      <Icon size={20} className={iconColor} />
      <span className="text-sm font-bold text-white uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onDecrement} className="w-8 h-8 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 font-bold flex items-center justify-center">-</button>
      <span className={`w-6 text-center text-lg font-black ${isNegative ? 'text-red-500' : 'text-white'}`}>{value}</span>
      <button onClick={onIncrement} className={`w-8 h-8 rounded-lg border font-bold flex items-center justify-center ${isNegative ? 'bg-red-600 border-red-500 text-white' : 'bg-gold border-gold text-black'}`}>+</button>
    </div>
  </div>
);

ActionCounter.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string.isRequired,
  isNegative: PropTypes.bool
};

const GameScout: React.FC = () => {
  const { keepers } = useGoalkeepers();
  const [selectedKeeper, setSelectedKeeper] = useState('');
  const [opponent, setOpponent] = useState('');
  const [cleanSheet, setCleanSheet] = useState(false);
  const [goalParticipation, setGoalParticipation] = useState(false);

  const [actions, setActions] = useState({
    defesaBasica: 0,
    defesaDificil: 0,
    superSave: 0,
    erroCritico: 0,
  });

  const handleActionChange = (action: keyof typeof actions, delta: number) => {
    setActions(prev => ({ ...prev, [action]: Math.max(0, prev[action] + delta) }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-card border border-gray-800 rounded-3xl p-6 shadow-xl h-min sticky top-20">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Atleta</label>
            <select 
              value={selectedKeeper} 
              onChange={(e) => setSelectedKeeper(e.target.value)} 
              className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-sm font-bold outline-none focus:border-gold"
            >
              <option value="">Selecione...</option>
              {keepers.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">Adversário</label>
            <input 
              type="text" 
              value={opponent} 
              onChange={(e) => setOpponent(e.target.value)} 
              placeholder="Ex: Grêmio"
              className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-sm font-bold outline-none focus:border-gold" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <button 
              onClick={() => setCleanSheet(!cleanSheet)}
              className={`py-3 rounded-xl text-xs font-black uppercase transition-all border ${cleanSheet ? 'bg-green-600 text-white border-green-500' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>
              Clean Sheet
            </button>
            <button 
              onClick={() => setGoalParticipation(!goalParticipation)}
              className={`py-3 rounded-xl text-xs font-black uppercase transition-all border ${goalParticipation ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-900 text-gray-400 border-gray-800'}`}>
              Part. em Gol
            </button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-4">
        <ActionCounter 
          label="Defesa Básica (+)" 
          value={actions.defesaBasica} 
          onIncrement={() => handleActionChange('defesaBasica', 1)} 
          onDecrement={() => handleActionChange('defesaBasica', -1)} 
          icon={Shield} 
          iconColor="text-blue-500"
        />
        <ActionCounter 
          label="Defesa Difícil (+)" 
          value={actions.defesaDificil} 
          onIncrement={() => handleActionChange('defesaDificil', 1)} 
          onDecrement={() => handleActionChange('defesaDificil', -1)} 
          icon={Zap} 
          iconColor="text-yellow-500"
        />
        <ActionCounter 
          label="Super Save (+)" 
          value={actions.superSave} 
          onIncrement={() => handleActionChange('superSave', 1)} 
          onDecrement={() => handleActionChange('superSave', -1)} 
          icon={Trophy} 
          iconColor="text-green-500"
        />
        <ActionCounter 
          label="Erro Crítico (-)" 
          value={actions.erroCritico} 
          onIncrement={() => handleActionChange('erroCritico', 1)} 
          onDecrement={() => handleActionChange('erroCritico', -1)} 
          icon={ShieldAlert} 
          iconColor="text-red-500"
          isNegative
        />
      </div>
    </div>
  );
};

export default GameScout;
