
import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Filter, Plus, Phone, Mail, MapPin, MessageSquare, Download, X, Trash2, Edit3 } from 'lucide-react';
import { exportToXLSX } from '../services/exportService';
import { notifyError, notifyInfo, notifySuccess } from '../services/notificationService';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  segment: 'apoiador' | 'voluntario' | 'lideranca' | 'influencer' | 'participante';
  score: number;
  lastContact: string;
  interactions: number;
  tags: string[];
}

// Contatos vazios - usuário adiciona os seus próprios
const mockContacts: Contact[] = [];

const segmentColors = {
  apoiador: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  voluntario: 'bg-blue-100 text-blue-700 border-blue-200',
  lideranca: 'bg-purple-100 text-purple-700 border-purple-200',
  influencer: 'bg-pink-100 text-pink-700 border-pink-200',
  participante: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const CRMView: React.FC = () => {
  const PAGE_SIZE = 6;

  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [maxInactivityDays, setMaxInactivityDays] = useState<number | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    segment: 'participante' as Contact['segment'],
    tags: '',
    score: 75,
    lastContact: new Date().toISOString().slice(0, 10),
    interactions: 0
  });

  const generateId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const daysSinceLastContact = (date: string) => {
    const last = new Date(date);
    if (Number.isNaN(last.getTime())) return Number.MAX_SAFE_INTEGER;
    const diff = Date.now() - last.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getScoreBarWidth = (score: number) => {
    if (score >= 90) return 'w-24';
    if (score >= 80) return 'w-20';
    if (score >= 70) return 'w-16';
    if (score >= 60) return 'w-12';
    if (score >= 40) return 'w-8';
    return 'w-4';
  };

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return contacts.filter(contact => {
      const matchesSearch = term.length === 0
        || contact.name.toLowerCase().includes(term)
        || contact.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
        || contact.location.toLowerCase().includes(term);

      const matchesSegment = selectedSegment === 'todos' || contact.segment === selectedSegment;
      const matchesScore = contact.score >= minScore;
      const withinInactivity = maxInactivityDays === null || daysSinceLastContact(contact.lastContact) <= maxInactivityDays;
      return matchesSearch && matchesSegment && matchesScore && withinInactivity;
    });
  }, [contacts, searchTerm, selectedSegment, minScore, maxInactivityDays]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / PAGE_SIZE));
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const resetForm = () => {
    setNewContact({
      name: '',
      phone: '',
      email: '',
      location: '',
      segment: 'participante',
      tags: '',
      score: 75,
      lastContact: new Date().toISOString().slice(0, 10),
      interactions: 0
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingId(contact.id);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      location: contact.location,
      segment: contact.segment,
      tags: contact.tags.join(', '),
      score: contact.score,
      lastContact: contact.lastContact ? contact.lastContact.slice(0, 10) : new Date().toISOString().slice(0, 10),
      interactions: contact.interactions
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContact.name.trim() || !newContact.phone.trim()) {
      notifyError('Informe nome e telefone para salvar o contato.');
      return;
    }

    const tagsArray = newContact.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const parsedLastContact = newContact.lastContact ? new Date(newContact.lastContact) : null;
    const normalizedLastContact = parsedLastContact && !Number.isNaN(parsedLastContact.getTime())
      ? parsedLastContact.toISOString()
      : new Date().toISOString();

    if (editingId) {
      setContacts(prev => prev.map(contact => contact.id === editingId
        ? { ...contact, ...newContact, tags: tagsArray, lastContact: normalizedLastContact }
        : contact
      ));
      notifySuccess('Contato atualizado com sucesso.');
    } else {
      const newItem: Contact = {
        id: generateId(),
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        location: newContact.location,
        segment: newContact.segment,
        tags: tagsArray,
        score: newContact.score,
        lastContact: normalizedLastContact,
        interactions: newContact.interactions,
      };
      setContacts(prev => [newItem, ...prev]);
      notifySuccess('Novo contato criado com sucesso.');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    const confirmed = window.confirm(`Tem certeza que deseja remover ${contact.name}?`);
    if (confirmed) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleExport = () => {
    if (filteredContacts.length === 0) {
      notifyError('Nenhum contato encontrado para exportar. Ajuste os filtros.');
      return;
    }

    exportToXLSX('crm-contatos', [
      {
        name: 'Contatos',
        data: filteredContacts.map(contact => ({
          Nome: contact.name,
          Telefone: contact.phone,
          Email: contact.email,
          Localizacao: contact.location,
          Segmento: contact.segment,
          Score: contact.score,
          UltimoContato: new Date(contact.lastContact).toLocaleDateString('pt-BR'),
          Interacoes: contact.interactions,
          Tags: contact.tags.join(', '),
        })),
      },
    ]);
  };

  const handleReachOut = (contact: Contact, channel: 'phone' | 'whatsapp' | 'email') => {
    const phoneDigits = contact.phone.replace(/\D/g, '');
    const hasValidPhone = phoneDigits.length >= 10;

    if ((channel === 'phone' || channel === 'whatsapp') && !hasValidPhone) {
      notifyError('Este contato não possui telefone válido.');
      return;
    }

    if (channel === 'phone') {
      window.open(`tel:+55${phoneDigits}`, '_blank');
      return;
    }

    if (channel === 'whatsapp') {
      const message = encodeURIComponent(`Olá ${contact.name}, tudo bem? Aqui é da campanha. Gostaríamos de falar com você.`);
      window.open(`https://wa.me/55${phoneDigits}?text=${message}`, '_blank');
      return;
    }

    if (channel === 'email') {
      if (!contact.email) {
        notifyError('Este contato não possui e-mail cadastrado.');
        return;
      }
      window.location.href = `mailto:${contact.email}?subject=Campanha&body=Olá ${contact.name}, tudo bem?`;
    }
  };

  const handleSegmentBadge = (segment: Contact['segment']) => {
    switch (segment) {
      case 'apoiador':
        return 'Participa ativamente da campanha';
      case 'voluntario':
        return 'Disponível para atividades de campo';
      case 'lideranca':
        return 'Liderança comunitária ou institucional';
      case 'influencer':
        return 'Divulga a campanha nas redes';
      default:
        return 'Participante em relacionamento';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">CRM - Gestão de Relacionamento</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Lista
          </button>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Contato
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{contacts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total de Contatos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-emerald-200 bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-700">{contacts.filter(c => c.segment === 'apoiador').length}</p>
          <p className="text-xs text-emerald-600 mt-1">Apoiadores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200 bg-blue-50">
          <p className="text-2xl font-bold text-blue-700">{contacts.filter(c => c.segment === 'voluntario').length}</p>
          <p className="text-xs text-blue-600 mt-1">Voluntários</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200 bg-purple-50">
          <p className="text-2xl font-bold text-purple-700">{contacts.filter(c => c.segment === 'lideranca').length}</p>
          <p className="text-xs text-purple-600 mt-1">Lideranças</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-200 bg-pink-50">
          <p className="text-2xl font-bold text-pink-700">{contacts.filter(c => c.segment === 'influencer').length}</p>
          <p className="text-xs text-pink-600 mt-1">Influencers</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou localização..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              title="Buscar contatos"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              title="Filtrar por segmento"
            >
              <option value="todos">Todos os Segmentos</option>
              <option value="apoiador">Apoiadores</option>
              <option value="voluntario">Voluntários</option>
              <option value="lideranca">Lideranças</option>
              <option value="influencer">Influencers</option>
              <option value="eleitor">Participantees</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Ocultar Filtros' : 'Mais Filtros'}
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
            <div>
              <label htmlFor="score-filter" className="block text-xs font-medium text-slate-500 mb-1">Score mínimo</label>
              <input
                id="score-filter"
                type="range"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => {
                  setMinScore(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full"
                title="Filtrar por score mínimo"
              />
              <p className="text-xs text-slate-500 mt-1">Mostrando contatos com score a partir de {minScore}</p>
            </div>
            <div>
              <label htmlFor="inactivity-filter" className="block text-xs font-medium text-slate-500 mb-1">Limite de inatividade (dias)</label>
              <input
                id="inactivity-filter"
                type="number"
                min={0}
                placeholder="Ex: 30"
                value={maxInactivityDays ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setMaxInactivityDays(value ? Number(value) : null);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                title="Filtrar por contatos com último contato em até X dias"
              />
              <p className="text-xs text-slate-400 mt-1">Deixe vazio para considerar qualquer período.</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
              <p className="font-semibold mb-1">Dica de Segmentação</p>
              <p>Combine filtros, tags e exportação para campanhas direcionadas.</p>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Contatos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Segmento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Último Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{contact.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      title={handleSegmentBadge(contact.segment)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${segmentColors[contact.segment]}`}
                    >
                      {contact.segment.charAt(0).toUpperCase() + contact.segment.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {contact.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 w-24 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${contact.score >= 80 ? 'bg-emerald-500' : contact.score >= 60 ? 'bg-amber-500' : 'bg-red-500'} ${getScoreBarWidth(contact.score)}`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{contact.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      <p>{new Date(contact.lastContact).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-slate-400">{contact.interactions} interações</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReachOut(contact, 'phone')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ligar"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReachOut(contact, 'whatsapp')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReachOut(contact, 'email')}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="E-mail"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(contact)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Bulk Messaging */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Envio em Massa via WhatsApp</h3>
            <p className="text-sm text-slate-600 mb-4">Envie mensagens personalizadas para grupos segmentados de contatos</p>
            <button
              onClick={() => notifyInfo('Em breve: editor de campanhas com modelos prontos e segmentação avançada.')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Criar Campanha de Mensagens
            </button>
          </div>
        </div>
      </div>

      {/* Modal Novo Contato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crm-contact-modal-title"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 id="crm-contact-modal-title" className="text-xl font-bold text-slate-800">{editingId ? 'Editar Contato' : 'Novo Contato'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600" title="Fechar">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="contact-location" className="block text-sm font-medium text-slate-700 mb-2">
                    Localização
                  </label>
                  <input
                    id="contact-location"
                    type="text"
                    value={newContact.location}
                    onChange={(e) => setNewContact({...newContact, location: e.target.value})}
                    placeholder="Bairro, Cidade"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="contact-segment" className="block text-sm font-medium text-slate-700 mb-2">
                    Segmento *
                  </label>
                  <select
                    id="contact-segment"
                    value={newContact.segment}
                    onChange={(e) => setNewContact({...newContact, segment: e.target.value as Contact['segment']})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Selecionar segmento do contato"
                    required
                  >
                    <option value="eleitor">Participante</option>
                    <option value="apoiador">Apoiador</option>
                    <option value="voluntario">Voluntário</option>
                    <option value="lideranca">Liderança</option>
                    <option value="influencer">Influencer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-tags" className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <input
                    id="contact-tags"
                    type="text"
                    value={newContact.tags}
                    onChange={(e) => setNewContact({...newContact, tags: e.target.value})}
                    placeholder="Ex: empresário, comerciante"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    {editingId ? 'Salvar Alterações' : 'Criar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paginação */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
        <span>
          Mostrando {paginatedContacts.length} de {filteredContacts.length} contatos
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            title="Página anterior"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-slate-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            title="Próxima página"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
