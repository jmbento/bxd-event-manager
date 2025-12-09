
import type { LucideIcon } from 'lucide-react';

export interface FinancialKPI {
  budgetTotal: number;
  spentToday: number;
  balance: number;
  spendingLimit: number;
  totalSpent: number;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
  status: 'ok' | 'low' | 'critical';
  type: 'material' | 'fuel' | 'food';
}

export interface DigitalMetric {
  name: string;
  value: number;
  target?: number;
}

export enum LocationStatus {
  HighInvestment = 'high',
  MediumInvestment = 'medium',
  LowInvestment = 'low',
}

export interface CampaignLocation {
  id: string;
  name: string;
  status: LocationStatus;
  coordinates: { x: number; y: number }; // Percentage for mock map
}

// New Types for Modules
export type TaskStatus = 'briefing' | 'creation' | 'legal' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee?: string;
  cost?: number; // Linked cost when done
  linkedEventId?: string; // Linked to agenda
}

export type EventType =
  | 'show'
  | 'palestra'
  | 'workshop'
  | 'painel'
  | 'meetup'
  | 'backstage'
  | 'ensaio'
  | 'logistica'
  | 'digital';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rain' | 'storm';

export interface EventLogistics {
  vehicles: string[]; // e.g., 'Carro de Som', 'Van 01'
  staffCount: number;
  dietaryRestrictions: boolean; // Vegetarian option check
  fuelEstimatedLiters: number;
  materials: string[]; // e.g., '1000 Santinhos'
  permitsChecked: boolean; // Alvarás e autorizações confirmados
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: EventType;
  status: 'pending' | 'completed';
  weather?: WeatherCondition;
  logistics?: EventLogistics;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  source: 'ocr' | 'marketing_task' | 'logistics_auto' | 'manual';
  assetLinked?: string; // e.g., "Plate ABC-1234"
  type?: 'budget' | 'actual';
  budgetId?: string;
  
  // Campos para Prestação de Contas Lei de Incentivo
  supplierCnpj?: string;
  supplierName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  rubric?: 'PESSOAL' | 'ESTRUTURA' | 'LOGÍSTICA' | 'DIVULGAÇÃO' | 'DESPESAS ADMINISTRATIVAS' | 'IMPOSTOS, TAXAS, SEGUROS';
  budgetItem?: string;
  paymentMethod?: string;
  paymentDate?: string;
  taxRetention?: {
    inss?: number;
    irrf?: number;
    iss?: number;
  };
  netAmount?: number;
  receiptUrl?: string;
  
  // Campos para orçamento detalhado
  quantity?: number;
  unit?: string;
  unitQuantity?: number;
  unitValue?: number;
  incentiveValue?: number;
  ownResourcesValue?: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  subcategory?: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'completed' | 'exceeded';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  notes?: string;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  percentageUsed: number;
  categoriesCount: number;
  exceededCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  photoUrl?: string; // Placeholder for UI
  status: 'active' | 'busy' | 'offline';
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: 'car' | 'van' | 'truck' | 'sound_car';
  currentKm: number;
  status: 'active' | 'maintenance';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  kmAtRefuel: number;
  stationName: string;
  receiptUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastModified: Date;
  messages: ChatMessage[];
}

export interface CandidateProfile {
  name: string;
  number: string;
  role: string; // Prefeito, Vereador
  party: string; // Sigla
  coalition: string; // Nome da coligação
  cnpj: string;
  tseStatus:
    | 'deferido'
    | 'indeferido'
    | 'aguardando'
    | 'sub-judice'
    | 'confirmado'
    | 'planejado'
    | 'em-revisao';
  photoUrl: string;
  themeColor: string; // Hex code for branding
  socialLinks: {
    instagram: string;
    website: string;
  };
}

export type ModulePlan = 'Starter' | 'Growth' | 'Scale';

export type ModuleKey =
  | 'dashboard'
  | 'analytics'
  | 'crm'
  | 'agenda'
  | 'marketing'
  | 'marketingAdvanced'
  | 'finance'
  | 'advancedFinance'
  | 'accounting'
  | 'polls'
  | 'volunteers'
  | 'team'
  | 'fleet'
  | 'legal'
  | 'compliance'
  | 'staffManager'
  | 'ecoGestao'
  | 'settings'
  | 'profile'
  | 'canvas'
  | 'help';

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  description: string;
  icon: LucideIcon;
  plan: ModulePlan;
  defaultEnabled: boolean;
  showInNavigation: boolean;
  gateable: boolean;
}

export type ModuleStateMap = Record<ModuleKey, boolean>;

export type CanvasNodeType = 'sticky' | 'ai' | 'media' | 'frame';

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  title?: string;
  content?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface CanvasConnector {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  color?: string;
}

export interface CanvasSpace {
  id: string;
  name: string;
  description: string;
  origin: { x: number; y: number };
  scale?: number;
  nodes: CanvasNode[];
  connectors: CanvasConnector[];
  templates?: string[];
}
