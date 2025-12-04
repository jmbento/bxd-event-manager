# Supabase Setup for Bento Campaign Dashboard

These scripts prepare a production-ready backing store for the dashboard.

## 1. Create / Select Supabase Project
1. Log into [Supabase](https://app.supabase.com/).
2. Create or select the project reserved for Bento Campaign.
3. Inside **Project Settings → API**, copy the following values for later:
   - `Project URL`
   - `anon` key
   - `service_role` key (keep it secret; never ship to frontend)

## 2. Run schema
1. Open **SQL Editor → New query**.
2. Paste the contents of `supabase/schema.sql`.
3. Execute. It will
   - Create all tables, triggers and helper functions
   - Enable Row Level Security (RLS)
   - Add member-based policies (authenticated users only) with optional public read for demo campaigns

> ❗ The script references `auth.users`. Ensure the default authentication schema exists (it does for new projects).

## 3. Seed demo campaign
1. Still in the SQL editor, run the contents of `supabase/seed.sql`.
2. Add yourself as campaign owner:
   ```sql
   insert into public.campaign_members (campaign_id, user_id, role)
   values (
     (select id from public.campaigns where slug = 'bento-demo'),
     '<YOUR-AUTH-USER-ID>',
     'admin'
   )
   on conflict (campaign_id, user_id) do nothing;
   ```
   Replace `<YOUR-AUTH-USER-ID>` with the UUID from **Authentication → Users**.

## 4. Configure storage (optional)
If you plan to host uploads (fotos, recibos):
1. Go to **Storage → Create bucket** (e.g., `campaign-uploads`).
2. Keep it **private**.
3. Define storage policies tied to `campaign_members` similar to the tables above.

## 5. Environment variables for the app
Create a `.env` in the project root (same level as `package.json`):
```
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_DEMO_CAMPAIGN_SLUG=bento-demo
```
> Do **not** expose the service key on the frontend. Use it only for secure scripts or edge functions.

## 6. Install dependencies locally
```
npm install
```
This picks up `@supabase/supabase-js` added to `package.json`.

## 7. Next steps (automation)
- Use Supabase Edge Functions or an external worker to handle Gemini calls with the service key.
- Add migrations (`supabase/migrations/<timestamp>_init.sql`) if you prefer versioned deploys.
- Configure GitHub Actions to run `supabase db push` or `supabase db diff` in CI for schema drift control.

With these steps complete, the React app can start reading live data from Supabase instead of mock objects.
