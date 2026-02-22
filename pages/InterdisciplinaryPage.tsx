
import React, { useState, useMemo } from 'react';
import { 
  Stethoscope, 
  Activity, 
  Apple, 
  Brain, 
  GraduationCap, 
  Plus, 
  User, 
  X, 
  Trash2, 
  Save, 
  FileText,
  Clock
} from 'lucide-react';
import { useGoalkeepers } from '../context/GoalkeeperContext';
import { SupportArea, SupportRecord } from '../types';

const AREAS: { id: SupportArea; label: string; icon: any; color: string; description: string }[] = [
  { id: 'Medicina', label: 'Medicina', icon: Stethoscope, color: 'text-red-500', description: 'Controle de exames, prontuário e restrições clínicas.' },
  { id: 'Fisioterapia', label: 'Fisioterapia', icon: Activity, color: 'text-blue-500', description: 'Tratamentos, mapa de lesões e prevenção (DM).' },
  { id: 'Nutrição', label: 'Nutrição', icon: Apple, color: 'text-green-500', description: 'Planos alimentares, suplementação e antropometria.' },
  { id: 'Psicologia', label: 'Psicologia', icon: Brain, color: 'text-purple-500', description: 'Estado mental, foco, liderança e suporte emocional.' },
  { id: 'Pedagogia', label: 'Pedagogia', icon: GraduationCap, color: 'text-amber-500', description: 'Acompanhamento escolar e desenvolvimento pessoal.' },
];

const InterdisciplinaryPage: React.FC = () => {
  const { keepers, supportRecords, addSupportRecord, deleteSupportRecord } = useGoalkeepers();
  const [selectedArea, setSelectedArea] = useState<SupportArea>('Medicina');
  const [selectedKeeperId, setSelectedKeeperId] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [newRecord, setNewRecord] = useState<Partial<SupportRecord>>({
    date: new Date().toISOString().split('T')[0],
    professionalName: '',
    status: 'Apto',
    title: '',
    description: ''
  });

  const activeArea = useMemo(() => AREAS.find(a => a.id === selectedArea)!, [selectedArea]);

  const filteredRecords = useMemo(() => {
    return supportRecords
      .filter(r => r.area === selectedArea && (!selectedKeeperId || r.goalkeeperId === selectedKeeperId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [supportRecords, selectedArea, selectedKeeperId]);

  const handleSave = () => {
    if (!selectedKeeperId || !newRecord.title || !newRecord.professionalName) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const record: SupportRecord = {
      ...newRecord as any,
      id: Math.random().toString(36).substr(2, 9),
      goalkeeperId: selectedKeeperId,
      area: selectedArea,
    };

    addSupportRecord(record);
    setShowForm(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      professionalName: '',
      status: 'Apto',
      title: '',
      description: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Apto': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Observação': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Restrição': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Afastado': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Área <span className="gold-text">Interdisciplinar</span></h1>
          <p className="text-gray-400 mt-1">Gestão integrada de saúde, bem-estar e suporte pedagógico</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl">
            <User size={16} className="gold-text" />
            <select 
              value={selectedKeeperId}
              onChange={(e) => setSelectedKeeperId(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase outline-none cursor-pointer pr-4"
            >
              <option value="" className="bg-black">Todos os Goleiros</option>
              {keepers.map(k => (
                <option key={k.id} value={k.id} className="bg-black">{k.name} ({k.category})</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="gold-gradient text-black font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs uppercase hover:brightness-110 transition-all"
          >
            <Plus size={18} /> Novo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {AREAS.map(area => {
          const Icon = area.icon;
          const isActive = selectedArea === area.id;
          return (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${isActive ? 'bg-white/[0.03] border-gold shadow-lg shadow-gold/5' : 'bg-card border-gray-800 hover:border-gray-700'}`}
            >
              <div className={`p-3 rounded-xl bg-gray-900 ${isActive ? area.color : 'text-gray-600'} mb-3`}>
                <Icon size={24} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {area.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${activeArea.color}`}>
              <activeArea.icon size={80} />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-2">{activeArea.label}</h2>
            <p className="text-gray-400 text-sm leading-relaxed relative z-10">
              {activeArea.description}
            </p>
            <div className="mt-8 pt-6 border-t border-gray-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase">Registros no Mês</span>
                <span className="text-white font-black">{filteredRecords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase">Alertas Ativos</span>
                <span className="text-red-500 font-black">{filteredRecords.filter(r => r.status === 'Afastado' || r.status === 'Restrição').length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="gold-text" size={16} /> Linha do Tempo
              </h3>
            </div>
            <div className="divide-y divide-gray-800">
              {filteredRecords.length > 0 ? filteredRecords.map(record => {
                const keeper = keepers.find(k => k.id === record.goalkeeperId);
                return (
                  <div key={record.id} className="p-6 hover:bg-white/[0.01] transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shrink-0 mt-1">
                          {keeper?.photo ? <img src={keeper.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gold">{keeper?.name.charAt(0)}</div>}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                             <h4 className="text-sm font-bold text-white">{record.title}</h4>
                             <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${getStatusBadge(record.status)}`}>
                               {record.status}
                             </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {keeper?.name} • {new Date(record.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-2xl">{record.description}</p>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800/50">
                            <User size={12} className="text-gray-600" />
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Profissional: {record.professionalName}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteSupportRecord(record.id)}
                        className="p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-20 text-center">
                   <FileText size={48} className="text-gray-800 mx-auto mb-4" />
                   <p className="text-gray-500 font-bold uppercase text-xs">Nenhum registro para esta área</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-card border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-card shrink-0">
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <activeArea.icon className={activeArea.color} size={18} /> Novo Registro: {activeArea.label}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-600 uppercase">Atleta</label>
                  <select 
                    value={selectedKeeperId}
                    onChange={(e) => setSelectedKeeperId(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold focus:border-gold outline-none"
                  >
                    <option value="">Selecione...</option>
                    {keepers.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-600 uppercase">Data</label>
                  <input type="date" value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold focus:border-gold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-600 uppercase">Profissional Responsável</label>
                  <input type="text" value={newRecord.professionalName} onChange={e => setNewRecord({...newRecord, professionalName: e.target.value})} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold" placeholder="Nome do profissional" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-600 uppercase">Status de Disponibilidade</label>
                  <select value={newRecord.status} onChange={e => setNewRecord({...newRecord, status: e.target.value as any})} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold">
                    <option value="Apto">Apto para Atividade</option>
                    <option value="Observação">Em Observação</option>
                    <option value="Restrição">Restrição Parcial</option>
                    <option value="Afastado">Afastado (DM/Outros)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase">Título do Registro</label>
                <input type="text" value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs font-bold outline-none focus:border-gold" placeholder="Ex: Avaliação Periódica, Lesão detectada..." />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-600 uppercase">Detalhamento Técnico / Observações</label>
                <textarea rows={4} value={newRecord.description} onChange={e => setNewRecord({...newRecord, description: e.target.value})} className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-gold resize-none" placeholder="Descreva os achados, recomendações ou plano de ação..." />
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-card shrink-0">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-800 text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSave} className="gold-gradient text-black px-8 py-2 rounded-xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95"><Save size={16} /> Salvar Registro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterdisciplinaryPage;
