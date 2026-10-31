import { vaccineLabels } from './vaccines/vaccineContent.mjs';
import { vaccineProducts } from './vaccines/vaccineProducts.mjs';
export function setupCardReader({root,getSpecies,today,addDose}){
 const host=document.createElement('div');host.className='vaccine-dose-form card-reader-host';host.hidden=true;
 host.innerHTML='<h3>Muéstranos su carné</h3><p>Toma una foto donde se vean las vacunas y sus fechas.</p><label class="field">Foto de una página del carnet<input type="file" accept="image/jpeg,image/png,image/webp"></label><p class="vaccine-disclaimer">JPG, PNG o WebP, hasta 2,8 MB. Recorta los datos personales y procura que las fechas se vean nítidas. Al pulsar «Leer foto», la imagen se envía a OpenAI para analizarla. Esta aplicación no guarda la foto.</p><img hidden alt="Foto del carnet seleccionada" style="max-width:100%;max-height:280px;object-fit:contain"><div class="vaccine-controls"><button type="button" class="btn btn--primary">Leer foto</button><button type="button" class="btn btn--secondary">Quitar foto</button></div><p role="status" aria-live="polite"></p><div class="ocr-review"></div>';
 root.querySelector('[data-step="1"] h2').after(host);
 const file=host.querySelector('input'),[read,clear]=host.querySelectorAll('button'),status=host.querySelector('[role=status]'),review=host.querySelector('.ocr-review'),preview=host.querySelector('img');
 const camera=document.createElement('input');camera.type='file';camera.accept='image/*';camera.setAttribute('capture','environment');camera.hidden=true;
 const choices=document.createElement('div');choices.className='vaccine-controls';
 const take=document.createElement('button'),choose=document.createElement('button');
 for(const button of [take,choose]){button.type='button';button.className='btn btn--secondary';}
 take.textContent='Tomar foto';choose.textContent='Elegir foto guardada';
 take.addEventListener('click',()=>camera.click());choose.addEventListener('click',()=>file.click());
 choices.append(take,choose,camera);file.closest('label').hidden=true;file.closest('label').before(choices);
 const hint=document.createElement('p');hint.className='vaccine-disclaimer';hint.textContent='Si tu teléfono no abre la cámara, puedes elegir una foto guardada.';choices.after(hint);
 const privacy=[...host.querySelectorAll('.vaccine-disclaimer')].find(p=>p!==hint);
 privacy.textContent='La foto se envía a OpenAI para leerla y no se guarda en esta página. Evita incluir datos personales. Formatos JPG, PNG o WebP (máximo 20 MB).';
 let image='',version=0,controller;
 const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
 function reset(){version++;controller?.abort();image='';file.value='';camera.value='';preview.removeAttribute('src');preview.hidden=true;review.replaceChildren();status.textContent='';read.disabled=true;file.disabled=false;}
 clear.addEventListener('click',reset);read.disabled=true;
 async function prepare(source){
  const selected=source.files[0];if(!selected)return;reset();const current=version;
  if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||selected.size>20000000){status.textContent='Elige JPG, PNG o WebP de hasta 20 MB. Si es HEIC, conviértela a JPG o toma otra foto en formato compatible.';return;}
  status.textContent='Preparando la foto…';let bitmap;
  try{
   bitmap=await createImageBitmap(selected,{imageOrientation:'from-image'});
   const canvas=document.createElement('canvas');let scale=Math.min(1,2600/Math.max(bitmap.width,bitmap.height));let encoded='';
   for(let attempt=0;attempt<5;attempt++){
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);encoded=canvas.toDataURL('image/jpeg',.9);if(encoded.length<3700000)break;scale*=.8;
   }
   if(current!==version)return;
   if(encoded.length>=3700000)throw new Error('large');
   image=encoded;preview.src=image;preview.hidden=false;read.disabled=false;status.textContent='Foto lista. Pulsa «Leer foto» para revisar las vacunas.';
  }catch{if(current===version)status.textContent='No pudimos preparar esa imagen. Prueba una foto JPG más pequeña o elige otra foto guardada.';}finally{bitmap?.close();}
 }
 file.addEventListener('change',()=>prepare(file));camera.addEventListener('change',()=>prepare(camera));
 read.addEventListener('click',async()=>{
  if(!image)return;const current=++version;const species=getSpecies();controller=new AbortController();read.disabled=true;file.disabled=true;review.replaceChildren();status.textContent='Leyendo la foto… esto puede tardar hasta un minuto.';
  try{
   const response=await fetch('/api/read-vaccine-card',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:controller.signal});const data=await response.json();if(current!==version)return;if(!response.ok)throw new Error(data.error||'No pudimos leer la foto.');
   status.textContent=data.vaccines.length?'Revisa cada vacuna y confirma solo los datos que reconozcas.':'No encontramos vacunas legibles. Prueba otra foto o utiliza el ingreso manual.';
   if(data.warning)review.append(node('p',data.warning));
   for(const row of data.vaccines){
    const card=node('article','');card.className='vaccine-result ocr-simple-card';
    const heading=node('h4',row.name||'Vacuna por identificar');
    const validDate=/^\\d{4}-\\d{2}-\\d{2}$/.test(row.date||'')&&row.date<=today();
    const summary=node('p',validDate?'Fecha indicada: '+row.date.split('-').reverse().join('/'):'Fecha pendiente de revisión');
    card.append(heading,summary);
    const edit=document.createElement('div');edit.className='ocr-edit';edit.hidden=true;
    const label=node('label','Tipo de vacuna');label.className='field';
    const select=document.createElement('select');
    for(const v of vaccineLabels[species]){const option=node('option',v.text);option.value=v.value;select.append(option);}
    select.value='other';label.append(select);
    const productLabel=node('label','Producto exacto (solo si figura en el carné)');productLabel.className='field';
    const product=document.createElement('select');const unknown=node('option','No lo sé');unknown.value='';product.append(unknown);
    for(const p of vaccineProducts.filter(p=>p.species.includes(species))){const option=node('option',p.name);option.value=p.id;product.append(option);}
    productLabel.append(product);
    const dateLabel=node('label','Fecha de aplicación');dateLabel.className='field';const date=document.createElement('input');date.type='date';date.max=today();if(validDate)date.value=row.date;dateLabel.append(date);
    const message=node('p','');message.setAttribute('role','status');
    const actions=document.createElement('div');actions.className='vaccine-controls';
    const confirm=node('button','Está correcto');confirm.type='button';confirm.className='btn btn--primary';
    const correction=node('button','Corregir');correction.type='button';correction.className='btn btn--secondary';
    correction.addEventListener('click',()=>{edit.hidden=!edit.hidden;correction.textContent=edit.hidden?'Corregir':'Ocultar corrección';});
    function save(){
     if(!date.value||date.value>today()){message.textContent='Revisa la fecha de aplicación antes de continuar.';edit.hidden=false;return;}
     if(select.value==='other'&&!product.value){message.textContent='No pudimos identificar con seguridad el tipo de vacuna. Puedes corregirlo o continuar y revisarlo en consulta.';edit.hidden=false;return;}
     const issue=addDose({label:select.value,date:date.value,productId:product.value||undefined},species);
     if(issue){message.textContent=issue;edit.hidden=false;return;}
     confirm.disabled=true;correction.disabled=true;select.disabled=true;product.disabled=true;date.disabled=true;edit.hidden=true;message.textContent='Vacuna añadida a los antecedentes.';
    }
    confirm.addEventListener('click',save);
    select.addEventListener('change',()=>{if(select.value!=='other')product.value='';});
    product.addEventListener('change',()=>{if(product.value){const p=vaccineProducts.find(v=>v.id===product.value);const group={puppy:'puppy',polyvalent:'polyvalent',rabies:'rabies',bordetella:'kennel'}[p?.group];if(group&&[...select.options].some(o=>o.value===group))select.value=group;}});
    const normalized=String(row.name||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const match=vaccineProducts.find(p=>p.species.includes(species)&&p.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()===normalized);
    if(match){product.value=match.id;product.dispatchEvent(new Event('change'));}
    else if(/\\b(antirrabica|rabia|rabies)\\b/i.test(normalized))select.value='rabies';
    else if(/\\b(triple felina|felina triple)\\b/i.test(normalized)&&species==='cat')select.value='core';
    if(row.note)edit.append(node('p',row.note));
    edit.append(label,productLabel,dateLabel);
    actions.append(confirm,correction);
    card.append(edit,actions,message);review.append(card);
   }
  }catch(e){if(current===version&&e.name!=='AbortError')status.textContent=e.message||'Error al leer la foto.';}
  finally{if(current===version){read.disabled=false;file.disabled=false;}}
 });
 return {reset};
}
