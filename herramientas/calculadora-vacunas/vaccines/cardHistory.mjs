import { getProduct } from './vaccineProducts.mjs';

export function cardHistoryEntries(input) {
 const verified=(input.doses||[]).filter(d=>d.source==='photo-reviewed').map(d=>({
  status:'identified',name:getProduct(d.productId)?.name||'Vacuna identificada',date:d.date||null
 }));
 const pending=(input.pendingCards||[]).map(v=>({
  status:'pending',name:v.name||'Vacuna por identificar',date:v.date||null,
  reason:v.reason||'Pendiente de revisión'
 }));
 return [...verified,...pending];
}
export function cardHistoryLines(input) {
 return cardHistoryEntries(input).map(v=>{
  const date=v.date||'fecha por verificar';
  return v.status==='identified'
   ?`Vacuna identificada en carné (antecedente, no certifica vigencia): ${v.name} · ${date}.`
   :`Lectura pendiente de revisión: ${v.name} · ${date} (${v.reason}).`;
 });
}
export function uncertainOcrDate(row) {
 // The service must flag ambiguity explicitly; old responses may only include a note.
 return row.dateUncertain===true || /(?:fecha|d[ií]a|mes|a[nñ]o).{0,65}(?:ambigu|dudos|ilegib|borros|inciert|no clar|no segur)|(?:ambigu|dudos|ilegib|borros|inciert).{0,65}(?:fecha|d[ií]a|mes|a[nñ]o)/i.test(row.note||'');
}
