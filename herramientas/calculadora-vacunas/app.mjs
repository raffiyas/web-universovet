import { calculateVaccines } from './vaccines/vaccineCalculator.mjs';
import { vaccineLabels, statusLabels } from './vaccines/vaccineContent.mjs';
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
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
root.querySelectorAll('[type=date]').forEach(n => n.max = localToday());
function checkOptions(container, entries, name) {
 container.replaceChildren();
 entries.forEach(([value, text]) => { const label = el('label', '', 'vaccine-check'), control = el('input'); control.type='checkbox'; control.name=name; control.value=value; label.append(control, document.createTextNode(text)); container.append(label); });
}
function speciesFields() {
 const labels = root.querySelector('#dose-label'); labels.replaceChildren();
 vaccineLabels[input.species].forEach(x => { const opt = el('option', x.text); opt.value=x.value; labels.append(opt); });
 checkOptions(root.querySelector('#antigens'), antigenLabels[input.species], 'antigen');
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
 input.doses.forEach((d,i)=>{ const row=el('li',`${d.date} · ${vaccineLabels[input.species].find(x=>x.value===d.label)?.text} · ${d.antigens.length?d.antigens.join(', '):'composición sin verificar'} `);
 const remove=el('button','Quitar');remove.type='button';remove.setAttribute('aria-label',`Quitar dosis ${i+1}`);remove.addEventListener('click',()=>{input.doses.splice(i,1);renderDoses();});row.append(remove);list.append(row); });
}
function renderResult(){
 result=calculateVaccines(input);
 root.querySelector('#result-heading').textContent=`Vacunación de ${input.name||'tu mascota'}`;
 const age=result.ageDays<56?`${Math.floor(result.ageWeeks)} semanas`:result.ageDays<365?`${Math.floor(result.ageMonths)} meses`:`${result.ageYears.toFixed(1)} años`;
 root.querySelector('#result-age').textContent=`${input.species==='dog'?'Perro':'Gato'} · ${age}`;
 const alerts=root.querySelector('#alerts'); alerts.replaceChildren(...result.alerts.map(x=>el('p',x,'vaccine-alert')));
 const cards=root.querySelector('#recommendations'); cards.replaceChildren();
 result.recommendations.forEach(r=>{ const card=el('article','','vaccine-result');card.append(el('span',statusLabels[r.status],`vaccine-status vaccine-status--${r.status}`),el('h3',r.title),el('p',r.reason),el('strong','Próximo paso'),el('p',r.next));const detail=el('details');detail.append(el('summary','¿Por qué?'),el('p',r.why));card.append(detail);cards.append(card); });
 track('vaccine_calculator_completed');track(input.species==='dog'?'vaccine_calculator_dog':'vaccine_calculator_cat');
}
function summary(){return `Plan orientativo de vacunación de ${input.name||'mi mascota'}.\n${result.recommendations.map(r=>`${r.title}: ${statusLabels[r.status]}. ${r.next}`).join('\n')}\nOrientación general; confirmar con un médico veterinario. ${document.querySelector('[rel=canonical]').href}`;}
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
root.querySelector('#add-dose').addEventListener('click',()=>{const date=root.querySelector('#dose-date').value;const birth=root.querySelector('#birth').value;if(!date||date>localToday()||(!root.querySelector('#unknown-date').checked&&birth&&date<birth)){error('Ingresa una fecha de aplicación válida, posterior al nacimiento y hasta hoy.');return;}input.doses.push({label:root.querySelector('#dose-label').value,date,antigens:[...root.querySelectorAll('[name=antigen]:checked')].map(n=>n.value),product:root.querySelector('#product').value});renderDoses();error();});
root.querySelector('#risks').addEventListener('change',e=>{if(e.target.value==='indoor'&&e.target.checked)root.querySelector('[value=outdoor]').checked=false;if(e.target.value==='outdoor'&&e.target.checked)root.querySelector('[value=indoor]').checked=false;});
root.querySelector('#copy').addEventListener('click',copy);
root.querySelector('#share').addEventListener('click',async()=>{if(navigator.share){try{await navigator.share({title:'Plan orientativo UniversoVet',text:summary()});}catch(e){if(e.name!=='AbortError')root.querySelector('#share-status').textContent='No se pudo compartir.';}}else await copy();});
root.querySelector('#booking').addEventListener('click',()=>track('vaccine_calculator_booking_clicked'));
speciesFields();
