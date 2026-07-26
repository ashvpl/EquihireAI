// backend/src/config/supabase.js
'use strict';

const { createClient } = require("@supabase/supabase-js");
const { secrets } = require("../core/secrets/secretManager");

const supabaseUrl = secrets.get('SUPABASE_URL');
const supabaseKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');

// ── Startup validation ────────────────────────────────────────────────────────
if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_ID')) {
  throw new Error(
    '❌ SUPABASE_URL is missing or is still a placeholder.\n' +
    '   Fix: Add SUPABASE_URL=https://<project-id>.supabase.co to Railway Variables.'
  );
}
if (!supabaseKey || supabaseKey.includes('YOUR_SERVICE_ROLE_KEY')) {
  throw new Error(
    '❌ SUPABASE_SERVICE_ROLE_KEY is missing or is still a placeholder.\n' +
    '   Fix: Add SUPABASE_SERVICE_ROLE_KEY=eyJ... to Railway Variables.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
