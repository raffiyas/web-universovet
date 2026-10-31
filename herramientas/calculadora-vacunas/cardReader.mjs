import { vaccineLabels } from './vaccines/vaccineContent.mjs';
import { vaccineProducts } from './vaccines/vaccineProducts.mjs';
export function setupCardReader({root,getSpecies,today,addDose}){
 const host=document.createElement('div');host.className='vaccine-dose-form';
 host.innerHTML='<h3>¿Tienes una foto de su carnet?</h3><p>La IA puede ayudarte a copiar las vacunas. Revisa cada dato antes de añadirlo.</p><label class="field">Foto de una página del carnet<input type="file" accept="image/jpeg,image/png,image/webp"></label><p class="vaccine-disclaimer">JPG, PNG o WebP, hasta 2,8 MB. Recorta los datos personales y procura que las fechas se vean nítidas. Al pulsar «Leer foto», la imagen se envía a OpenAI para analizarla. Esta aplicación no guarda la foto.</p><img hidden alt="Foto del carnet seleccionada" style="max-width:100%;max-height:280px;object-fit:contain"><div class="vaccine-controls"><button type="button" class="btn btn--primary">Leer foto</button><button type="button" class="btn btn--secondary">Quitar foto</button></div><p role="status" aria-live="polite"></p><div class="ocr-review"></div>';
 root.querySelector('[data-step="1"] h2').after(host);
 const file=host.querySelector('input'),[read,clear]=host.querySelectorAll('button'),status=host.querySelector('[role=status]'),review=host.querySelector('.ocr-review'),preview=host.querySelector('img');
 const camera=document.createElement('input');camera.type='file';camera.accept='image/*';camera.setAttribute('capture','environment');camera.hidden=true;
 const choices=document.createElement('div');choices.className='vaccine-controls';
 const take=document.createElement('button'),choose=document.createElement('button');
 for(const button of [take,choose]){button.type='button';button.className='btn btn--secondary';}
 take.textContent='Tomar foto del carnet';choose.textContent='Elegir foto guardada';
 take.addEventListener('click',()=>camera.click());choose.addEventListener('click',()=>file.click());
 choices.append(take,choose,camera);file.closest('label').hidden=true;file.closest('label').before(choices);
 const hint=document.createElement('p');hint.className='vaccine-disclaimer';hint.textContent='En celulares compatibles, «Tomar foto» abre la cámara trasera. En otros dispositivos puede abrir el selector de archivos.';choices.after(hint);
 const privacy=[...host.querySelectorAll('.vaccine-disclaimer')].find(p=>p!==hint);
 privacy.textContent='JPG, PNG o WebP, hasta 20 MB. Ajustamos el tamaño antes de enviar. Fotografía una página de cerca, con buena luz y fechas legibles; recorta los datos personales. Al pulsar «Leer foto», la imagen se envía a OpenAI. Esta aplicación no guarda la foto.';
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
   image=encoded;preview.src=image;preview.hidden=false;read.disabled=false;status.textContent='Foto lista. Comprueba que las fechas se lean y pulsa «Leer foto».';
  }catch{if(current===version)status.textContent='No pudimos preparar esa imagen. Prueba una foto JPG más pequeña o elige otra foto guardada.';}finally{bitmap?.close();}
 }
 file.addEventListener('change',()=>prepare(file));camera.addEventListener('change',()=>prepare(camera));
 read.addEventListener('click',async()=>{
  if(!image)return;const current=++version;const species=getSpecies();controller=new AbortController();read.disabled=true;file.disabled=true;review.replaceChildren();status.textContent='Leyendo la foto… esto puede tardar hasta un minuto.';
  try{
   const response=await fetch('/api/read-vaccine-card',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:controller.signal});const data=await response.json();if(current!==version)return;if(!response.ok)throw new Error(data.error||'No pudimos leer la foto.');
   status.textContent=data.vaccines.length?'Revisa el nombre y la fecha. Selecciona el tipo de vacuna y confirma cada registro.':'No encontramos vacunas legibles. Prueba otra foto o agrégalas manualmente.';
   if(data.warning)review.append(node('p',data.warning));
   for(const row of data.vaccines){
    const card=node('article','');card.className='vaccine-result';card.append(node('h4',`Texto leído: ${row.name}`));if(row.note)card.append(node('p',row.note));
    const label=node('label','Tipo de vacuna que aparece en el carnet');label.className='field';const select=document.createElement('select');for(const v of vaccineLabels[species]){const option=node('option',v.text);option.value=v.value;select.append(option);}select.value='other';label.append(select);
    const productLabel=node('label','Marca exacta, solo si puedes confirmarla');productLabel.className='field';const product=document.createElement('select');const unknown=node('option','Otro / no lo sé');unknown.value='';product.append(unknown);for(const p of vaccineProducts.filter(p=>p.species.includes(species))){const option=node('option',p.name);option.value=p.id;product.append(option);}productLabel.append(product);
    const dateLabel=node('label','Fecha de aplicación (revisa que no sea la próxima dosis)');dateLabel.className='field';const date=document.createElement('input');date.type='date';date.max=today();if(/^\d{4}-\d{2}-\d{2}$/.test(row.date||''))date.value=row.date;dateLabel.append(date);
    const confirmLabel=node('label','');confirmLabel.className='vaccine-check';const confirm=document.createElement('input');confirm.type='checkbox';confirmLabel.append(confirm,document.createTextNode('Revisé estos datos comparándolos con la foto'));
    const button=node('button','Añadir vacuna revisada');button.type='button';button.className='btn btn--primary';const message=node('p','');message.setAttribute('role','status');
    button.addEventListener('click',()=>{if(!confirm.checked){message.textContent='Confirma que revisaste los datos de la foto.';return;}const error=addDose({label:select.value,date:date.value,productId:product.value||undefined},species);if(error){message.textContent=error;return;}button.disabled=true;select.disabled=true;product.disabled=true;date.disabled=true;confirm.disabled=true;message.textContent='Vacuna agregada. Puedes revisar otra fila o continuar.';});
    card.append(label,productLabel,dateLabel,confirmLabel,button,message);review.append(card);
   }
  }catch(e){if(current===version&&e.name!=='AbortError')status.textContent=e.message||'Error al leer la foto.';}
  finally{if(current===version){read.disabled=false;file.disabled=false;}}
 });
 return {reset};
}
