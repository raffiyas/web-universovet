const A = BTSApp;
const ADMIN_DENIED_MESSAGE = 'No tienes permisos para acceder a este panel.';
const RAFFLE_UNLOCK_DATE = '2026-09-10';
const RAFFLE_OFFICIAL_CONFIRMATION = 'Esta acción realizará el sorteo oficial y no debe usarse durante pruebas.';

async function verifyAdminAccess(session) {
  if (!session?.user?.id) return false;
  const { data, error } = await A.requireSupabase()
    .from('admin_users')
    .select('id,active')
    .eq('user_id', session.user.id)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function requireAdminSession() {
  const session = await A.ensureSession();
  if (!session) return false;
  const allowed = await verifyAdminAccess(session);
  if (!allowed) {
    await A.signOut();
    A.setMessage(A.$('#loginMsg'), ADMIN_DENIED_MESSAGE, 'danger');
    return false;
  }
  return true;
}

async function boot() {
  hidePanel();
  try {
    if (await requireAdminSession()) showPanel();
  } catch (e) {
    await A.signOut();
    A.setMessage(A.$('#loginMsg'), e.message, 'danger');
  }
}

function hidePanel() {
  A.$('#panel').hidden = true;
  A.$('#logout').hidden = true;
  A.$('#login').hidden = false;
}

function showPanel() {
  A.$('#login').hidden = true;
  A.$('#panel').hidden = false;
  A.$('#logout').hidden = false;
  A.loadDashboard();
  A.loadCoupons();
  updateRaffleCount();
  updateRaffleLock();
}

A.$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const loginMsg = A.$('#loginMsg');
  loginMsg.hidden = true;
  const { data, error } = await A.signIn(A.$('#email').value, A.$('#password').value);
  if (error) return A.setMessage(loginMsg, error.message, 'danger');
  try {
    if (await verifyAdminAccess(data.session)) showPanel();
    else {
      await A.signOut();
      hidePanel();
      A.setMessage(loginMsg, ADMIN_DENIED_MESSAGE, 'danger');
    }
  } catch (err) {
    await A.signOut();
    hidePanel();
    A.setMessage(loginMsg, err.message, 'danger');
  }
};
A.$('#logout').onclick=async()=>{await A.signOut();location.reload();};
A.$$('.tab-btn').forEach(b=>b.onclick=()=>{A.$$('.tab-btn,.admin-section').forEach(x=>x.classList.remove('active'));b.classList.add('active');A.$('#'+b.dataset.tab).classList.add('active');if(b.dataset.tab==='cupones')A.loadCoupons();if(b.dataset.tab==='sorteo'){updateRaffleCount();updateRaffleLock();}});
A.$('#participantForm').onsubmit=async(e)=>{e.preventDefault();const f=new FormData(e.target);try{const p=await A.createParticipant({full_name:f.get('full_name'),phone:A.cleanPhone(f.get('phone')),email:f.get('email')||null,instagram:f.get('instagram')||null},{name:f.get('pet_name'),species:f.get('species'),breed:f.get('breed')||null});A.setMessage(A.$('#participantMsg'),`Participante creado: ${p.full_name}`,'success');e.target.reset();A.loadDashboard();}catch(err){A.setMessage(A.$('#participantMsg'),err.message,'danger')}};
A.$('#transactionForm').onsubmit=async(e)=>{e.preventDefault();const sb=A.requireSupabase(),f=new FormData(e.target), msg=A.$('#transactionMsg');try{let p=await A.findParticipantByPhone(f.get('phone'));if(!p) throw new Error('Participante no encontrado. Regístralo primero.');let pet=(p.pets||[]).find(x=>x.name.toLowerCase()===String(f.get('pet_name')).toLowerCase());if(!pet){const {data,error}=await sb.from('pets').insert({participant_id:p.id,name:f.get('pet_name')}).select().single();if(error)throw error;pet=data;}const count=A.moneyCoupons(f.get('amount'));const {data,error}=await sb.from('transactions').insert({participant_id:p.id,pet_id:pet.id,transaction_date:f.get('transaction_date'),type:f.get('type'),amount:Number(f.get('amount')),receipt_number:f.get('receipt_number')||null,notes:f.get('notes')||null,coupons_generated:count}).select().single();if(error)throw error;await A.createCoupons(p.id,'transaction',data.id,count);A.setMessage(msg,`Atención guardada. Cupones generados: ${count}`,'success');e.target.reset();A.loadDashboard();A.loadCoupons();}catch(err){A.setMessage(msg,err.message,'danger')}};
A.$('#bonusType').onchange=()=>{A.$('#bonusCoupons').value=A.$('#bonusType').value==='Referido'?2:A.$('#bonusType').value==='Historia Instagram'?1:A.$('#bonusCoupons').value};
A.$('#bonusForm').onsubmit=async(e)=>{e.preventDefault();const sb=A.requireSupabase(),f=new FormData(e.target),msg=A.$('#bonusMsg');try{const p=await A.findParticipantByPhone(f.get('phone'));if(!p) throw new Error('Participante no encontrado.');const count=Number(f.get('coupons_generated'))||0;const {data,error}=await sb.from('bonus').insert({participant_id:p.id,bonus_type:f.get('bonus_type'),description:f.get('description')||null,coupons_generated:count,verified:true}).select().single();if(error)throw error;await A.createCoupons(p.id,'bonus',data.id,count);A.setMessage(msg,`Bonus guardado. Cupones generados: ${count}`,'success');e.target.reset();A.loadDashboard();A.loadCoupons();}catch(err){A.setMessage(msg,err.message,'danger')}};
A.$('#couponSearch').oninput=()=>A.loadCoupons();
function getSantiagoDateString(date = new Date()){
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function isRaffleLocked(){return getSantiagoDateString()<RAFFLE_UNLOCK_DATE;}
function updateRaffleLock(){const btn=A.$('#drawBtn'),msg=A.$('#raffleLockMsg');if(!btn)return;const locked=isRaffleLocked();btn.disabled=locked;btn.title=locked?'El sorteo oficial se habilitará el 10 de septiembre de 2026.':'';if(msg){msg.hidden=!locked;msg.textContent='El botón “Realizar sorteo” está bloqueado hasta el 10 de septiembre de 2026 para evitar sorteos accidentales durante pruebas.';}}
function confirmOfficialRaffle(){
  if(isRaffleLocked()){
    updateRaffleLock();
    alert('El sorteo oficial está bloqueado hasta el 10 de septiembre de 2026.');
    return false;
  }
  if(!confirm(`${RAFFLE_OFFICIAL_CONFIRMATION} ¿Deseas continuar?`))return false;
  return confirm('Confirmación final: se seleccionará y registrará el cupón ganador oficial. Esta acción no es para pruebas. ¿Realizar sorteo oficial ahora?');
}
async function updateRaffleCount(){const {count}=await A.requireSupabase().from('coupons').select('id',{count:'exact',head:true}).eq('status','valid');A.$('#raffleCount').textContent=count||0;updateRaffleLock();}
A.$('#drawBtn').onclick=async()=>{if(!confirmOfficialRaffle())return;const sb=A.requireSupabase(),box=A.$('#raffleResult');try{const {data:valid,error}=await sb.from('coupons').select('id,code,participant_id,participants(full_name,phone,pets(name))').eq('status','valid');if(error)throw error;if(!valid?.length)throw new Error('No hay cupones válidos.');const winner=valid[Math.floor(Math.random()*valid.length)];const {data:setting}=await sb.from('raffle_settings').select('id').eq('status','active').limit(1).maybeSingle();await sb.from('raffle_results').insert({raffle_settings_id:setting?.id||null,winning_coupon_id:winner.id,winner_participant_id:winner.participant_id,total_valid_coupons:valid.length,method:'Math.random sobre cupones con status valid'});await sb.from('coupons').update({status:'winner'}).eq('id',winner.id);box.hidden=false;box.className='message success';box.innerHTML=`<strong>Cupón ganador: ${winner.code}</strong><br>Tutor: ${winner.participants.full_name}<br>Teléfono: ${winner.participants.phone}<br>Mascota: ${winner.participants.pets?.[0]?.name||'No registrada'}`;A.loadDashboard();A.loadCoupons();updateRaffleCount();}catch(err){A.setMessage(box,err.message,'danger')}};
boot();
