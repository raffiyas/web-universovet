import { calculateVaccines } from './vaccines/vaccineCalculator.mjs';
import { vaccineLabels, statusLabels } from './vaccines/vaccineContent.mjs';
import { vaccineProducts, getProduct } from './vaccines/vaccineProducts.mjs';
import { clinicDay } from './vaccines/vaccinePlan.mjs';
const root = document.querySelector('#calculator');
const form = root.querySelector('form');
const steps = [...root.querySelectorAll('[data-step]')];
const initial = () => ({ species: 'dog', ill: 'no', reaction: 'no', history: 'unknown', doses: [], risks: [], felv: 'unknown' });
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
function speciesFields() {
 const labels = root.querySelector('#dose-label'); labels.replaceChildren();
 vaccineLabels[input.species].forEach(x => { const opt = el('option', x.text); opt.value=x.value; labels.append(opt); });
 checkOptions(root.querySelector('#antigens'), antigenLabels[input.species], 'antigen');
 const products = root.querySelector('#product'); products.replaceChildren();
 const unknown = el('option','Otro / no lo sé'); unknown.value=''; products.append(unknown);
 vaccineProducts.filter(p=>p.species.includes(input.species)).forEach(p=>{const option=el('option',p.name);option.value=p.id;products.append(option);});
 selectProduct();
 checkOptions(root.querySelector('#risks'), riskLabels[input.species], 'risk');
 root.querySelector('#felv-field').hidden = input.species !== 'cat';
 renderDoses();
}
function error(message='') { const n = root.querySelector('#error'); n.textContent=message; n.hidden=!message; }
function showStep() {
 steps.forEach((n,i)=>n.hidden=i!==step);
 root.querySelectorAll('.vaccine-progress li').forEach((n,i)=>{ n.classList.toggle('is-active',i===step); if(i===step)n.setAttribute('aria-current','step'); else n.removeAttribute('aria-current'); });
 root.querySelector('#back').hidden=step===0;
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
 input.doses.forEach((d,i)=>{ const row=el('li',`${d.date} · ${getProduct(d.productId)?.name||vaccineLabels[input.species].find(x=>x.value===d.label)?.text} · ${d.antigens.length?d.antigens.join(', '):'composición sin verificar'} `);
 const remove=el('button','Quitar');remove.type='button';remove.setAttribute('aria-label',`Quitar dosis ${i+1}`);remove.addEventListener('click',()=>{input.doses.splice(i,1);renderDoses();});row.append(remove);list.append(row); });
}
function selectProduct(){
 const product=getProduct(root.querySelector('#product').value);
 root.querySelector('#dose-label').disabled=!!product;
 if(product){const group={puppy:'puppy',polyvalent:'polyvalent',rabies:'rabies',bordetella:'kennel'}[product.group];const labels=vaccineLabels[input.species];root.querySelector('#dose-label').value=labels.some(x=>x.value===group)?group:labels[0].value;}
 root.querySelectorAll('[name=antigen]').forEach(n=>{n.disabled=!!product;n.checked=product?product.antigens.includes(n.value):root.querySelector('#dose-label').value==='rabies'&&n.value==='Rabies';});
 root.querySelector('#product-help').textContent=product?`${product.name}: ${product.antigens.join(', ')}. Componentes reconocidos desde la ficha oficial; verifica que sea exactamente este producto.`:'Selecciona solo si coincide con el producto del carnet. Para otra marca o composición desconocida, utiliza “Otro / no lo sé”.';
}
const formatDate = value => new Intl.DateTimeFormat('es-CL',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00Z`));
const quantityText = r => r.quantity===null?'Por definir':r.optional?`${r.quantity} dosis · opción en consulta`:`${r.quantity} dosis ${r.quantity===1?'estimada':'estimadas'}`;
function renderPracticalPlan(){
 const plan=result.practicalPlan, summary=root.querySelector('#dose-summary');summary.replaceChildren();
 plan.rows.forEach(r=>{const item=el('article','','vaccine-dose-item');item.append(el('strong',quantityText(r),'vaccine-dose-count'),el('h4',r.title),el('p',r.reason));summary.append(item);});
 root.querySelector('#plan-notes').replaceChildren(...plan.notes.map(n=>el('p',n,'vaccine-disclaimer')));
 const calendar=root.querySelector('#dose-calendar');calendar.replaceChildren();
 const entries=plan.rows.flatMap(r=>r.dates.map((date,i)=>({date,text:`${r.title} · ${r.dates.length>1?`dosis pendiente ${i+1} de ${r.dates.length}`:'1 dosis'}`}))).sort((a,b)=>a.date.localeCompare(b.date));
 entries.forEach(entry=>{const item=el('li');item.append(el('strong',formatDate(entry.date)),el('p',entry.text));calendar.append(item);});
 root.querySelector('#calendar-empty').hidden=!!entries.length;
 const follow=root.querySelector('#follow-ups');follow.replaceChildren();
 if(plan.followUps.length){follow.append(el('h3','Controles y refuerzos posteriores'));const list=el('ul');plan.followUps.forEach(f=>{const item=el('li');item.append(el('strong',formatDate(f.date)),el('p',f.text));list.append(item);});follow.append(list);}
}
function renderResult(){
 result=calculateVaccines(input);
 root.querySelector('#result-heading').textContent=`Vacunación de ${input.name||'tu mascota'}`;
 const age=result.ageDays<56?`${Math.floor(result.ageWeeks)} semanas`:result.ageDays<365?`${Math.floor(result.ageMonths)} meses`:`${result.ageYears.toFixed(1)} años`;
 root.querySelector('#result-age').textContent=`${input.species==='dog'?'Perro':'Gato'} · ${age}`;
 const alerts=root.querySelector('#alerts'); alerts.replaceChildren(...result.alerts.map(x=>el('p',x,'vaccine-alert')));
 renderPracticalPlan();
 const cards=root.querySelector('#recommendations'); cards.replaceChildren();
 result.publicRecommendations.forEach(r=>{ const card=el('article','','vaccine-result');card.append(el('span',statusLabels[r.status],`vaccine-status vaccine-status--${r.status}`),el('h3',r.title),el('p',r.reason),el('strong','Próximo paso'),el('p',r.next));const detail=el('details');detail.append(el('summary','¿Por qué?'),el('p',r.why));card.append(detail);cards.append(card); });
 track('vaccine_calculator_completed');track(input.species==='dog'?'vaccine_calculator_dog':'vaccine_calculator_cat');
}
function summary(){const plan=result.practicalPlan;return `Plan orientativo de vacunación de ${input.name||'mi mascota'}.\n${plan.rows.map(r=>`${r.title}: ${quantityText(r)}. ${r.reason}${r.dates.length?` Fechas orientativas: ${r.dates.map(formatDate).join('; ')}.`:''}`).join('\n')}\n${plan.followUps.map(f=>`${formatDate(f.date)}: ${f.text}`).join('\n')}\n${plan.notes.join('\n')}\n${result.publicRecommendations.map(r=>`${r.title}: ${statusLabels[r.status]}. ${r.next}`).join('\n')}\nOrientación general; confirmar con un médico veterinario. ${document.querySelector('[rel=canonical]').href}`;}
async function copy(){try{await navigator.clipboard.writeText(summary());root.querySelector('#share-status').textContent='Resumen copiado.';}catch{root.querySelector('#share-status').textContent='No se pudo copiar. Puedes seleccionar el texto del resultado.';}}
form.addEventListener('submit',e=>e.preventDefault());
root.querySelector('#next').addEventListener('click',()=>{collect();if(!validate())return;if(step===0)track('vaccine_calculator_started');step++;if(step===3)renderResult();showStep();});
root.querySelector('#back').addEventListener('click',()=>{step--;showStep();});
root.querySelector('#restart').addEventListener('click',()=>{input=initial();form.reset();step=0;root.querySelector('#exact-age').hidden=false;root.querySelector('#estimated-age').hidden=true;root.querySelector('#dose-form').hidden=true;root.querySelector('#health-warning').hidden=true;speciesFields();showStep();});
root.querySelectorAll('[name=species]').forEach(n=>n.addEventListener('change',()=>{input.species=n.value;input.doses=[];input.risks=[];speciesFields();}));
root.querySelector('#unknown-date').addEventListener('change',e=>{root.querySelector('#exact-age').hidden=e.target.checked;root.querySelector('#estimated-age').hidden=!e.target.checked;});
root.querySelector('#ill').addEventListener('change',e=>root.querySelector('#health-warning').hidden=e.target.value!=='yes');
root.querySelector('#history').addEventListener('change',e=>root.querySelector('#dose-form').hidden=e.target.value!=='card');
root.querySelector('#dose-label').addEventListener('change',e=>{root.querySelectorAll('[name=antigen]').forEach(n=>n.checked=e.target.value==='rabies'&&n.value==='Rabies');});
root.querySelector('#product').addEventListener('change',selectProduct);
root.querySelector('#add-dose').addEventListener('click',()=>{const date=root.querySelector('#dose-date').value;const birth=root.querySelector('#birth').value;if(!date||date>localToday()||(!root.querySelector('#unknown-date').checked&&birth&&date<birth)){error('Ingresa una fecha de aplicación válida, posterior al nacimiento y hasta hoy.');return;}const product=getProduct(root.querySelector('#product').value);input.doses.push({label:root.querySelector('#dose-label').value,date,antigens:product?[...product.antigens]:[...root.querySelectorAll('[name=antigen]:checked')].map(n=>n.value),productId:product?.id});renderDoses();error();});
root.querySelector('#risks').addEventListener('change',e=>{if(e.target.value==='indoor'&&e.target.checked)root.querySelector('[value=outdoor]').checked=false;if(e.target.value==='outdoor'&&e.target.checked)root.querySelector('[value=indoor]').checked=false;});
root.querySelector('#copy').addEventListener('click',copy);
root.querySelector('#share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:'Plan orientativo UniversoVet',text:summary()});}catch(e){if(e.name!=='AbortError')root.querySelector('#share-status').textContent='No se pudo compartir.';}}else await copy();});
root.querySelector('#booking').addEventListener('click',()=>track('vaccine_calculator_booking_clicked'));
const productSources=root.querySelector('#product-sources');
vaccineProducts.forEach(p=>{const item=el('li'),link=el('a',p.name);link.href=p.source;link.target='_blank';link.rel='noreferrer';item.append(link);productSources.append(item);});
speciesFields();
