-- SCRIPT 2: INSERIR DADOS DEMO
-- Execute este script DEPOIS do script 1

-- Insert demo campaign
insert into public.campaigns (name, slug, description, public_read)
values ('BXD Event Manager Demo', 'bento-demo', 'Campanha demonstrativa para investidores', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  public_read = excluded.public_read;

-- Insert candidate profile
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.candidate_profiles (campaign_id, name, number, role, party, coalition, cnpj, tse_status, photo_url, theme_color, instagram, website)
select campaign.id,
       'Candidato Bento' as name,
       '55.123' as number,
       'Vereador' as role,
       'PSD' as party,
       'Frente Pelo Futuro' as coalition,
       '12.345.678/0001-99' as cnpj,
       'deferido' as tse_status,
       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' as photo_url,
       '#2563eb' as theme_color,
       'campanhapolitica' as instagram,
       'www.campanha.com.br' as website
from campaign;

-- Insert financial data
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.campaign_financials (campaign_id, budget_total, spent_today, balance, spending_limit, total_spent)
select campaign.id, 500000, 3240, 145000, 600000, 355000 from campaign;

-- Insert expense categories
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.expense_categories (campaign_id, name, value, color)
select campaign.id, data.name, data.value, data.color
from campaign,
     (values
        ('Pessoal', 150000, '#3b82f6'),
        ('Logística', 80000, '#f59e0b'),
        ('Mkt Impresso', 45000, '#10b981'),
        ('Mkt Digital', 80000, '#8b5cf6')
     ) as data(name, value, color);

-- Insert locations
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.campaign_locations (campaign_id, name, status, coordinates)
select campaign.id, data.name, data.status, jsonb_build_object('x', data.x, 'y', data.y)
from campaign,
     (values
        ('Agulhas Negras', 'high', 30, 40),
        ('Porto Real', 'medium', 60, 30),
        ('Quatis', 'low', 50, 60)
     ) as data(name, status, x, y);

-- Insert digital metrics
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.digital_metrics (campaign_id, invested, reach, leads, videos_produced, video_goal)
select campaign.id, 12500, 45000, 320, 3, 5 from campaign;

-- Insert inventory items
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.inventory_items (campaign_id, name, location, quantity, status, item_type)
select campaign.id, data.name, data.location, data.quantity, data.status, data.item_type
from campaign,
     (values
        ('Praguinhas', 'Porto Real', 150, 'low', 'material'),
        ('Santinhos', 'Sede', 5000, 'ok', 'material'),
        ('Bandeiras', 'Van 01', 12, 'ok', 'material'),
        ('Combustível (Vale)', 'Posto Parceiro', 200, 'ok', 'fuel'),
        ('Kit Lanche (Staff)', 'Copa Sede', 20, 'low', 'food')
     ) as data(name, location, quantity, status, item_type);

-- Insert tasks
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.tasks (campaign_id, title, description, status, assignee, cost)
select campaign.id, data.title, data.description, data.status, data.assignee, data.cost
from campaign,
     (values
        ('Arte: Convite Caminhada', 'Criar card para WhatsApp convidando para caminhada de sábado.', 'creation', 'Designer', NULL),
        ('Vídeo: Depoimento Dona Maria', 'Edição do vídeo captado ontem na feira.', 'briefing', 'Editor', NULL),
        ('Impulsionamento: Post da Saúde', 'Segmentação para mulheres 35-50 anos.', 'done', 'Gestor', 500.00)
     ) as data(title, description, status, assignee, cost);

-- Insert events
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.events (campaign_id, title, date, location, event_type, status, weather, logistics)
select campaign.id, data.title, data.date::date, data.location, data.event_type, data.status, data.weather,
       jsonb_build_object(
         'vehicles', data.vehicles,
         'staffCount', data.staff_count,
         'dietaryRestrictions', data.dietary_restrictions,
         'fuelEstimatedLiters', data.fuel_estimated_liters,
         'materials', data.materials,
         'permitsChecked', data.permits_checked
       )
from campaign,
     (values
        ('Caminhada Centro', current_date, 'Centro, Resende', 'show', 'pending', 'sunny', array['Carro de Som 01'], 15, true, 10, array['1000 Santinhos'], true),
        ('Carreata Zona Norte', current_date + interval '1 day', 'Cidade Alegria', 'show', 'pending', 'rain', array['Carro do Candidato', 'Carro de Som 01'], 30, false, 50, array['500 Bandeiras'], false)
     ) as data(title, date, location, event_type, status, weather, vehicles, staff_count, dietary_restrictions, fuel_estimated_liters, materials, permits_checked);

-- Insert transactions
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.transactions (campaign_id, description, amount, txn_date, category, source, asset_linked)
select campaign.id, data.description, data.amount, data.txn_date::date, data.category, data.source, data.asset_linked
from campaign,
     (values
        ('Impulsionamento: Post da Saúde', 500, current_date, 'Marketing', 'marketing_task', NULL),
        ('Abastecimento Van 01 (OCR)', 350, current_date, 'Logística', 'ocr', 'Van Equipe Placa KXYZ-999')
     ) as data(description, amount, txn_date, category, source, asset_linked);

-- Insert team members
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.team_members (campaign_id, name, role, phone, email, photo_url, status)
select campaign.id, data.name, data.role, data.phone, data.email, data.photo_url, data.status
from campaign,
     (values
        ('Ana Silva', 'Coord. Marketing', '24 99999-0001', 'ana@campanha.com', 'https://i.pravatar.cc/150?u=ana', 'active'),
        ('Carlos Souza', 'Motorista Van', '24 99999-0002', 'carlos@campanha.com', 'https://i.pravatar.cc/150?u=carlos', 'busy'),
        ('Dr. Fernando', 'Jurídico', '24 99999-0003', 'juridico@campanha.com', 'https://i.pravatar.cc/150?u=fernando', 'offline')
     ) as data(name, role, phone, email, photo_url, status);

-- Insert module flags
with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.module_flags (campaign_id, module_key, enabled)
select campaign.id, data.module_key, data.enabled
from campaign,
     (values
        ('dashboard', true),
        ('analytics', false),
        ('crm', true),
        ('agenda', false),
        ('marketing', true),
        ('marketingAdvanced', false),
        ('finance', true),
        ('advancedFinance', false),
        ('canvas', true),
        ('accounting', false),
        ('polls', false),
        ('volunteers', false),
        ('team', true),
        ('fleet', false),
        ('legal', false),
        ('compliance', false),
        ('settings', true),
        ('profile', true)
     ) as data(module_key, enabled)
on conflict (campaign_id, module_key) do update set enabled = excluded.enabled;