import { LayoutDashboard, BarChart3, UserCircle2, Map, Trello, Sparkles, DollarSign, Calculator, Vote, UserPlus, Users, Truck, Scale, Shield, Settings as SettingsIcon, UserCircle, SquareStack, Leaf, HelpCircle, Mic, Video, Server } from 'lucide-react';
import type { ModuleDefinition, ModuleKey, ModulePlan, ModuleStateMap } from '../types';

const moduleDefinitions: ModuleDefinition[] = [
  // === MÓDULOS PRIORITÁRIOS (Ordem por importância) ===
  
  // 1. Dashboard - Visão geral sempre primeiro
  {
    key: 'dashboard',
    label: 'Visão Geral',
    description: 'Resumo executivo com KPIs e alertas críticos do evento.',
    icon: LayoutDashboard,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: false,
  },
  
  // 2. Configurações - Base de tudo, precisa estar acessível
  {
    key: 'settings',
    label: 'Configurações',
    description: 'Parâmetros gerais, equipe e preferências do evento.',
    icon: SettingsIcon,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: false,
  },
  
  // 3. Financeiro - Controle essencial
  {
    key: 'finance',
    label: 'Financeiro',
    description: 'Controle financeiro com OCR e conciliação.',
    icon: DollarSign,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 4. Agenda - Planejamento de produção
  {
    key: 'agenda',
    label: 'Agenda',
    description: 'Planejamento de produção com automações logísticas.',
    icon: Map,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 5. Credenciamento - Controle de acesso e staff
  {
    key: 'staffManager',
    label: 'Credenciamento',
    description: 'Pulseiras, controle de acesso e monitoramento de integrantes no evento.',
    icon: Shield,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 5.1. NFC/Pulseiras - Gestão de participantes
  {
    key: 'nfc',
    label: 'Pulseiras NFC',
    description: 'Gestão de pulseiras NFC: ativação, cashless, controle de acesso e coleta de leads.',
    icon: UserPlus,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 6. CRM - Gestão de contatos
  {
    key: 'crm',
    label: 'CRM',
    description: 'Gestão de contatos, fornecedores e parceiros.',
    icon: UserCircle2,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 7. Materiais & Infraestrutura - Gestão de impressos e instalações
  {
    key: 'marketing',
    label: 'Materiais & Infra',
    description: 'Gestão de impressos, gráfica e instalações do evento.',
    icon: Trello,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // 8. Analytics - Métricas de marketing
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Monitore resultados do time de marketing e integrações de redes sociais.',
    icon: BarChart3,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // === MÓDULOS SECUNDÁRIOS ===
  
  // Equipe interna
  {
    key: 'team',
    label: 'Equipe',
    description: 'Time interno com status, contatos e atribuições.',
    icon: Users,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Reuniões por Videoconferência
  {
    key: 'meetings',
    label: 'Reuniões',
    description: 'Videoconferências integradas com Google Meet, Zoom, Teams e envio via WhatsApp.',
    icon: Video,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Planejamento com Reuniões
  {
    key: 'planning',
    label: 'Planejamento',
    description: 'Reuniões gravadas com IA, atas automáticas e gestão de tarefas.',
    icon: Mic,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Planejador 3D
  {
    key: 'planner3d',
    label: 'Planejador 3D',
    description: 'Visualização 3D de layouts com IA, biblioteca de objetos e renders profissionais.',
    icon: SquareStack,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Voluntários
  {
    key: 'volunteers',
    label: 'Voluntários',
    description: 'Organização e ativação de voluntários.',
    icon: UserPlus,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Pesquisas
  {
    key: 'polls',
    label: 'Pesquisas',
    description: 'Termômetro do evento: satisfação, engajamento e feedback do público.',
    icon: Vote,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // === MÓDULOS AVANÇADOS ===
  
  // Spaces/Canvas 3D
  {
    key: 'canvas',
    label: 'Spaces',
    description: 'Canvas infinito com mapas em escala e múltiplos projetos.',
    icon: SquareStack,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Marketing Digital Avançado
  {
    key: 'marketingAdvanced',
    label: 'Mkt Digital',
    description: 'Automação de mídia paga, criativos e IA generativa.',
    icon: Sparkles,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Financeiro Avançado
  {
    key: 'advancedFinance',
    label: 'Fin. Avançado',
    description: 'Prestação de contas e integrações bancárias.',
    icon: DollarSign,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Eco-Gestão
  {
    key: 'ecoGestao',
    label: 'Eco-Gestão',
    description: 'Sustentabilidade, gestão de resíduos e carbon footprint.',
    icon: Leaf,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // === MÓDULOS CONSULTORIA IA ===
  
  // Jurídico IA
  {
    key: 'legal',
    label: 'Jurídico IA',
    description: 'Assistente IA para eventos incentivados, leis, seguros e obrigatoriedades.',
    icon: Scale,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Contábil IA
  {
    key: 'accounting',
    label: 'Contábil IA',
    description: 'Assistente fiscal para prestação de contas e relatórios.',
    icon: Calculator,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // Compliance
  {
    key: 'compliance',
    label: 'Compliance',
    description: 'Checklist normativo e auditoria contínua.',
    icon: Shield,
    plan: 'Scale',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: true,
  },
  
  // === SISTEMA ===
  
  // Perfil do Evento (não aparece no menu)
  {
    key: 'profile',
    label: 'Perfil do Evento',
    description: 'Identidade visual, patrocinadores e canais oficiais.',
    icon: UserCircle,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: false,
    gateable: false,
  },
  
  // Painel SaaS - Controle de vendas e APIs
  {
    key: 'saas',
    label: 'Painel SaaS',
    description: 'Controle de vendas, clientes, APIs e integrações do negócio.',
    icon: Server,
    plan: 'Growth',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: false,
  },
  
  // Ajuda - sempre por último
  {
    key: 'help',
    label: 'Ajuda',
    description: 'Central de ajuda, tutoriais e perguntas frequentes.',
    icon: HelpCircle,
    plan: 'Starter',
    defaultEnabled: true,
    showInNavigation: true,
    gateable: false,
  },
];

export const MODULE_DEFINITIONS = moduleDefinitions;

export const MODULE_MAP: Record<ModuleKey, ModuleDefinition> = moduleDefinitions.reduce(
  (acc, module) => {
    acc[module.key] = module;
    return acc;
  },
  {} as Record<ModuleKey, ModuleDefinition>
);

export const DEFAULT_ENABLED_MODULES: ModuleStateMap = moduleDefinitions.reduce(
  (acc, module) => {
    acc[module.key] = module.defaultEnabled;
    return acc;
  },
  {} as ModuleStateMap
);

export const PLAN_ORDER: ModulePlan[] = ['Starter', 'Growth', 'Scale'];
