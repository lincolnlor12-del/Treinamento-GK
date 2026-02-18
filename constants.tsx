
import React from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Dumbbell, 
  BarChart3, 
  LayoutDashboard, 
  Target, 
  Shield,
  Briefcase,
  HeartPulse
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Sub-8', 'Sub-9', 'Sub-10', 'Sub-11', 'Sub-12', 'Sub-13', 
  'Sub-14', 'Sub-15', 'Sub-16', 'Sub-17', 'Sub-20', 'Profissional', 'Coordenador'
];

export const NAVIGATION = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
  { name: 'Goleiros', icon: <Users size={20} />, path: '/goleiros' },
  { name: 'Treinadores', icon: <Briefcase size={20} />, path: '/treinadores' },
  { name: 'Avaliações', icon: <ClipboardCheck size={20} />, path: '/avaliacoes' },
  { name: 'Treinamentos', icon: <Dumbbell size={20} />, path: '/treinamentos' },
  { name: 'Scout de Jogo', icon: <Target size={20} />, path: '/scout' },
  { name: 'Interdisciplinar', icon: <HeartPulse size={20} />, path: '/interdisciplinar' },
  { name: 'Relatórios', icon: <BarChart3 size={20} />, path: '/relatorios' },
];

export const PHYSICAL_STRUCTURE = {
  academic: {
    mmss: ['MMSS - Força', 'MMSS - Resistência', 'MMSS - Hipertrofia'],
    mmii: ['MMII - Força', 'MMII - Resistência', 'MMII - Hipertrofia'],
    power: ['Potência Muscular', 'Potência de Salto', 'Pliometria'],
    maxStrength: ['Força Máxima (MMII)', 'Força Máxima (MMSS)'],
    maxSpeed: ['Velocidade Máxima', 'Aceleração Linear'],
    core: ['Core - Estabilidade', 'Core - Dinâmico', 'Anti-rotação'],
    mobility: ['Mobilidade Quadril', 'Mobilidade Tornozelo', 'Mobilidade Ombro']
  },
  field: [
    'Velocidade Específica',
    'Reação de Campo',
    'Agilidade Específica',
    'Resistência Específica',
    'Coordenação Motora'
  ]
};

export const EVALUATION_CRITERIA = {
  defensive: [
    'Defesa em pé', 'Encaixe abdômen', 'Entrada', 'Entrada completa', 'Punho',
    'Quedas Alta', 'Mão trocada', 'Quedas Rasteira', 'Quedas Meia altura',
    'Saídas de gol Enfrentamento', 'Saídas de gol Alta', 'Saídas de gol Alta direcionada', 'Saídas de gol Rasteira',
    'Expectativa Base', 'Expectativa Posição', 'Passada cruzada', 'Passada lateral',
    'Rebotes direcionados', 'Improviso', 'Balanço', 'Giro'
  ],
  offensive: [
    'Tiro de meta', 'Reposição de mão', 'Reposição voleio', 'Bola ao chão',
    'Domínio', 'Passe curto', 'Passe médio', 'Passe longo'
  ],
  tactical: [
    'Bissetriz', 'Cruzamentos', 'Bolas paradas', 'Organização ofensiva',
    'Transição defensiva', 'Organização defensiva', 'Transição ofensiva'
  ],
  physical: [
    'Antropometria/Estatura',
    'Força',
    'Potência',
    'Velocidade',
    'Reação',
    'Agilidade',
    'Mobilidade',
    'Resistência específica',
    'Coordenação motora'
  ],
  behavioral: [
    'Comunicação', 'Liderança', 'Concentração', 'Competitividade', 'Tomada de decisão', 'Controle emocional'
  ]
};
