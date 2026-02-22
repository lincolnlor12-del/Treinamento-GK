import React from 'react';
import PlayerScoutingView from '../src/components/PlayerScoutingView';

const PlayerScoutingPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white uppercase tracking-tighter mb-4">Análise de Scout</h1>
      <PlayerScoutingView />
    </div>
  );
};

export default PlayerScoutingPage;
