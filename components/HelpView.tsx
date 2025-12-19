import React, { useState } from 'react';
import { 
  HelpCircle, BookOpen, Video, MessageCircle, ChevronDown, ChevronRight,
  Calendar, DollarSign, Users, MapPin, BarChart3, FileText, Shield,
  Lightbulb, ExternalLink, Mail, Phone
} from 'lucide-react';
import { PageBanner } from './PageBanner';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Primeiros Passos',
    question: 'Como começar a usar o BXD Event Manager?',
    answer: 'Acesse o módulo "Perfil do Evento" no menu para configurar as informações básicas do seu evento: nome, data, local e público esperado. Em seguida, configure seu orçamento no módulo "Financeiro".'
  },
  {
    category: 'Primeiros Passos',
    question: 'Como importar dados de planilhas existentes?',
    answer: 'No módulo Financeiro, clique em "Importar Planilha". O sistema aceita arquivos Excel (.xlsx, .xls) e CSV. Certifique-se de que sua planilha tenha colunas para Data, Descrição, Valor e Categoria.'
  },
  {
    category: 'Financeiro',
    question: 'Como funciona o controle orçamentário?',
    answer: 'O sistema permite definir um orçamento total e acompanhar gastos por categoria. Você pode registrar receitas (patrocínios, ingressos) e despesas (cachês, infraestrutura) manualmente ou via importação.'
  },
  {
    category: 'Financeiro',
    question: 'É possível gerar relatórios financeiros?',
    answer: 'Sim! No módulo "Financeiro Avançado", você pode gerar relatórios detalhados em PDF ou Excel, incluindo fluxo de caixa, análise por categoria e projeções.'
  },
  {
    category: 'Equipe',
    question: 'Como gerenciar voluntários e staff?',
    answer: 'Use os módulos "Voluntários" e "Staff Manager" para cadastrar sua equipe, definir turnos, controlar check-in/check-out e gerenciar escalas de trabalho.'
  },
  {
    category: 'Equipe',
    question: 'O sistema permite controle de acesso?',
    answer: 'Sim, o módulo "Staff Manager" permite definir níveis de acesso, gerar credenciais e monitorar a movimentação da equipe em tempo real durante o evento.'
  },
  {
    category: 'Marketing',
    question: 'Como usar o módulo de Marketing?',
    answer: 'O módulo Marketing permite planejar campanhas, gerenciar conteúdo para redes sociais, acompanhar métricas de engajamento e organizar materiais promocionais usando um quadro Kanban.'
  },
  {
    category: 'Compliance',
    question: 'O que é o módulo de Documentação & Compliance?',
    answer: 'Este módulo ajuda a organizar todos os documentos legais do evento: contratos, autorizações, seguros, licenças (ECAD, Bombeiros, Prefeitura) e documentação para leis de incentivo como Lei Rouanet.'
  },
  {
    category: 'IA',
    question: 'Como funcionam os assistentes de IA?',
    answer: 'Os módulos "Jurídico IA" e "Contábil IA" usam inteligência artificial para responder dúvidas específicas sobre legislação de eventos, ECAD, seguros, Lei Rouanet e melhores práticas contábeis.'
  },
  {
    category: 'Spaces 3D',
    question: 'O que é o Spaces 3D?',
    answer: 'É uma ferramenta de planejamento visual que permite criar plantas baixas do seu evento, posicionar palcos, stands e áreas, e visualizar a disposição do espaço em 3D.'
  }
];

const modules = [
  { icon: Calendar, name: 'Agenda', description: 'Cronograma e calendário do evento' },
  { icon: DollarSign, name: 'Financeiro', description: 'Controle de orçamento e transações' },
  { icon: Users, name: 'CRM', description: 'Gestão de contatos e relacionamentos' },
  { icon: BarChart3, name: 'Analytics', description: 'Métricas e relatórios do evento' },
  { icon: MapPin, name: 'Spaces 3D', description: 'Planejamento visual do espaço' },
  { icon: FileText, name: 'Marketing', description: 'Campanhas e conteúdo digital' },
  { icon: Shield, name: 'Compliance', description: 'Documentação legal e licenças' },
  { icon: Lightbulb, name: 'IA Jurídico', description: 'Assistente de legislação' },
];

export const HelpView: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = ['todos', ...new Set(faqs.map(f => f.category))];
  
  const filteredFaqs = selectedCategory === 'todos' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory);

  return (
    <div className="space-y-6">
      <PageBanner 
        title="Ajuda" 
        subtitle="Suporte e documentação"
        storageKey="help_banner_images"
        defaultImages={[
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&h=300&fit=crop',
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=300&fit=crop'
        ]}
      />
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <HelpCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Central de Ajuda</h1>
            <p className="text-indigo-100 mt-1">
              Tudo que você precisa saber para gerenciar seu evento com sucesso
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="#faq" 
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <BookOpen className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-slate-800 mb-1">Perguntas Frequentes</h3>
          <p className="text-sm text-slate-600">Respostas para as dúvidas mais comuns</p>
        </a>
        
        <a 
          href="#modules" 
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <Video className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-slate-800 mb-1">Guia dos Módulos</h3>
          <p className="text-sm text-slate-600">Conheça todas as funcionalidades</p>
        </a>
        
        <a 
          href="#contact" 
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <MessageCircle className="w-8 h-8 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-slate-800 mb-1">Suporte</h3>
          <p className="text-sm text-slate-600">Entre em contato conosco</p>
        </a>
      </div>

      {/* Modules Overview */}
      <div id="modules" className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Visão Geral dos Módulos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((module, index) => (
            <div 
              key={index}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <module.icon className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-slate-800 text-sm">{module.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{module.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          Perguntas Frequentes
        </h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'todos' ? 'Todas' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                    {faq.category}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 text-white">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          Precisa de Mais Ajuda?
        </h2>
        <p className="text-slate-300 mb-6">
          Nossa equipe está pronta para ajudar você a tirar o máximo do BXD Event Manager.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center gap-4">
            <Mail className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="font-medium">E-mail</p>
              <p className="text-slate-300 text-sm">suporte@bxdevent.com.br</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center gap-4">
            <Phone className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-slate-300 text-sm">(24) 99999-0000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center text-sm text-slate-500 py-4">
        <p>BXD Event Manager v1.0.0</p>
        <p className="text-xs mt-1">© 2025 - Todos os direitos reservados</p>
      </div>
    </div>
  );
};
