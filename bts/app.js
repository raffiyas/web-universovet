const SUPABASE_URL = window.UNIVERSOVET_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.UNIVERSOVET_SUPABASE_ANON_KEY || '';
const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const cleanPhone = (p) => (p || '').replace(/\D/g, '');
const moneyCoupons = (amount) => Math.floor((Number(amount) || 0) / 5000);
function requireSupabase(){ if(!supabaseClient) throw new Error('Falta la clave pública/publishable de Supabase. Configura la variable pública de Vercel y ejecuta el build antes de publicar.'); return supabaseClient; }
function firstName(name){ return (name || '').trim().split(/\s+/)[0] || 'Hola'; }
function safeString(value, fallback = ''){ return typeof value === 'string' ? value : fallback; }
function normalizeCoupons(coupons, limit = 100){
  if(!Array.isArray(coupons)) return [];
  return coupons.slice(0, limit).map((coupon) => {
    const rawCode = typeof coupon === 'string' ? coupon : coupon?.code;
    return { code: safeString(rawCode).trim(), status: safeString(coupon?.status, 'valid') || 'valid' };
  }).filter((coupon) => coupon.code);
}
function setMessage(el, text, type='info'){ if(!el) return; el.textContent = safeString(text, ''); el.className = `message ${type}`; el.hidden = false; }
async function lookupCoupons(phone){
  const sb = requireSupabase();
  const { data, error } = await sb.rpc('lookup_bts_coupons_public', { p_phone: phone });
  if(error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if(!result || typeof result !== 'object') return null;
  const coupons = normalizeCoupons(result.coupon_codes).sort((a,b)=>a.code.localeCompare(b.code));
  const tutorName = safeString(result.tutor_name, '').trim();
  const petName = safeString(result.pet_name, '').trim();
  return {
    participant: { full_name: tutorName, coupon_count: Number(result.total_coupons) || coupons.length },
    coupons,
    pets: petName ? [{ name: petName }] : []
  };
}
async function ensureSession(){
  const sb = requireSupabase();
  const { data } = await sb.auth.getSession();
  return data.session;
}
async function signIn(email,password){ return requireSupabase().auth.signInWithPassword({email,password}); }
async function signOut(){ return requireSupabase().auth.signOut(); }
async function findParticipantByPhone(phone){
 const sb=requireSupabase(); const normalized=cleanPhone(phone);
 const {data,error}=await sb.from('participants').select('*,pets(*)').or(`phone.eq.${phone},phone.eq.${normalized}`).limit(1);
 if(error) throw error; return data?.[0] || null;
}
async function createParticipant(payload, pet){
 const sb=requireSupabase(); const {data,error}=await sb.from('participants').insert(payload).select().single(); if(error) throw error;
 if(pet?.name){ const {error:petError}=await sb.from('pets').insert({...pet,participant_id:data.id}); if(petError) throw petError; }
 return data;
}
async function createCoupons(participantId, sourceType, sourceId, count){
 const sb=requireSupabase(); if(count < 1) return [];
 const {data,error}=await sb.rpc('generate_bts_coupons',{p_participant_id:participantId,p_source_type:sourceType,p_source_id:sourceId,p_count:count});
 if(error) throw error; return data || [];
}
async function loadDashboard(){
 const sb=requireSupabase();
 const [participants,coupons,transactions,bonus] = await Promise.all([
  sb.from('participants').select('id', {count:'exact', head:true}), sb.from('coupons').select('id', {count:'exact', head:true}).eq('status','valid'), sb.from('transactions').select('id',{count:'exact',head:true}), sb.from('bonus').select('id',{count:'exact',head:true})]);
 $('#summaryCards').innerHTML = [['Participantes',participants.count],['Cupones válidos',coupons.count],['Servicios/compras',transactions.count],['Bonus registrados',bonus.count],['Fecha sorteo','10 de septiembre de 2026']].map(([a,b])=>`<div class="card"><p class="small">${a}</p><h3>${b ?? 0}</h3></div>`).join('');
}
async function loadCoupons(){
 const sb=requireSupabase(); const q=$('#couponSearch')?.value?.toLowerCase()||'';
 const {data,error}=await sb.from('coupons').select('id,code,status,created_at,source_type,participants(full_name,phone,pets(name))').order('created_at',{ascending:false}).limit(300); if(error) throw error;
 const rows=(data||[]).filter(c=>!q || JSON.stringify(c).toLowerCase().includes(q));
 $('#couponsTable').innerHTML = rows.map(c=>`<tr><td>${c.code}</td><td>${c.participants?.full_name||''}</td><td>${c.participants?.phone||''}</td><td>${c.participants?.pets?.[0]?.name||''}</td><td>${c.source_type}</td><td>${new Date(c.created_at).toLocaleDateString('es-CL')}</td><td><span class="status ${c.status==='void'?'danger':c.status==='winner'?'success':''}">${c.status}</span></td><td>${c.status==='valid'?`<button class="btn btn-secondary" data-void="${c.id}">Anular</button>`:''}</td></tr>`).join('');
 $$('[data-void]').forEach(b=>b.onclick=async()=>{ if(confirm('¿Anular este cupón?')){ await sb.from('coupons').update({status:'void'}).eq('id',b.dataset.void); loadCoupons(); loadDashboard(); }});
}
window.BTSApp={setMessage, firstName, $, $$, cleanPhone, moneyCoupons, safeString, normalizeCoupons, lookupCoupons, ensureSession, signIn, signOut, findParticipantByPhone, createParticipant, createCoupons, loadDashboard, loadCoupons, requireSupabase};
