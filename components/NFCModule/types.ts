// =============================================================================
// TIPOS DO MÓDULO NFC
// =============================================================================

export interface Attendee {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  age?: number;
  city?: string;
  state?: string;
  ticket_type: 'standard' | 'vip' | 'backstage' | 'staff' | 'press' | 'artist' | 'crew';
  department?: string; // Para staff: Produção, Segurança, Alimentação, etc.
  role?: string; // Cargo do staff
  photo_url?: string;
  marketing_opt_in: boolean;
  created_at: string;
}

export interface Wristband {
  id: string;
  uid: string;
  status: 'new' | 'assigned' | 'blocked' | 'lost';
  attendee_id?: string;
  attendee?: Attendee;
  account?: {
    id: string;
    balance_cents: number;
  };
  // Permissões da pulseira
  permissions?: {
    access_zones: string[]; // 'main', 'vip', 'backstage', 'camarins', 'producao'
    meal_allowance: number; // Quantidade de refeições permitidas
    meals_consumed: number;
    meal_types: string[]; // 'breakfast', 'lunch', 'dinner', 'snack'
  };
  activated_at?: string;
  last_seen_at?: string;
  last_gate?: string;
}

export interface MealLog {
  id: string;
  wristband_id: string;
  attendee_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  station: string;
  created_at: string;
  status: 'allowed' | 'denied';
  reason?: string;
}

export interface AccessLog {
  id: string;
  wristband_id: string;
  wristband_uid: string;
  attendee_name?: string;
  gate: string;
  zone: string;
  direction: 'in' | 'out';
  status: 'allowed' | 'denied';
  reason?: string;
  created_at: string;
}

export interface Gate {
  id: string;
  name: string;
  code: string;
  zone: 'main' | 'vip' | 'backstage' | 'camarins' | 'producao';
  type: 'entry' | 'exit' | 'bidirectional';
  entries_today: number;
  exits_today: number;
  current_inside: number;
  is_active: boolean;
}

export interface MealStation {
  id: string;
  name: string;
  code: string;
  meal_types: string[];
  is_active: boolean;
  served_today: number;
  capacity_per_hour: number;
}

export interface DashboardStats {
  total_participants: number;
  wristbands_assigned: number;
  current_inside: number;
  total_entries: number;
  staff_count: number;
  staff_present: number;
  meals_served_today: number;
  meals_remaining: number;
}

export interface StaffMember extends Attendee {
  ticket_type: 'staff' | 'crew';
  department: string;
  role: string;
  shift_start?: string;
  shift_end?: string;
  is_checked_in: boolean;
  check_in_time?: string;
  meals_allowed: number;
  meals_consumed: number;
}

// Configuração das zonas de acesso
export const ACCESS_ZONES = [
  { id: 'main', label: 'Área Geral', color: 'blue' },
  { id: 'vip', label: 'Área VIP', color: 'purple' },
  { id: 'backstage', label: 'Backstage', color: 'orange' },
  { id: 'camarins', label: 'Camarins', color: 'red' },
  { id: 'producao', label: 'Produção', color: 'green' },
] as const;

// Tipos de refeição
export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Café da Manhã', icon: '☕', time: '06:00 - 09:00' },
  { id: 'lunch', label: 'Almoço', icon: '🍽️', time: '11:00 - 14:00' },
  { id: 'dinner', label: 'Jantar', icon: '🌙', time: '18:00 - 21:00' },
  { id: 'snack', label: 'Lanche', icon: '🥪', time: 'Livre' },
] as const;

// Departamentos de staff
export const DEPARTMENTS = [
  'Produção',
  'Segurança',
  'Alimentação',
  'Limpeza',
  'Técnico',
  'Cenografia',
  'Artístico',
  'Imprensa',
  'Logística',
  'Administrativo',
] as const;

// Tipos de ingresso com permissões padrão
export const TICKET_PERMISSIONS: Record<string, {
  access_zones: string[];
  meal_allowance: number;
  meal_types: string[];
}> = {
  standard: {
    access_zones: ['main'],
    meal_allowance: 0,
    meal_types: [],
  },
  vip: {
    access_zones: ['main', 'vip'],
    meal_allowance: 0,
    meal_types: [],
  },
  backstage: {
    access_zones: ['main', 'vip', 'backstage'],
    meal_allowance: 0,
    meal_types: [],
  },
  staff: {
    access_zones: ['main', 'producao'],
    meal_allowance: 3,
    meal_types: ['breakfast', 'lunch', 'dinner'],
  },
  crew: {
    access_zones: ['main', 'backstage', 'producao'],
    meal_allowance: 3,
    meal_types: ['breakfast', 'lunch', 'dinner'],
  },
  artist: {
    access_zones: ['main', 'vip', 'backstage', 'camarins'],
    meal_allowance: 5,
    meal_types: ['breakfast', 'lunch', 'dinner', 'snack'],
  },
  press: {
    access_zones: ['main', 'vip'],
    meal_allowance: 1,
    meal_types: ['lunch'],
  },
};
