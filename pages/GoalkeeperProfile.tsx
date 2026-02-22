import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoalkeepers } from '../context/GoalkeeperContext';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Ruler, 
  Weight, 
  Shield, 
  Activity,
  Brain,
  Crosshair
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

const GoalkeeperProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { keepers, evaluations } = useGoalkeepers();

  const keeper = keepers.find(k => k.id === id);
  const keeperEvaluations = evaluations.filter(e => e.goalkeeperId === id);

  const latestEvaluation = keeperEvaluations.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  const calculateAverage = (records: Record<string, number> | undefined) => {
    if (!records) return 0;
    const values = Object.values(records);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const radarData = useMemo(() => {
    if (!latestEvaluation) return [];
    return [
      { subject: 'Técnica Defensiva', A: calculateAverage(latestEvaluation.technicalDefensive), fullMark: 5 },
      { subject: 'Técnica Ofensiva', A: calculateAverage(latestEvaluation.technicalOffensive), fullMark: 5 },
      { subject: 'Tática', A: calculateAverage(latestEvaluation.tactical), fullMark: 5 },
      { subject: 'Física', A: calculateAverage(latestEvaluation.physical), fullMark: 5 },
      { subject: 'Comportamental', A: calculateAverage(latestEvaluation.behavioral), fullMark: 5 },
    ];
  }, [latestEvaluation]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!keeper) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h2 className="text-2xl font-bold mb-4">Goleiro não encontrado</h2>
        <button 
          onClick={() => navigate('/goleiros')}
          className="px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/goleiros')}
          className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Perfil do Atleta</h1>
          <p className="text-gray-400 mt-1">Visão geral e desempenho</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden lg:col-span-1">
          <div className="h-32 gold-gradient relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-900 border-4 border-card overflow-hidden shadow-lg">
                {keeper.photo ? (
                  <img src={keeper.photo} alt={keeper.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold font-bold text-4xl bg-gray-900">
                    {keeper.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-16 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{keeper.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <Shield size={14} className="gold-text" />
                  <span className="gold-text font-bold">{keeper.category}</span>
                  <span>•</span>
                  <span>{keeper.position}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                <Calendar className="text-gray-500" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Idade</p>
                  <p className="text-sm font-semibold text-white">{calculateAge(keeper.birthDate)} anos</p>
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                <Ruler className="text-gray-500" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Altura</p>
                  <p className="text-sm font-semibold text-white">{keeper.height} cm</p>
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                <Weight className="text-gray-500" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Peso</p>
                  <p className="text-sm font-semibold text-white">{keeper.weight} kg</p>
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                <User className="text-gray-500" size={18} />
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pé Dominante</p>
                  <p className="text-sm font-semibold text-white">{keeper.dominantFoot}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Observações</h3>
              <p className="text-sm text-gray-300 bg-black/40 p-4 rounded-xl border border-gray-800">
                {keeper.notes || 'Nenhuma observação registrada.'}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="lg:col-span-2 space-y-6">
          {latestEvaluation ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity className="gold-text" size={16} /> Nível Geral (Última Avaliação)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#555' }} />
                        <Radar name="Nível" dataKey="A" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.4} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#121212', borderColor: '#333', color: '#fff' }}
                          itemStyle={{ color: '#D4AF37' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-gray-800 rounded-2xl p-6 flex flex-col justify-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Brain className="gold-text" size={16} /> Resumo de Atributos
                  </h3>
                  <div className="space-y-4">
                    {radarData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-medium">{item.subject}</span>
                          <span className="text-white font-bold">{item.A.toFixed(1)} / 5.0</span>
                        </div>
                        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full gold-gradient rounded-full" 
                            style={{ width: `${(item.A / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="bg-card border border-gray-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Crosshair className="gold-text" size={16} /> Detalhamento de Atributos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Técnica Defensiva</h4>
                    <div className="space-y-3">
                      {Object.entries(latestEvaluation.technicalDefensive).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                          <span className="text-xs text-gray-300">{key}</span>
                          <span className="text-xs font-bold text-gold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Técnica Ofensiva</h4>
                    <div className="space-y-3">
                      {Object.entries(latestEvaluation.technicalOffensive).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                          <span className="text-xs text-gray-300">{key}</span>
                          <span className="text-xs font-bold text-gold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Tática</h4>
                    <div className="space-y-3">
                      {Object.entries(latestEvaluation.tactical).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                          <span className="text-xs text-gray-300">{key}</span>
                          <span className="text-xs font-bold text-gold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Física</h4>
                    <div className="space-y-3">
                      {Object.entries(latestEvaluation.physical).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                          <span className="text-xs text-gray-300">{key}</span>
                          <span className="text-xs font-bold text-gold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Comportamental</h4>
                    <div className="space-y-3">
                      {Object.entries(latestEvaluation.behavioral).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                          <span className="text-xs text-gray-300">{key}</span>
                          <span className="text-xs font-bold text-gold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-gray-600 mb-4">
                <Activity size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sem Avaliações</h3>
              <p className="text-gray-500 text-sm max-w-md">
                Este goleiro ainda não possui avaliações registradas. Realize uma avaliação para visualizar os gráficos de desempenho.
              </p>
              <button 
                onClick={() => navigate('/avaliacoes', { state: { keeperId: keeper.id } })}
                className="mt-6 px-6 py-2 border border-gold text-gold rounded-xl hover:bg-gold/10 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                Avaliar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalkeeperProfile;
