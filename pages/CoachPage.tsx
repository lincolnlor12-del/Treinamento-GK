
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Award, 
  MoreVertical, 
  Shield, 
  Briefcase,
  UserCheck,
  X,
  Save,
  User,
  Camera,
  Upload,
  Trash2,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { Coach } from '../types';

const ROLES = [
  'Treinador Sub-8', 
  'Treinador Sub-9', 
  'Treinador Sub-10', 
  'Treinador Sub-11', 
  'Treinador Sub-12', 
  'Treinador Sub-13', 
  'Treinador Sub-14', 
  'Treinador Sub-15', 
  'Treinador Sub-16', 
  'Treinador Sub-17', 
  'Treinador Sub-20', 
  'Treinador Profissional',
  'Coordenador Técnico'
];

const INITIAL_COACHES: Coach[] = [
  {
    id: '1',
    name: 'Roberto Taffarel',
    role: 'Coordenador Técnico',
    categories: ['Coordenador', 'Profissional'],
    specialty: 'Metodologia de Formação',
    license: 'Licença A CBF',
    email: 'roberto.t@gkpro.com',
    phone: '(11) 98877-6655',
    status: 'Ativo'
  },
  {
    id: '2',
    name: 'Julio Cesar',
    role: 'Treinador Profissional',
    categories: ['Sub-20', 'Profissional'],
    specialty: 'Alto Rendimento',
    license: 'Licença PRO UEFA',
    email: 'julio.c@gkpro.com',
    phone: '(11) 97766-5544',
    status: 'Ativo'
  }
];

const CoachPage: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    license: '',
    email: '',
    phone: '',
    role: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCoaches = coaches.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setFormData({ name: '', license: '', email: '', phone: '', role: '' });
    setPhotoPreview(null);
    setError(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditCoach = (coach: Coach) => {
    setFormData({
      name: coach.name,
      license: coach.license || '',
      email: coach.email || '',
      phone: coach.phone || '',
      role: coach.role
    });
    setPhotoPreview(coach.photo || null);
    setIsEditing(true);
    setEditingId(coach.id);
    setShowForm(true);
  };

  const handleDeleteCoach = (id: string) => {
    setCoaches(prev => prev.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleSaveCoach = () => {
    // Validation
    if (!formData.name.trim() || !formData.role) {
      setError('Por favor, preencha o Nome e selecione o Cargo.');
      return;
    }

    if (isEditing && editingId) {
      setCoaches(prev => prev.map(c => 
        c.id === editingId 
          ? { 
              ...c, 
              name: formData.name, 
              role: formData.role, 
              license: formData.license, 
              email: formData.email, 
              phone: formData.phone, 
              photo: photoPreview || undefined 
            } 
          : c
      ));
    } else {
      const newCoach: Coach = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        role: formData.role,
        categories: [],
        specialty: 'Treinamento de Elite',
        license: formData.license || 'N/A',
        email: formData.email || 'N/A',
        phone: formData.phone || 'N/A',
        status: 'Ativo',
        photo: photoPreview || undefined
      };
      setCoaches([newCoach, ...coaches]);
    }

    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Treinadores</h1>
          <p className="text-gray-400 mt-1">Gestão da comissão técnica e hierarquia de formação</p>
        </div>
        <button 
          onClick={() => { 
            resetForm();
            setShowForm(true); 
          }}
          className="flex items-center justify-center gap-2 gold-gradient text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:brightness-110 transition-all"
        >
          <Plus size={20} />
          Registrar Treinador
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou cargo..." 
          className="w-full pl-12 pr-4 py-3 bg-card border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCoaches.map((coach) => (
          <div key={coach.id} className="bg-card border border-gray-800 rounded-2xl overflow-hidden group hover:border-gold/50 transition-all animate-in slide-in-from-top-2 relative">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-900 border-2 border-gold/30 flex items-center justify-center text-gold font-bold text-xl overflow-hidden uppercase shadow-inner">
                    {coach.photo ? (
                      <img src={coach.photo} alt={coach.name} className="w-full h-full object-cover" />
                    ) : (
                      coach.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{coach.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-black uppercase rounded">
                        {coach.role}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                        <UserCheck size={10} /> {coach.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditCoach(coach)}
                    className="p-2 text-gray-500 hover:text-gold transition-colors"
                    title="Editar Perfil"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(coach.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Excluir Treinador"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Award size={14} className="gold-text" />
                  <span className="font-semibold text-gray-300">{coach.license}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Phone size={14} className="text-gray-500" />
                  <span className="text-gray-300">{coach.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3 p-2">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-400 truncate">{coach.email}</span>
                </div>
              </div>
            </div>

            {/* Confirmação de Exclusão */}
            {showDeleteConfirm === coach.id && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-10 flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase text-xs tracking-widest">Remover Treinador?</h4>
                    <p className="text-gray-400 text-[10px] mt-1">Esta ação não pode ser desfeita.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={() => handleDeleteCoach(coach.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cadastro/Edição Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-card border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-card shrink-0">
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Briefcase className="gold-text" size={18} /> {isEditing ? 'Editar Treinador' : 'Novo Treinador'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo Selection Area */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative group">
                    <label className="block cursor-pointer">
                      <div className="w-32 h-32 rounded-2xl bg-black border-2 border-dashed border-gray-700 overflow-hidden flex flex-col items-center justify-center transition-all group-hover:border-gold group-hover:bg-gray-900 shadow-inner">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-300" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-600 group-hover:text-gold transition-colors">
                            <Camera size={32} />
                            <span className="text-[10px] font-black uppercase mt-2">{isEditing ? 'Trocar Foto' : 'Adicionar Foto'}</span>
                          </div>
                        )}
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                    
                    {photoPreview && (
                      <button 
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-lg shadow-lg hover:bg-red-500 hover:scale-110 transition-all z-10"
                        title="Remover foto"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase text-center max-w-[120px]">JPG, PNG • Máx 2MB</p>
                </div>

                {/* Primary Data */}
                <div className="flex-1 grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Nome Completo *</label>
                    <input 
                      type="text" 
                      placeholder="Nome completo do profissional" 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase">Licença / Qualificação</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Licença A CBF" 
                        className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none" 
                        value={formData.license}
                        onChange={(e) => setFormData({...formData, license: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        placeholder="email@clube.com" 
                        className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000" 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seção Cargo Principal com Barra de Rolagem */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="gold-text" />
                  <label className="text-[10px] font-black text-white uppercase tracking-widest">Cargo Principal (Hierarquia) *</label>
                </div>
                <div className="bg-black/50 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="max-h-56 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
                      {ROLES.map(role => (
                        <button
                          key={role}
                          onClick={() => setFormData({...formData, role})}
                          className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.role === role ? 'bg-gold border-gold text-black scale-105 shadow-gold/20 shadow-lg' : 'bg-black/80 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                        >
                          <div className={`p-2 rounded-lg ${formData.role === role ? 'bg-black/20' : 'bg-gray-900'}`}>
                            <User size={18} />
                          </div>
                          <span className="text-center leading-tight">{role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-card shrink-0">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-8 py-3 rounded-xl border border-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveCoach}
                className="gold-gradient text-black px-12 py-3 rounded-xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95"
              >
                <Save size={18} /> {isEditing ? 'Atualizar Técnico' : 'Salvar Técnico'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachPage;
