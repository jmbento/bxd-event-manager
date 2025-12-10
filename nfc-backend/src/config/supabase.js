/**
 * Configuração do cliente Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas.');
  console.warn('O sistema vai usar armazenamento em memória para desenvolvimento.');
}

// Cliente com service role (acesso total - usar apenas no backend!)
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = { supabase };
