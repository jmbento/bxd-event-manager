
import React, { useEffect, useRef, useState } from 'react';
import { EventProfile } from '../types';
import { Save, Upload, CheckCircle2, AlertTriangle, Building, Hash, Share2, Globe, FileText, QrCode, Calendar, Users } from 'lucide-react';

interface Props {
  profile: EventProfile;
  onUpdateProfile: (p: EventProfile) => void;
}

export const EventProfileView: React.FC<Props> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventProfile>(profile);
    const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl || '');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setFormData(profile);
        setLogoPreview(profile.logoUrl || '');
    }, [profile]);

  const handleChange = (field: keyof EventProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field: 'instagram' | 'website', value: string) => {
    setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
    }));
  };

    const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (result) {
                setLogoPreview(result);
                handleChange('logoUrl', result);
            }
        };
        reader.readAsDataURL(file);
    };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'Licenças confirmadas':
          case 'Aprovado':
              return 'bg-emerald-100 text-emerald-800 border-emerald-200';
          case 'Em análise':
          case 'Aguardando documentos':
              return 'bg-amber-100 text-amber-800 border-amber-200';
          case 'Pendências encontradas':
              return 'bg-red-100 text-red-800 border-red-200';
          default:
              return 'bg-slate-100 text-slate-600 border-slate-200';
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER ACTION */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Perfil do Evento & Branding</h2>
           <p className="text-slate-500 text-sm mt-1">Configure informações do evento, licenciamento e identidade visual.</p>
        </div>
        <button 
           onClick={() => isEditing ? handleSave() : setIsEditing(true)}
           className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
               isEditing 
               ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
               : 'bg-blue-600 hover:bg-blue-700 text-white'
           }`}
        >
           {isEditing ? <Save className="w-4 h-4" /> : <SettingsIcon className="w-4 h-4" />}
           {isEditing ? 'Salvar Alterações' : 'Editar Perfil do Evento'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - VISUAL IDENTITY */}
        <div className="space-y-6">
            
            {/* ID CARD PREVIEW */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="relative w-40 h-40 mb-4 group">
                    <img 
                        src={logoPreview || formData.logoUrl || "https://via.placeholder.com/150"} 
                        alt="Logo do evento" 
                        className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-lg"
                    />
                    {isEditing && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                          aria-label="Enviar novo logo"
                        >
                            <Upload className="w-8 h-8 text-white" />
                        </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                                            aria-label="Selecionar logo do evento"
                      onChange={handleLogoUpload}
                    />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900">{formData.eventName}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-blue-600">{formData.edition}</span>
                </div>
                <p className="text-slate-500 font-medium uppercase text-sm mt-1">{formData.eventType} • {formData.organizer}</p>

                <div className={`mt-4 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${getStatusColor(formData.licensingStatus)}`}>
                    {formData.licensingStatus === 'Licenças confirmadas' || formData.licensingStatus === 'Aprovado' ? (
                        <CheckCircle2 className="w-3 h-3" />
                    ) : (
                        <AlertTriangle className="w-3 h-3" />
                    )}
                    {formData.licensingStatus}
                </div>
            </div>

            {/* QR CODE / DIGITAL PASS */}
            {!isEditing && (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white text-center relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <QrCode className="w-16 h-16 bg-white text-slate-900 p-1 rounded-lg mb-3" />
                        <h3 className="font-bold text-lg">Pass Digital</h3>
                        <p className="text-blue-100 text-xs mb-4">Compartilhe a página oficial do evento</p>
                        <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Enviar via WhatsApp
                        </button>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN - DATA FIELDS */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Dados do Evento & Licenciamento
                </h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field Group */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="profile-eventName" className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Comercial do Evento</label>
                        <input 
                            id="profile-eventName"
                            disabled={!isEditing}
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                            value={formData.eventName}
                            onChange={(e) => handleChange('eventName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="profile-eventType" className="block text-xs font-bold text-slate-500 uppercase mb-1">Formato do Evento</label>
                        <select 
                             id="profile-eventType"
                             disabled={!isEditing}
                             className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                             value={formData.eventType}
                             onChange={(e) => handleChange('eventType', e.target.value)}
                        >
                            <option value="Festival Presencial">Festival Presencial</option>
                            <option value="Festival Híbrido">Festival Híbrido</option>
                            <option value="Evento Online">Evento Online</option>
                            <option value="Conferência">Conferência</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Expo/Feira">Expo/Feira</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="profile-cnpj" className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ da Produtora</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                id="profile-cnpj"
                                disabled={!isEditing}
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 font-mono"
                                value={formData.cnpj}
                                onChange={(e) => handleChange('cnpj', e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Obrigatório para emissão de notas.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="profile-edition" className="block text-xs font-bold text-slate-500 uppercase mb-1">Edição/Ano</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                id="profile-edition"
                                disabled={!isEditing}
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 font-medium"
                                value={formData.edition}
                                onChange={(e) => handleChange('edition', e.target.value)}
                                placeholder="Ex: 5ª Edição 2024"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="profile-organizer" className="block text-xs font-bold text-slate-500 uppercase mb-1">Produtora/Organizador</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input 
                                id="profile-organizer"
                                disabled={!isEditing}
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                value={formData.organizer}
                                onChange={(e) => handleChange('organizer', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="profile-licensingStatus" className="block text-xs font-bold text-slate-500 uppercase mb-1">Status do Licenciamento</label>
                        <select 
                             id="profile-licensingStatus"
                             disabled={!isEditing}
                             className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                             value={formData.licensingStatus}
                             onChange={(e) => handleChange('licensingStatus', e.target.value)}
                        >
                            <option value="Em análise">Em análise</option>
                            <option value="Licenças confirmadas">Licenças confirmadas</option>
                            <option value="Pendências encontradas">Pendências encontradas</option>
                            <option value="Aguardando documentos">Aguardando documentos</option>
                        </select>
                    </div>
                </div>

                {/* Full Width Fields */}
                <div className="md:col-span-2 space-y-4 border-t border-slate-100 pt-4 mt-2">
                    <div>
                        <label htmlFor="profile-sponsors" className="block text-xs font-bold text-slate-500 uppercase mb-1">Patrocinadores & Apoiadores</label>
                        <input 
                            id="profile-sponsors"
                            disabled={!isEditing}
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                            value={formData.sponsors || ''}
                            onChange={(e) => handleChange('sponsors', e.target.value)}
                            placeholder="Ex: Orbit Media • SoundWave • Cerveja Solar"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="profile-instagram" className="block text-xs font-bold text-slate-500 uppercase mb-1">Instagram (Link)</label>
                             <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400">@</span>
                                <input 
                                     id="profile-instagram"
                                    disabled={!isEditing}
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg pl-8 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                    value={formData.socialLinks.instagram}
                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                />
                             </div>
                        </div>
                            <div>
                                <label htmlFor="profile-website" className="block text-xs font-bold text-slate-500 uppercase mb-1">Site Oficial</label>
                             <div className="relative">
                                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input 
                                     id="profile-website"
                                    disabled={!isEditing}
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                    value={formData.socialLinks.website}
                                    onChange={(e) => handleSocialChange('website', e.target.value)}
                                />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
