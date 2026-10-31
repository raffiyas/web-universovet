import { calculateVaccines } from './vaccines/vaccineCalculator.mjs';
import { vaccineLabels, statusLabels } from './vaccines/vaccineContent.mjs';
import { vaccineProducts, getProduct } from './vaccines/vaccineProducts.mjs';
import { clinicDay } from './vaccines/vaccinePlan.mjs';
import { resultExperience } from './resultExperience.mjs';
import { setupCardReader } from './cardReader.mjs';
const root = document.querySelector('#calculator');
const form = root.querySelector('form');
const steps = [...root.querySelectorAll('[data-step]')];
const initial = () => ({ species: 'dog', ill: 'no', reaction: 'no', history: 'unknown', doses: [], memories: [], pendingCards: [], risks: [], felv: 'unknown' });
let input = initial(), step = 0, result = null;
const riskLabels = {
 dog: [['parks','Sale regularmente a parques'],['dogs','Tiene contacto frecuente con otros perros'],['grooming','Va a peluquería canina'],['boarding','Va a guardería u hotel'],['multiDog','Vive con varios perros'],['rodents','Accede a patios, parcelas o lugares con roedores'],['water','Tiene contacto con charcos, canales o agua estancada'],['travel','Viaja frecuentemente'],['rural','Vive o visita zonas rurales']],
 cat: [['indoor','Vive exclusivamente dentro de casa'],['outdoor','Sale al exterior'],['otherCats','Tiene contacto con gatos ajenos al hogar'],['multiCat','Convive con varios gatos'],['newCats','Ingresan gatos nuevos al hogar'],['shelter','Ha estado en refugios, hoteles o criaderos']]
};
const antigenLabels = {
 dog: [['CDV','Distemper'],['CAV','Adenovirus'],['CPV','Parvovirus'],['CPiV','Parainfluenza'],['Leptospira','Leptospira'],['Bordetella','Bordetella'],['Rabies','Rabia'],['CECoV','Coronavirus entérico']],
 cat: [['FPV','Panleucopenia'],['FHV1','Herpesvirus'],['FCV','Calicivirus'],['FeLV','Leucemia felina'],['Chlamydia','Chlamydia felis'],['Rabies','Rabia']]
};
const el = (tag, text, className) => { const n = document.createElement(tag); if (text) n.textContent = text; if (className) n.className = className; return n; };
const track = name => { if (typeof window.gtag === 'function') window.gtag('event', name); };
const localToday = () => clinicDay(new Date());
root.querySelectorAll('[type=date]').forEach(n => n.max = localToday());
function checkOptions(container, entries, name) {
 container.replaceChildren();
 entries.forEach(([value, text]) => { const label = el('label', '', 'vaccine-check'), control = el('input'); control.type='checkbox'; control.name=name; control.value=value; label.append(control, document.createTextNode(text)); container.append(label); });
}
function renderRiskGroups(){
 const host=root.querySelector('#risks');
 checkOptions(host,riskLabels[input.species],'risk');
 const controls=new Map([...host.querySelectorAll('input[name="risk"]')].map(c=>[c.value,c.closest('label')]));
 host.replaceChildren();
 const groups=input.species==='dog'
 ?[
  ['¿Tiene contacto con otros perros?',['dogs','multiDog']],
  ['¿Visita alguno de estos lugares?',['parks','grooming','boarding']],
  ['¿Tiene contacto con agua estancada o lugares con roedores?',['water','rodents']],
  ['¿Viaja o visita zonas rurales?',['travel','rural']]
 ]:[
  ['¿Sale de casa o permanece en el interior?',['indoor','outdoor']],
  ['¿Tiene contacto con otros gatos?',['otherCats','multiCat','newCats']],
  ['¿Visita refugios, hoteles o criaderos?',['shelter']]
 ];
 groups.forEach(([question,values],i)=>{
  const group=el('fieldset','','risk-group');
  group.append(el('legend',question));
  const choices=el('div','','risk-subchoices');
  values.forEach(value=>{if(controls.has(value))choices.append(controls.get(value));});
  if(values.length>1&&!(input.species==='cat'&&i===0)){
   const explanation=el('p',i===1&&input.species==='dog'?'Puedes marcar más de una opción.':'Marca las situaciones que correspondan.','risk-hint');
   group.append(explanation);
  }
  group.append(choices);host.append(group);
 });
}
function speciesFields() {
 input.memories=[];input.pendingCards=[];
 root.querySelector('#memory-vaccine').replaceChildren(...vaccineLabels[input.species].map(x=>{const option=el('option',x.text);option.value=x.text;return option;}));
 renderMemories();
 root.querySelector('#memory-form').hidden=root.querySelector('#history').value!=='some';
 root.querySelector('#dose-fields').hidden=false;
 root.querySelector('#another-dose').hidden=true;
 root.querySelector('#dose-status').textContent='';
 const labels = root.querySelector('#dose-label'); labels.replaceChildren();
 vaccineLabels[input.species].forEach(x => { const opt = el('option', x.text); opt.value=x.value; labels.append(opt); });
 labels.value='other';
 checkOptions(root.querySelector('#antigens'), antigenLabels[input.species], 'antigen');
 const products = root.querySelector('#product'); products.replaceChildren();
 const unknown = el('option','Otro / no lo sé'); unknown.value=''; products.append(unknown);
 vaccineProducts.filter(p=>p.species.includes(input.species)).forEach(p=>{const option=el('option',p.name);option.value=p.id;products.append(option);});
 selectProduct();
 renderRiskGroups();
 root.querySelector('#felv-field').hidden = input.species !== 'cat';
 renderDoses();
}
function error(message='') { const n = root.querySelector('#error'); n.textContent=message; n.hidden=!message; }
function showStep() {
 steps.forEach((n,i)=>n.hidden=i!==step);
 root.querySelectorAll('.vaccine-progress li').forEach((n,i)=>{ n.classList.toggle('is-active',i===step); if(i===step)n.setAttribute('aria-current','step'); else n.removeAttribute('aria-current'); });
 root.querySelector('#back').hidden=step===0;
 root.querySelector('#back').textContent=step===3?'Editar respuestas':'Volver';
 root.querySelector('#next').hidden=step===3;
 root.querySelector('#next').textContent=step===2?'Ver resultado':'Continuar';
 root.querySelector('#restart').hidden=step!==3;
 error();
 const heading=steps[step].querySelector('h2'); heading.focus();
}
function collect() {
 const f = new FormData(form);
 input.name=String(f.get('pet-name')||'').trim();
 input.birthDate = f.has('unknown-date') ? undefined : String(f.get('birth')||'');
 input.approximate = f.has('unknown-date') ? { value:Number(f.get('age')),unit:String(f.get('age-unit')) } : undefined;
 input.ill=String(f.get('ill')); input.reaction=String(f.get('reaction')); input.history=String(f.get('history'));
 input.risks=f.getAll('risk'); input.felv=String(f.get('felv'));
}
function validate() {
 if(step!==0)return true;
 const unknown=root.querySelector('#unknown-date').checked;
 const age=root.querySelector('#age'); const unit=root.querySelector('#age-unit').value;
 if(unknown && (!age.value || Number(age.value)<=0 || Number(age.value)*({weeks:7,months:30.4375,years:365.25}[unit])>40*365.25)){error('Ingresa una edad aproximada válida (hasta 40 años).');return false;}
 const birth=root.querySelector('#birth');
 if(!unknown && (!birth.value || birth.value>localToday())) { error('Ingresa una fecha de nacimiento válida o marca que no la conoces.');return false; }
 return true;
}
function renderDoses(){
 const list=root.querySelector('#doses'); list.replaceChildren();
 if(!input.doses.length){root.querySelector('#dose-fields').hidden=false;root.querySelector('#another-dose').hidden=true;root.querySelector('#dose-status').textContent='';}
 root.querySelector('#dose-empty').hidden=!!input.doses.length;
 input.doses.forEach((d,i)=>{ const row=el('li');const info=el('div');info.append(el('strong',getProduct(d.productId)?.name||vaccineLabels[input.species].find(x=>x.value===d.label)?.text),el('p',formatDate(d.date)),el('small',d.antigens.length?d.antigens.map(a=>antigenLabels[input.species].find(([id])=>id===a)?.[1]||a).join(' · '):'Componentes pendientes de revisión'));row.append(info);
 const remove=el('button','Quitar');remove.type='button';remove.setAttribute('aria-label',`Quitar dosis ${i+1}`);remove.addEventListener('click',()=>{input.doses.splice(i,1);renderDoses();});row.append(remove);list.append(row); });
}
function selectProduct(){
 const product=getProduct(root.querySelector('#product').value);
 root.querySelector('#dose-label').disabled=!!product;
 if(product){const group={puppy:'puppy',polyvalent:'polyvalent',rabies:'rabies',bordetella:'kennel'}[product.group];const labels=vaccineLabels[input.species];root.querySelector('#dose-label').value=labels.some(x=>x.value===group)?group:labels[0].value;}
 root.querySelectorAll('[name=antigen]').forEach(n=>{n.disabled=!!product;n.checked=product?product.antigens.includes(n.value):root.querySelector('#dose-label').value==='rabies'&&n.value==='Rabies';});
 root.querySelector('#antigen-details').hidden=!!product;
 root.querySelector('#antigen-details').open=false;
 root.querySelector('#product-help').textContent=product?`Reconocemos ${product.name}. No necesitas marcar sus componentes: los completamos automáticamente. Comprueba que el nombre coincida con la etiqueta de su carnet.`:'¿No encuentras la marca? Puedes dejar “Otro / no lo sé” y agregar lo que aparece en el carnet.';
}
const formatDate = value => new Intl.DateTimeFormat('es-CL',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00Z`));
const quantityText = r => r.quantity===null?'Por definir':r.optional?`${r.quantity} dosis · opción en consulta`:`${r.quantity} dosis ${r.quantity===1?'estimada':'estimadas'}`;
function renderPracticalPlan(){
 const plan=result.practicalPlan, summary=root.querySelector('#dose-summary');summary.replaceChildren();
 root.querySelector('#practical-plan').hidden=!plan.rows.some(r=>r.quantity!==null);
 const friendlyTitle=r=>({polyvalent:'Séxtuple / óctuple (polivalente)',rabies:'Antirrábica',bordetella:'KC (tos de las perreras)',puppy:'Puppy (vacuna de cachorro)','feline-core':'Triple felina'}[r.id]||r.title);
 plan.rows.filter(r=>!(r.id==='puppy' && r.quantity===0)).forEach(r=>{const item=el('article','','vaccine-dose-item');item.append(el('h4',friendlyTitle(r)),el('strong',r.quantity===null?'Revisar en consulta':r.quantity===0?'Sin dosis próximas estimadas':quantityText(r),'vaccine-dose-count'));const detail=el('details');detail.append(el('summary','Ver explicación y producto'),el('p',r.title),el('p',r.reason));item.append(detail);summary.append(item);});
 const notes=el('details');notes.append(el('summary','Cómo interpretar esta estimación'),...plan.notes.map(n=>el('p',n,'vaccine-disclaimer')));
 root.querySelector('#plan-notes').replaceChildren(el('p','Estas fechas son una guía, no una reserva de hora. El veterinario confirma cuándo aplicar cada vacuna; compartir una fecha no significa que deban aplicarse juntas.','vaccine-disclaimer'),notes);
 const calendar=root.querySelector('#dose-calendar');calendar.replaceChildren();
 const entries=plan.rows.flatMap(r=>r.dates.map((date,i)=>({date,text:`${friendlyTitle(r)} · ${r.dates.length>1?`dosis ${i+1} de ${r.dates.length}`:'1 dosis'}`}))).sort((a,b)=>a.date.localeCompare(b.date));
 const dates=new Map();entries.forEach(entry=>{if(!dates.has(entry.date))dates.set(entry.date,[]);dates.get(entry.date).push(entry.text);});
 dates.forEach((texts,date)=>{const item=el('li');item.append(el('strong',formatDate(date)));texts.forEach(text=>item.append(el('p',text)));calendar.append(item);});
 root.querySelector('#calendar-empty').hidden=!!entries.length;
 const follow=root.querySelector('#follow-ups');follow.replaceChildren();
 if(plan.followUps.length){follow.append(el('h3','Controles y refuerzos posteriores'));const list=el('ul');plan.followUps.forEach(f=>{const item=el('li');item.append(el('strong',formatDate(f.date)),el('p',f.text));list.append(item);});follow.append(list);}
}
function renderResult(){
 result=calculateVaccines(input.pendingCards.length?{...input,history:'some'}:input);
 root.querySelector('#result-heading').textContent=`El próximo paso de ${input.name||'tu mascota'}`;
 const age=result.ageDays<56?`${Math.floor(result.ageWeeks)} semanas`:result.ageDays<365?`${Math.floor(result.ageMonths)} meses`:`${Number(result.ageYears.toFixed(1)).toLocaleString('es-CL')} años`;
 root.querySelector('#result-age').textContent=`${input.species==='dog'?'Perro':'Gato'} · ${age}${input.approximate?' aproximadamente':''}`;
 const experience=resultExperience(input,result);
 root.querySelector('#next-step-title').textContent=experience.title;
 root.querySelector('#next-step-description').textContent=experience.description;
 root.querySelector('#next-step-preparation').textContent=experience.preparation;
 const remembered=root.querySelector('#remembered-vaccines');
 remembered.replaceChildren();
 remembered.hidden=!((input.history==='some'&&input.memories.length)||input.pendingCards.length);
 if(!remembered.hidden){
  remembered.append(el('h4',input.pendingCards.length?'Vacunas para revisar':'Lo que recuerdas'));
  input.pendingCards.forEach(v=>{const item=el('p',v.name+(v.date?' · '+formatDate(v.date):' · Fecha por confirmar')+' (producto pendiente de verificar)');remembered.append(item);});
  const list=el('ul');
  input.memories.forEach(m=>list.append(el('li',m.vaccine+' · '+m.time.toLowerCase())));
  if(input.memories.length)remembered.append(list);
  remembered.append(el('small','Los registros pendientes no se consideran dosis confirmadas para calcular el esquema.'));
 }
 root.querySelector('.vaccine-next-step').classList.toggle('needs-health-review',experience.healthReview);
 const message=[
  `${input.name||'Mi mascota'} · ${input.species==='dog'?'perro':'gato'} · ${age}${input.approximate?' aprox.':''}`,
  `Vacunas: ${experience.historyText}`,
  ...(input.history==='some'?input.memories.map(m=>`Recuerdo sin carnet: ${m.vaccine} · ${m.time}.`):[]),
  ...input.pendingCards.map(v=>`Lectura pendiente de confirmar: ${v.name}${v.date?' · '+v.date:''}.`),
  `Enfermedad o tratamiento: ${input.ill==='no'?'no informado':input.ill==='yes'?'sí':'no sé'}.`,
  `Reacción previa a vacunas: ${input.reaction==='no'?'no':input.reaction==='yes'?'sí':'no sé'}.`
 ].join('\n');
 root.querySelector('#result-whatsapp').href=`https://wa.me/56935677904?text=${encodeURIComponent(`Hola UniversoVet, quisiera consultar por sus vacunas.\n\n${message}\n\nVengo de la calculadora de vacunas.`)}`;
 root.querySelector('#booking').href=`https://wa.me/56935677904?text=${encodeURIComponent(`Hola UniversoVet, quisiera una hora para revisar sus vacunas.\n\n${message}\n\n¿Qué horarios tienen disponibles?\nVengo de la calculadora de vacunas.`)}`;
 root.querySelector('#share-status').textContent='';
 root.querySelectorAll('[data-step="3"] details').forEach(detail=>detail.open=false);
 const alerts=root.querySelector('#alerts'); alerts.replaceChildren(...result.alerts.map(x=>el('p',x,'vaccine-alert')));
 renderPracticalPlan();
 const cards=root.querySelector('#recommendations'); cards.replaceChildren();
 result.publicRecommendations.forEach(r=>{ const card=el('article','','vaccine-result');card.append(el('span',statusLabels[r.status],`vaccine-status vaccine-status--${r.status}`),el('h3',r.title),el('p',r.reason),el('strong','Próximo paso'),el('p',r.next));const detail=el('details');detail.append(el('summary','¿Por qué?'),el('p',r.why));card.append(detail);cards.append(card); });
 track('vaccine_calculator_completed');track(input.species==='dog'?'vaccine_calculator_dog':'vaccine_calculator_cat');
}
function summary(){const plan=result.practicalPlan;return `Plan orientativo de vacunación de ${input.name||'mi mascota'}.\n${plan.rows.map(r=>`${r.title}: ${quantityText(r)}. ${r.reason}${r.dates.length?` Fechas orientativas: ${r.dates.map(formatDate).join('; ')}.`:''}`).join('\n')}\n${plan.followUps.map(f=>`${formatDate(f.date)}: ${f.text}`).join('\n')}\n${plan.notes.join('\n')}\n${result.publicRecommendations.map(r=>`${r.title}: ${statusLabels[r.status]}. ${r.next}`).join('\n')}\nOrientación general; confirmar con un médico veterinario. ${document.querySelector('[rel=canonical]').href}`;}
function shareSummary(){return summary()+(input.history==='some'&&input.memories.length?'\nRecuerdos sin carnet, pendientes de confirmar:\n'+input.memories.map(m=>`${m.vaccine}: ${m.time}`).join('\n'):'');}
async function copy(){try{await navigator.clipboard.writeText(shareSummary());root.querySelector('#share-status').textContent='Resumen copiado.';}catch{root.querySelector('#share-status').textContent='No se pudo copiar. Puedes seleccionar el texto del resultado.';}}
form.addEventListener('submit',e=>e.preventDefault());
root.querySelector('#next').addEventListener('click',()=>{collect();if(!validate())return;if(step===0)track('vaccine_calculator_started');step++;if(step===3)renderResult();showStep();});
root.querySelector('#back').addEventListener('click',()=>{step--;showStep();});
root.querySelector('#restart').addEventListener('click',()=>{input=initial();form.reset();step=0;root.querySelector('#exact-age').hidden=false;root.querySelector('#estimated-age').hidden=true;root.querySelector('#manual-entry').open=false;root.querySelector('#health-warning').hidden=true;speciesFields();updateHistoryChoice();showStep();});
root.querySelectorAll('[name=species]').forEach(n=>n.addEventListener('change',()=>{input.species=n.value;input.doses=[];input.risks=[];speciesFields();}));
root.querySelector('#unknown-date').addEventListener('change',e=>{root.querySelector('#exact-age').hidden=e.target.checked;root.querySelector('#estimated-age').hidden=!e.target.checked;});
root.querySelector('#ill').addEventListener('change',e=>root.querySelector('#health-warning').hidden=e.target.value!=='yes');
function updateHistoryChoice(){
 const value=root.querySelector('[name="history-choice"]:checked')?.value||'unknown';
 const never=root.querySelector('#never-confirm').checked;
 const history=value==='unknown'&&never?'never':value;
 root.querySelector('#history').value=history;
 input.history=history;
 root.querySelector('#memory-form').hidden=history!=='some';
 root.querySelector('#manual-entry').hidden=history!=='card';
 const reader=root.querySelector('.card-reader-host');if(reader)reader.hidden=history!=='card';
 if(history!=='card')root.querySelector('#manual-entry').open=false;
 root.querySelector('#never-choice').hidden=value!=='unknown';
}
root.querySelectorAll('[name="history-choice"]').forEach(n=>n.addEventListener('change',updateHistoryChoice));
root.querySelector('#never-confirm').addEventListener('change',updateHistoryChoice);
updateHistoryChoice();
root.querySelector('#dose-label').addEventListener('change',e=>{root.querySelectorAll('[name=antigen]').forEach(n=>n.checked=e.target.value==='rabies'&&n.value==='Rabies');});
root.querySelector('#product').addEventListener('change',selectProduct);
root.querySelector('#add-dose').addEventListener('click',()=>{const date=root.querySelector('#dose-date').value;const birth=root.querySelector('#birth').value;if(!date||date>localToday()||(!root.querySelector('#unknown-date').checked&&birth&&date<birth)){error('Ingresa una fecha de aplicación válida, posterior al nacimiento y hasta hoy.');return;}const product=getProduct(root.querySelector('#product').value);input.doses.push({label:root.querySelector('#dose-label').value,date,antigens:product?[...product.antigens]:[...root.querySelectorAll('[name=antigen]:checked')].map(n=>n.value),productId:product?.id});renderDoses();error();});
root.querySelector('#risks').addEventListener('change',e=>{if(e.target.value==='indoor'&&e.target.checked)root.querySelector('[value=outdoor]').checked=false;if(e.target.value==='outdoor'&&e.target.checked)root.querySelector('[value=indoor]').checked=false;});
root.querySelector('#copy').addEventListener('click',copy);
root.querySelector('#share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:'Plan orientativo UniversoVet',text:shareSummary()});}catch(e){if(e.name!=='AbortError')root.querySelector('#share-status').textContent='No se pudo compartir.';}}else await copy();});
root.querySelector('#booking').addEventListener('click',()=>track('vaccine_calculator_booking_clicked'));
root.querySelector('#result-whatsapp').addEventListener('click',()=>track('vaccine_calculator_whatsapp_clicked'));
const productSources=root.querySelector('#product-sources');
vaccineProducts.forEach(p=>{const item=el('li'),link=el('a',p.name);link.href=p.source;link.target='_blank';link.rel='noreferrer';item.append(link);productSources.append(item);});
function renderMemories(){
 const list=root.querySelector('#memories');list.replaceChildren();
 input.memories.forEach((m,i)=>{const row=el('li');const info=el('div');info.append(el('strong',m.vaccine),el('p',m.time),el('small','Recuerdo del tutor · sin confirmar con carnet'));const remove=el('button','Quitar');remove.type='button';remove.setAttribute('aria-label',`Quitar recuerdo de ${m.vaccine}`);remove.addEventListener('click',()=>{input.memories.splice(i,1);renderMemories();});row.append(info,remove);list.append(row);});
 root.querySelector('#memory-fields').hidden=!!input.memories.length;
 root.querySelector('#another-memory').hidden=!input.memories.length;
 root.querySelector('#memory-status').textContent=input.memories.length?'Recuerdo agregado. Puedes agregar otra vacuna o continuar con el siguiente paso.':'';
}
root.querySelector('#add-memory').addEventListener('click',()=>{input.memories.push({vaccine:root.querySelector('#memory-vaccine').value,time:root.querySelector('#memory-time').value});renderMemories();root.querySelector('#another-memory').focus();});
root.querySelector('#another-memory').addEventListener('click',()=>{root.querySelector('#memory-fields').hidden=false;root.querySelector('#memory-time').selectedIndex=0;root.querySelector('#memory-vaccine').value='Otra / No sé';root.querySelector('#another-memory').hidden=true;root.querySelector('#memory-vaccine').focus();});
root.querySelector('#another-dose').addEventListener('click',()=>{root.querySelector('#dose-fields').hidden=false;root.querySelector('#another-dose').hidden=true;root.querySelector('#dose-date').value='';root.querySelector('#product').value='';root.querySelector('#dose-label').value='other';selectProduct();root.querySelector('#dose-label').focus();});
// Runs after the existing add handler; invalid entries leave the editor visible.
root.querySelector('#add-dose').addEventListener('click',()=>{if(!root.querySelector('#error').hidden)return;root.querySelector('#dose-fields').hidden=true;root.querySelector('#another-dose').hidden=false;root.querySelector('#dose-status').textContent='Vacuna agregada. Puedes agregar otra vacuna o continuar con el siguiente paso.';root.querySelector('#another-dose').focus();});
const cardReader=setupCardReader({root,getSpecies:()=>input.species,today:localToday,addPending:(entry,species)=>{
 if(species!==input.species)return 'La especie cambió. Vuelve a leer el carné.';
 if(input.pendingCards.some(v=>v.name===entry.name&&v.date===entry.date))return 'Este antecedente ya está registrado.';
 input.pendingCards.push(entry);
 root.querySelector('#history').value='card';input.history='card';
 root.querySelector('[name="history-choice"][value="card"]').checked=true;
 updateHistoryChoice();
 return '';
},addDose:(dose,species)=>{
 if(species!==input.species)return 'La especie cambió. Vuelve a leer el carnet.';
 const birth=root.querySelector('#unknown-date').checked?'':root.querySelector('#birth').value;
 if(!dose.date||dose.date>localToday()||(birth&&dose.date<birth))return 'Revisa la fecha: debe ser posterior al nacimiento y no estar en el futuro.';
 if(input.doses.some(d=>d.date===dose.date&&d.label===dose.label&&d.productId===dose.productId))return 'Esta vacuna ya está agregada.';
 const product=getProduct(dose.productId);
 input.doses.push({...dose,antigens:product?[...product.antigens]:dose.label==='rabies'?['Rabies']:[],source:'photo-reviewed'});
 root.querySelector('#history').value='card';input.history='card';root.querySelector('[name="history-choice"][value="card"]').checked=true;updateHistoryChoice();renderDoses();return '';
}});
root.querySelector('#restart').addEventListener('click',()=>cardReader.reset());
root.querySelectorAll('[name=species]').forEach(n=>n.addEventListener('change',()=>cardReader.reset()));
speciesFields();
