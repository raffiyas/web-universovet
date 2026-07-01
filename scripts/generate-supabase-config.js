const fs = require('node:fs');
const path = require('node:path');

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

function fail(message) {
  console.error(`[supabase-config] ${message}`);
  process.exit(1);
}

if (!url) {
  fail('Missing SUPABASE_URL environment variable. Configure it in Vercel before building.');
}

if (!anonKey) {
  fail('Missing SUPABASE_ANON_KEY environment variable. Configure the public anon/publishable key in Vercel before building.');
}

let parsedUrl;
try {
  parsedUrl = new URL(url);
} catch {
  fail('SUPABASE_URL must be a valid URL.');
}

if (parsedUrl.protocol !== 'https:' || !parsedUrl.hostname.endsWith('.supabase.co')) {
  fail('SUPABASE_URL must be an https://*.supabase.co URL.');
}

if (/service_role/i.test(anonKey)) {
  fail('SUPABASE_ANON_KEY must be a public anon/publishable key, not a service_role key.');
}

const output = `// Generated during build from Vercel environment variables. Do not put service_role keys here.\nwindow.UNIVERSOVET_SUPABASE_URL = ${JSON.stringify(url)};\nwindow.UNIVERSOVET_SUPABASE_ANON_KEY = ${JSON.stringify(anonKey)};\n`;

const outputPath = path.join(__dirname, '..', 'bts', 'supabase-config.js');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`[supabase-config] Wrote ${path.relative(process.cwd(), outputPath)} for ${parsedUrl.hostname}.`);
