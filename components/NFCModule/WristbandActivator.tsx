import React, { useState } from 'react';
import {
  QrCode,
  Smartphone,
  User,
  Save,
  X,
  Loader2,
  CheckCircle,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';
import type { Attendee } from './types';
import { DEPARTMENTS, TICKET_PERMISSIONS } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (data: {
    wristband_uid: string;
    attendee: Partial<Attendee>;
  }) => Promise<{ success: boolean; message: string }>;
}

export const WristbandActivator: React.FC<Props> = ({ isOpen, onClose, onActivate }) => {
  const [step, setStep] = useState<'scan' | 'form' | 'success'>('scan');
  const [wristbandUid, setWristbandUid] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    age: '',
    city: '',
    state: '',
    ticket_type: 'standard' as Attendee['ticket_type'],
    department: '',
    role: '',
    marketing_opt_in: false,
    privacy_accepted: false,
  });
  
  if (!isOpen) return null;
  
  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setWristbandUid('NFC' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setScanning(false);
      setStep('form');
    }, 1500);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await onActivate({
        wristband_uid: wristbandUid,
        attendee: {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
        },
      });
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao ativar:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    setStep('scan');
    setWristbandUid('');
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      cpf: '',
      age: '',
      city: '',
      state: '',
      ticket_type: 'standard',
      department: '',
      role: '',
      marketing_opt_in: false,
      privacy_accepted: false,
    });
    onClose();
  };
  
  const isStaff = ['staff', 'crew'].includes(formData.ticket_type);
  const permissions = TICKET_PERMISSIONS[formData.ticket_type];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            {step === 'scan' && 'Escanear Pulseira'}
            {step === 'form' && 'Cadastrar Participante'}
            {step === 'success' && 'Pulseira Ativada'}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Step: Scan */}
        {step === 'scan' && (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aproxime a pulseira NFC
            </h3>
            <p className="text-slate-500 mb-6">
              Ou escaneie o QR Code da pulseira
            </p>
            
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-blue-300 flex items-center gap-3 mx-auto"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Lendo pulseira...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  Simular Leitura NFC
                </>
              )}
            </button>
            
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-3">Ou digite o código manualmente:</p>
              <div className="flex gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="NFC001ABC"
                  value={wristbandUid}
                  onChange={(e) => setWristbandUid(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center"
                />
                <button
                  onClick={() => wristbandUid && setStep('form')}
                  disabled={!wristbandUid}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Wristband Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600">Pulseira</p>
                <p className="font-mono font-bold text-blue-900 text-lg">{wristbandUid}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="João da Silva"
                  />
                </div>
              </div>
              
              {/* Email & Telefone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
              
              {/* CPF & Idade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>
              </div>
              
              {/* Cidade & Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cidade
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="São Paulo"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">UF</option>
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Tipo de Ingresso */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Credencial
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'standard', label: 'Público', color: 'slate' },
                    { value: 'vip', label: 'VIP', color: 'purple' },
                    { value: 'staff', label: 'Staff', color: 'green' },
                    { value: 'crew', label: 'Crew', color: 'orange' },
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ticket_type: type.value as any })}
                      className={`p-2 rounded-lg border-2 text-center text-sm font-medium transition ${
                        formData.ticket_type === type.value
                          ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Staff Fields */}
              {isStaff && (
                <div className="p-4 bg-green-50 rounded-xl space-y-4">
                  <h4 className="font-medium text-green-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados do Staff
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-1">
                        Departamento *
                      </label>
                      <select
                        required={isStaff}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="">Selecione</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-1">
                        Função/Cargo
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Coordenador"
                      />
                    </div>
                  </div>
                  
                  {/* Permissions Preview */}
                  <div className="text-xs text-green-700">
                    <p className="font-medium mb-1">Permissões:</p>
                    <p>📍 Acesso: {permissions.access_zones.join(', ')}</p>
                    <p>🍽️ Refeições: {permissions.meal_allowance} por dia</p>
                  </div>
                </div>
              )}
              
              {/* Marketing Opt-in */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketing_opt_in}
                    onChange={(e) => setFormData({ ...formData, marketing_opt_in: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Aceito receber comunicações sobre futuros eventos
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacy_accepted}
                    onChange={(e) => setFormData({ ...formData, privacy_accepted: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Li e aceito a <a href="#" className="text-blue-600 underline">Política de Privacidade</a> *
                  </span>
                </label>
              </div>
            </div>
            
            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:bg-green-300"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Ativar Pulseira
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Step: Success */}
        {step === 'success' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Pulseira Ativada!
            </h3>
            <p className="text-slate-600">
              {formData.full_name} foi cadastrado com sucesso.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Fechando automaticamente...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WristbandActivator;
