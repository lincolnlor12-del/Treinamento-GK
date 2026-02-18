
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Shield, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Camera, 
  Upload, 
  AlertCircle,
  User,
  Calendar,
  Ruler,
  Weight,
  Target
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Goalkeeper, Category } from '../types';
import { useGoalkeepers } from '../context/GoalkeeperContext';

const GoalkeeperList: React.FC = () => {
  const navigate = useNavigate();
  const { keepers, addKeeper, updateKeeper, deleteKeeper } = useGoalkeepers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Goalkeeper>>({
    name: '',
    birthDate: '',
    category: 'Sub-15',
    position: 'Titular',
    height: 0,
    weight: 0,
    wingspan: 0,
    dominantFoot: 'Destro',
    school: '',
    clubTime: '',
    notes: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredKeepers = keepers.filter(k => 
    (selectedCategory === 'Todas' || k.category === selectedCategory) &&
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      category: 'Sub-15',
      position: 'Titular',
      height: 0,
      weight: 0,
      wingspan: 0,
      dominantFoot: 'Destro',
      school: '',
      clubTime: '',
      notes: ''
    });
    setPhotoPreview(null);
    setError(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveKeeper = () => {
    if (!formData.name?.trim() || !formData.category || !formData.birthDate) {
      setError('Por favor, preencha Nome, Categoria e Data de Nascimento.');
      return;
    }

    const keeperData = {
      ...formData,
      id: isEditing && editingId ? editingId : Math.random().toString(36).substr(2, 9),
      photo: photoPreview || undefined
    } as Goalkeeper;

    if (isEditing) {
      updateKeeper(keeperData);
    } else {
      addKeeper(keeperData);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEditKeeper = (keeper: Goalkeeper) => {
    setFormData(keeper);
    setPhotoPreview(keeper.photo || null);
    setIsEditing(true);
    setEditingId(keeper.id);
    setShowForm(true);
  };

  const handleDeleteKeeper = (id: string) => {
    deleteKeeper(id);
    setShowDeleteConfirm(null);
  };

  const handleEvaluate = (keeperId: string) => {
    navigate('/avaliacoes', { state: { keeperId } });
  };

  const getStatusStyle = (pos: string) => {
    switch (pos) {
      case 'Titular': return 'bg-green-500/20 text-green-500';
      case 'Reserva': return 'bg-gray-800 text-gray-400';
      case 'Avaliação': return 'bg-amber-500/20 text-amber-500 border border-amber-500/30';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Goleiros</h1>
          <p className="text-gray-400 mt-1">Gestão de atletas e categorias</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center justify-center gap-2 gold-gradient text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:brightness-110 transition-all"
        >
          <Plus size={20} />
          Novo Goleiro
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar goleiro por nome..." 
            className="w-full pl-12 pr-4 py-3 bg-card border border-gray-800 rounded-xl text-white focus:outline-none focus:border-gold transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          {['Todas', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all
                ${selectedCategory === cat 
                  ? 'border-gold gold-text bg-gold/10' 
                  : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredKeepers.map((keeper) => (
          <div key={keeper.id} className="bg-card border border-gray-800 rounded-2xl overflow-hidden group hover:border-gold/50 transition-all animate-in slide-in-from-top-2 relative">
            <div className="h-24 gold-gradient relative">
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button 
                  onClick={() => handleEditKeeper(keeper)}
                  className="p-2 bg-black/20 backdrop-blur-md rounded-lg text-black/70 hover:text-black hover:bg-black/30 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(keeper.id)}
                  className="p-2 bg-black/20 backdrop-blur-md rounded-lg text-black/70 hover:text-red-600 hover:bg-black/30 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="absolute -bottom-8 left-6 z-10">
                <div className="w-16 h-16 rounded-xl bg-gray-900 border-4 border-card overflow-hidden shadow-lg">
                  {keeper.photo ? (
                    <img src={keeper.photo} alt={keeper.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold font-bold text-2xl bg-gray-900">
                      {keeper.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-10 p-6 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white truncate pr-2">{keeper.name}</h3>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusStyle(keeper.position)}`}>
                  {keeper.position}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Shield size={14} className="gold-text" />
                <span className="gold-text font-bold">{keeper.category}</span>
                <span>•</span>
                <span>{keeper.clubTime || 'Novo'} de clube</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Altura / Peso</p>
                  <p className="text-sm font-semibold text-white">{keeper.height}cm / {keeper.weight}kg</p>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Pé Dominante</p>
                  <p className="text-sm font-semibold text-white">{keeper.dominantFoot}</p>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => handleEditKeeper(keeper)}
                  className="flex-1 py-3 rounded-lg bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 active:scale-95 transition-all"
                >
                  Ficha Completa
                </button>
                <button 
                  onClick={() => handleEvaluate(keeper.id)}
                  className="flex-1 py-3 rounded-lg border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-gray-600 active:scale-95 transition-all"
                >
                  Avaliar
                </button>
              </div>
            </div>

            {/* Confirmação de Exclusão */}
            {showDeleteConfirm === keeper.id && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-20 flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase text-xs tracking-widest">Remover Goleiro?</h4>
                    <p className="text-gray-400 text-[10px] mt-1">Os dados de scout e avaliação serão perdidos.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Voltar</button>
                    <button onClick={() => handleDeleteKeeper(keeper.id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Remover</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cadastro Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-hidden">
          <div className="bg-card border border-gray-800 w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-card shrink-0">
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <User className="gold-text" size={18} /> {isEditing ? 'Editar Goleiro' : 'Novo Goleiro'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative group">
                    <label className="block cursor-pointer">
                      <div className="w-40 h-40 rounded-2xl bg-black border-2 border-dashed border-gray-700 overflow-hidden flex flex-col items-center justify-center transition-all group-hover:border-gold group-hover:bg-gray-900">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-600 group-hover:text-gold">
                            <Camera size={40} />
                            <span className="text-[10px] font-black uppercase mt-2">Adicionar Foto</span>
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                    {photoPreview && (
                      <button onClick={removePhoto} className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-lg shadow-lg hover:bg-red-500 transition-all z-10">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="w-full space-y-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status no Elenco</label>
                       <div className="flex gap-2">
                         {['Titular', 'Reserva', 'Avaliação'].map(pos => (
                           <button 
                             key={pos}
                             onClick={() => setFormData({...formData, position: pos as any})}
                             className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${formData.position === pos ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 'bg-black border-gray-800 text-gray-500 hover:border-gray-600'}`}
                           >
                             {pos}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <User size={12} className="gold-text" /> Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nome do atleta" 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <Calendar size={12} className="gold-text" /> Data de Nascimento *
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                      value={formData.birthDate}
                      onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <Shield size={12} className="gold-text" /> Categoria *
                    </label>
                    <select 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as Category})}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:col-span-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                        <Ruler size={12} className="gold-text" /> Altura (cm)
                      </label>
                      <input 
                        type="number" 
                        placeholder="180"
                        className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                        value={formData.height}
                        onChange={e => setFormData({...formData, height: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                        <Weight size={12} className="gold-text" /> Peso (kg)
                      </label>
                      <input 
                        type="number" 
                        placeholder="80"
                        className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                        value={formData.weight}
                        onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                        <Ruler size={12} className="gold-text" /> Envergadura
                      </label>
                      <input 
                        type="number" 
                        placeholder="185"
                        className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                        value={formData.wingspan}
                        onChange={e => setFormData({...formData, wingspan: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <Target size={12} className="gold-text" /> Pé Dominante
                    </label>
                    <select 
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                      value={formData.dominantFoot}
                      onChange={e => setFormData({...formData, dominantFoot: e.target.value as any})}
                    >
                      <option value="Destro">Destro</option>
                      <option value="Canhoto">Canhoto</option>
                      <option value="Ambidestro">Ambidestro</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Tempo de Clube</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 2 anos"
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none"
                      value={formData.clubTime}
                      onChange={e => setFormData({...formData, clubTime: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase">Observações Técnicas</label>
                    <textarea 
                      rows={3}
                      placeholder="Histórico, pontos fortes, etc..."
                      className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white focus:border-gold outline-none resize-none"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-card shrink-0">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-8 py-3 rounded-xl border border-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveKeeper}
                className="gold-gradient text-black px-12 py-3 rounded-xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Save size={18} /> {isEditing ? 'Atualizar Goleiro' : 'Salvar Goleiro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalkeeperList;
