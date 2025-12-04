-- Seed demo campaign data
insert into public.campaigns (name, slug, description, public_read)
values ('Bento Demo 2025', 'bento-demo', 'Campanha municipal demonstrativa para investidores', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  public_read = excluded.public_read;

-- Link owner (adjust auth user id manually after running)
-- Example: insert into public.campaign_members (campaign_id, user_id, role)
-- values ((select id from public.campaigns where slug = 'bento-demo'), '00000000-0000-0000-0000-000000000000', 'admin')
-- on conflict (campaign_id, user_id) do nothing;

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
from campaign
on conflict (campaign_id) do update set
  name = excluded.name,
  number = excluded.number,
  role = excluded.role,
  party = excluded.party,
  coalition = excluded.coalition,
  cnpj = excluded.cnpj,
  tse_status = excluded.tse_status,
  photo_url = excluded.photo_url,
  theme_color = excluded.theme_color,
  instagram = excluded.instagram,
  website = excluded.website;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.campaign_financials (campaign_id, budget_total, spent_today, balance, spending_limit, total_spent)
select campaign.id, 500000, 3240, 145000, 600000, 355000 from campaign
on conflict (campaign_id) do update set
  budget_total = excluded.budget_total,
  spent_today = excluded.spent_today,
  balance = excluded.balance,
  spending_limit = excluded.spending_limit,
  total_spent = excluded.total_spent;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.expense_categories where campaign_id = (select id from campaign);

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
     ) as data(name, value, color)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.campaign_locations where campaign_id = (select id from campaign);

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
     ) as data(name, status, x, y)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.digital_metrics (campaign_id, invested, reach, leads, videos_produced, video_goal)
select campaign.id, 12500, 45000, 320, 3, 5 from campaign
on conflict (campaign_id) do update set
  invested = excluded.invested,
  reach = excluded.reach,
  leads = excluded.leads,
  videos_produced = excluded.videos_produced,
  video_goal = excluded.video_goal;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.inventory_items where campaign_id = (select id from campaign);

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
     ) as data(name, location, quantity, status, item_type)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.tasks where campaign_id = (select id from campaign);

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
     ) as data(title, description, status, assignee, cost)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.events where campaign_id = (select id from campaign);

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
         'legalNotificationGenerated', data.legal_notification
       )
from campaign,
     (values
        ('Caminhada Centro', current_date, 'Centro, Resende', 'caminhada', 'pending', 'sunny', array['Carro de Som 01'], 15, true, 10, array['1000 Santinhos'], true),
        ('Carreata Zona Norte', current_date + interval '1 day', 'Cidade Alegria', 'carreata', 'pending', 'rain', array['Carro do Candidato', 'Carro de Som 01', 'Trio Elétrico'], 30, false, 50, array['500 Bandeiras'], false)
     ) as data(title, date, location, event_type, status, weather, vehicles, staff_count, dietary_restrictions, fuel_estimated_liters, materials, legal_notification)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.transactions where campaign_id = (select id from campaign);

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.transactions (campaign_id, description, amount, txn_date, category, source, asset_linked)
select campaign.id, data.description, data.amount, data.txn_date::date, data.category, data.source, data.asset_linked
from campaign,
     (values
        ('Impulsionamento: Post da Saúde', 500, current_date, 'Marketing', 'marketing_task', NULL),
        ('Abastecimento Van 01 (OCR)', 350, current_date, 'Logística', 'ocr', 'Van Equipe Placa KXYZ-999')
     ) as data(description, amount, txn_date, category, source, asset_linked)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.team_members where campaign_id = (select id from campaign);

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
     ) as data(name, role, phone, email, photo_url, status)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
delete from public.vehicles where campaign_id = (select id from campaign);

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
)
insert into public.vehicles (campaign_id, name, plate, vehicle_type, current_km, status)
select campaign.id, data.name, data.plate, data.vehicle_type, data.current_km, data.status
from campaign,
     (values
        ('Van Equipe', 'KXYZ-999', 'van', 45000, 'active'),
        ('Carro Som 01', 'LABC-123', 'sound_car', 12000, 'active'),
        ('Carro Candidato', 'BTO-5555', 'car', 8500, 'active')
     ) as data(name, plate, vehicle_type, current_km, status)
;

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
), vehicle as (
  select v.id from public.vehicles v join campaign c on v.campaign_id = c.id where v.plate = 'KXYZ-999' limit 1
)
delete from public.fuel_logs where campaign_id = (select id from campaign);

with campaign as (
  select id from public.campaigns where slug = 'bento-demo' limit 1
), vehicle as (
  select v.id from public.vehicles v join campaign c on v.campaign_id = c.id where v.plate = 'KXYZ-999' limit 1
)
insert into public.fuel_logs (campaign_id, vehicle_id, logged_at, liters, cost, km_at_refuel, station_name)
select campaign.id, vehicle.id, timezone('utc', now()), 50, 290, 44800, 'Posto Shell Centro'
from campaign, vehicle
on conflict do nothing;

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
