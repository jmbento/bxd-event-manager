import {
  CandidateProfile,
  FinancialKPI,
  ExpenseCategory,
  CampaignLocation,
  LocationStatus,
  InventoryItem,
  Task,
  CalendarEvent,
  TaskStatus,
  Transaction,
  TeamMember,
  Vehicle,
  FuelLog,
  ModuleStateMap,
  ModuleKey,
} from '../types';
import { MODULE_MAP, DEFAULT_ENABLED_MODULES } from '../config/moduleConfig';
import { supabase, hasSupabase } from './supabaseClient';
import { notifyError } from './notificationService';

export interface CampaignData {
  profile: CandidateProfile;
  financials: FinancialKPI;
  expenses: ExpenseCategory[];
  locations: CampaignLocation[];
  digitalStats: {
    invested: number;
    reach: number;
    leads: number;
    videosProduced: number;
    videoGoal: number;
  };
  inventory: InventoryItem[];
  tasks: Task[];
  events: CalendarEvent[];
  transactions: Transaction[];
  team: TeamMember[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  moduleStates: ModuleStateMap;
}

const parseStatus = (status: string | null | undefined, fallback: LocationStatus): LocationStatus => {
  if (!status) return fallback;
  if (status === 'high') return LocationStatus.HighInvestment;
  if (status === 'medium') return LocationStatus.MediumInvestment;
  if (status === 'low') return LocationStatus.LowInvestment;
  return fallback;
};

const DEFAULT_CAMPAIGN_SLUG = (import.meta as any).env?.VITE_DEMO_CAMPAIGN_SLUG || 'bento-demo';

export const fetchCampaignData = async (): Promise<CampaignData | null> => {
  if (!hasSupabase || !supabase) {
    console.info('[Supabase] Conexão indisponível. Dados mock serão utilizados.');
    return null;
  }

  try {
    const campaignRes = await supabase
      .from('campaigns')
      .select('id, name, public_read')
      .eq('slug', DEFAULT_CAMPAIGN_SLUG)
      .maybeSingle();

    if (campaignRes.error) {
      console.error('[Supabase] Falha ao buscar campanha', campaignRes.error);
      notifyError('Não foi possível carregar dados remotos da campanha. Usando dados locais.');
      return null;
    }

    if (!campaignRes.data) {
      console.warn('[Supabase] Nenhuma campanha encontrada com o slug definido.');
      return null;
    }

    const campaignId = campaignRes.data.id as string;

    const [profileRes, financialRes, expensesRes, locationsRes, digitalRes, inventoryRes, tasksRes, eventsRes, transactionsRes, teamRes, vehiclesRes, fuelRes, modulesRes] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('campaign_id', campaignId).maybeSingle(),
      supabase.from('campaign_financials').select('*').eq('campaign_id', campaignId).maybeSingle(),
      supabase.from('expense_categories').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true }),
      supabase.from('campaign_locations').select('*').eq('campaign_id', campaignId),
      supabase.from('digital_metrics').select('*').eq('campaign_id', campaignId).maybeSingle(),
      supabase.from('inventory_items').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true }),
      supabase.from('tasks').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true }),
      supabase.from('events').select('*').eq('campaign_id', campaignId).order('date', { ascending: true }),
      supabase.from('transactions').select('*').eq('campaign_id', campaignId).order('txn_date', { ascending: false }),
      supabase.from('team_members').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: true }),
      supabase.from('vehicles').select('*').eq('campaign_id', campaignId),
      supabase.from('fuel_logs').select('*').eq('campaign_id', campaignId).order('logged_at', { ascending: false }),
      supabase.from('module_flags').select('*').eq('campaign_id', campaignId),
    ]);

    const profileRow = profileRes.data;
    const financialRow = financialRes.data;

    if (!profileRow || !financialRow) {
      console.warn('[Supabase] Campanha sem perfil ou financeiro cadastrado.');
      return null;
    }

    const profile: CandidateProfile = {
      name: profileRow.name,
      number: profileRow.number,
      role: profileRow.role,
      party: profileRow.party,
      coalition: profileRow.coalition,
      cnpj: profileRow.cnpj,
      tseStatus: profileRow.tse_status,
      photoUrl: profileRow.photo_url,
      themeColor: profileRow.theme_color,
      socialLinks: {
        instagram: profileRow.instagram,
        website: profileRow.website,
      },
    };

    const financials: FinancialKPI = {
      budgetTotal: Number(financialRow.budget_total ?? 0),
      spentToday: Number(financialRow.spent_today ?? 0),
      balance: Number(financialRow.balance ?? 0),
      spendingLimit: Number(financialRow.spending_limit ?? 0),
      totalSpent: Number(financialRow.total_spent ?? 0),
    };

    const expenses: ExpenseCategory[] = (expensesRes.data ?? []).map((row) => ({
      name: row.name,
      value: Number(row.value ?? 0),
      color: row.color ?? '#0f172a',
    }));

    const locations: CampaignLocation[] = (locationsRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      status: parseStatus(row.status, LocationStatus.MediumInvestment),
      coordinates: {
        x: Number(row.coordinates?.x ?? 0),
        y: Number(row.coordinates?.y ?? 0),
      },
    }));

    const digitalStats = {
      invested: Number(digitalRes.data?.invested ?? 0),
      reach: Number(digitalRes.data?.reach ?? 0),
      leads: Number(digitalRes.data?.leads ?? 0),
      videosProduced: Number(digitalRes.data?.videos_produced ?? 0),
      videoGoal: Number(digitalRes.data?.video_goal ?? 0),
    };

    const inventory: InventoryItem[] = (inventoryRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      quantity: Number(row.quantity ?? 0),
      status: row.status,
      type: row.item_type,
    }));

    const tasks: Task[] = (tasksRes.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      status: (row.status as TaskStatus) ?? 'briefing',
      assignee: row.assignee ?? undefined,
      cost: row.cost ? Number(row.cost) : undefined,
      linkedEventId: row.linked_event_id ?? undefined,
    }));

    const events: CalendarEvent[] = (eventsRes.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      location: row.location,
      type: row.event_type,
      status: row.status,
      weather: row.weather ?? undefined,
      logistics: row.logistics ?? undefined,
    }));

    const transactions: Transaction[] = (transactionsRes.data ?? []).map((row) => ({
      id: row.id,
      description: row.description,
      amount: Number(row.amount ?? 0),
      date: row.txn_date,
      category: row.category,
      source: row.source,
      assetLinked: row.asset_linked ?? undefined,
    }));

    const team: TeamMember[] = (teamRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      phone: row.phone ?? '',
      email: row.email ?? '',
      photoUrl: row.photo_url ?? undefined,
      status: row.status ?? 'active',
    }));

    const vehicles: Vehicle[] = (vehiclesRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      plate: row.plate,
      type: row.vehicle_type,
      currentKm: Number(row.current_km ?? 0),
      status: row.status ?? 'active',
    }));

    const fuelLogs: FuelLog[] = (fuelRes.data ?? []).map((row) => ({
      id: row.id,
      vehicleId: row.vehicle_id,
      date: row.logged_at,
      liters: Number(row.liters ?? 0),
      cost: Number(row.cost ?? 0),
      kmAtRefuel: Number(row.km_at_refuel ?? 0),
      stationName: row.station_name ?? '',
      receiptUrl: row.receipt_url ?? undefined,
    }));

    const moduleStates: ModuleStateMap = { ...DEFAULT_ENABLED_MODULES };
    (modulesRes.data ?? []).forEach((row) => {
      const key = row.module_key as ModuleKey;
      if (MODULE_MAP[key]) {
        moduleStates[key] = Boolean(row.enabled);
      }
    });

    return {
      profile,
      financials,
      expenses,
      locations,
      digitalStats,
      inventory,
      tasks,
      events,
      transactions,
      team,
      vehicles,
      fuelLogs,
      moduleStates,
    };
  } catch (error) {
    console.error('[Supabase] Erro inesperado ao sincronizar dados', error);
    notifyError('Erro ao carregar dados remotos. Mantendo versão local.');
    return null;
  }
};
