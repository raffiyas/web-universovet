import { writeFileSync } from 'node:fs';

const SUPABASE_URL = 'https://ysevcmlwtwcokjvimpiy.supabase.co';
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!anonKey) {
  throw new Error(
    'Missing public Supabase anon key. Configure SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY / PUBLIC_SUPABASE_ANON_KEY) in Vercel before building.'
  );
}

if (/service_role|secret/i.test(anonKey)) {
  throw new Error('Refusing to expose a Supabase service_role or secret key in frontend config. Use the public anon/publishable key only.');
}

const config = `// Generated at build time. This file is safe for the browser only with the public Supabase anon/publishable key.\nwindow.UNIVERSOVET_SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};\nwindow.UNIVERSOVET_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};\n`;

writeFileSync(new URL('../bts/supabase-config.js', import.meta.url), config);
console.log('Wrote bts/supabase-config.js for', SUPABASE_URL);
