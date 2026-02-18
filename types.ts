
export type Category = 'Sub-8' | 'Sub-9' | 'Sub-10' | 'Sub-11' | 'Sub-12' | 'Sub-13' | 'Sub-14' | 'Sub-15' | 'Sub-16' | 'Sub-17' | 'Sub-20' | 'Profissional' | 'Coordenador';

export interface Goalkeeper {
  id: string;
  name: string;
  birthDate: string;
  photo?: string;
  category: Category;
  position: 'Titular' | 'Reserva' | 'Avaliação';
  height: number;
  weight: number;
  wingspan: number;
  dominantFoot: 'Destro' | 'Canhoto' | 'Ambidestro';
  school: string;
  clubTime: string;
  notes: string;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  categories: Category[];
  specialty: string;
  license: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Férias' | 'Licença';
  photo?: string;
}

export interface Evaluation {
  id: string;
  goalkeeperId: string;
  date: string;
  technicalDefensive: Record<string, number>;
  technicalOffensive: Record<string, number>;
  tactical: Record<string, number>;
  physical: Record<string, number>;
  behavioral: Record<string, number>;
  frequency: 'Nulo' | '1x' | '2x' | '3x';
  observations: string;
  highlightsLink?: string;
  improvementsLink?: string;
}

export interface Training {
  id: string;
  date: string;
  category: Category;
  goalkeepers: string[];
  technicalObjective: string[];
  physicalObjective: string[];
  tacticalObjective: string[];
  behavioralObjective?: string[];
  exercises: Exercise[];
  videoUrl?: string;
}

export interface Exercise {
  id: string;
  description: string;
  duration: string;
  intensity: 'Baixa' | 'Média' | 'Alta';
  notes: string;
}

export interface MatchScout {
  id: string;
  goalkeeperId: string;
  opponent: string;
  date: string;
  competition: string;
  result: string;
  cleanSheet: boolean;
  goalParticipation: boolean;
  assists?: number;
  goalsScored?: number;
  penalties?: {
    pos: number;
    neg: number;
  };
  minutesPlayed: number;
  matchPosition: 'Titular' | 'Reserva';
  actions: Record<string, { pos: number, neg: number }>;
  specialActions: {
    defesaBasica: number;
    defesaDificil: number;
    superSave: number;
    erroCritico: number;
  };
  pitchZones: Record<number, number>; 
  goalZones: Record<number, { saves: number, goals: number }>;
}

export type SupportArea = 'Medicina' | 'Fisioterapia' | 'Nutrição' | 'Psicologia' | 'Pedagogia';

export interface SupportRecord {
  id: string;
  goalkeeperId: string;
  date: string;
  area: SupportArea;
  professionalName: string;
  status: 'Apto' | 'Restrição' | 'Afastado' | 'Observação';
  title: string;
  description: string;
}
