
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goalkeeper, MatchScout, Evaluation } from '../types';

interface GoalkeeperContextType {
  keepers: Goalkeeper[];
  scouts: MatchScout[];
  evaluations: Evaluation[];
  setKeepers: React.Dispatch<React.SetStateAction<Goalkeeper[]>>;
  addKeeper: (keeper: Goalkeeper) => void;
  updateKeeper: (keeper: Goalkeeper) => void;
  deleteKeeper: (id: string) => void;
  addScout: (scout: MatchScout) => void;
  deleteScout: (id: string) => void;
  addEvaluation: (evaluation: Evaluation) => void;
  deleteEvaluation: (id: string) => void;
}

const STORAGE_KEY_KEEPERS = 'gk_pro_keepers';
const STORAGE_KEY_SCOUTS = 'gk_pro_scouts';
const STORAGE_KEY_EVALUATIONS = 'gk_pro_evaluations';

const INITIAL_KEEPERS: Goalkeeper[] = [
  {
    id: '1',
    name: 'Alisson Becker',
    birthDate: '1992-10-02',
    photo: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=250&auto=format&fit=crop',
    category: 'Profissional',
    position: 'Titular',
    height: 191,
    weight: 91,
    wingspan: 198,
    dominantFoot: 'Destro',
    school: 'Internacional',
    clubTime: '4 anos',
    notes: 'Excepcional jogo com os pés.'
  }
];

const GoalkeeperContext = createContext<GoalkeeperContextType | undefined>(undefined);

export const GoalkeeperProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keepers, setKeepers] = useState<Goalkeeper[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_KEEPERS);
    return stored ? JSON.parse(stored) : INITIAL_KEEPERS;
  });

  const [scouts, setScouts] = useState<MatchScout[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SCOUTS);
    return stored ? JSON.parse(stored) : [];
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_KEEPERS, JSON.stringify(keepers));
  }, [keepers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCOUTS, JSON.stringify(scouts));
  }, [scouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(evaluations));
  }, [evaluations]);

  const addKeeper = (keeper: Goalkeeper) => {
    setKeepers(prev => [keeper, ...prev]);
  };

  const updateKeeper = (updatedKeeper: Goalkeeper) => {
    setKeepers(prev => prev.map(k => k.id === updatedKeeper.id ? updatedKeeper : k));
  };

  const deleteKeeper = (id: string) => {
    setKeepers(prev => prev.filter(k => k.id !== id));
  };

  const addScout = (scout: MatchScout) => {
    setScouts(prev => [scout, ...prev]);
  };

  const deleteScout = (id: string) => {
    setScouts(prev => prev.filter(s => s.id !== id));
  };

  const addEvaluation = (evaluation: Evaluation) => {
    setEvaluations(prev => [evaluation, ...prev]);
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  return (
    <GoalkeeperContext.Provider value={{ 
      keepers, 
      scouts, 
      evaluations, 
      setKeepers, 
      addKeeper, 
      updateKeeper, 
      deleteKeeper, 
      addScout, 
      deleteScout,
      addEvaluation,
      deleteEvaluation
    }}>
      {children}
    </GoalkeeperContext.Provider>
  );
};

export const useGoalkeepers = () => {
  const context = useContext(GoalkeeperContext);
  if (!context) {
    throw new Error('useGoalkeepers must be used within a GoalkeeperProvider');
  }
  return context;
};
