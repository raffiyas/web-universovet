import test from 'node:test';
import assert from 'node:assert/strict';
import {cardHistoryEntries,cardHistoryLines,uncertainOcrDate} from '../herramientas/calculadora-vacunas/vaccines/cardHistory.mjs';

test('WhatsApp and result include both identified and pending vaccines without inventing vigencia',()=>{
 const input={doses:[{source:'photo-reviewed',productId:'nobivac-rabia',date:'2019-12-03',label:'rabies'}],
 pendingCards:[{name:'Vanguard Plus 5/L',date:'2019-09-25',reason:'Producto pendiente de identificar'},{name:'Nobivac',date:null,reason:'Fecha pendiente de confirmar'}]};
 const entries=cardHistoryEntries(input);
 assert.equal(entries.length,3);
 assert.deepEqual(entries.map(x=>x.status),['identified','pending','pending']);
 const text=cardHistoryLines(input).join('\n');
 assert.match(text,/Nobivac Rabia/);
 assert.match(text,/Vanguard Plus 5\/L/);
 assert.match(text,/fecha por verificar/);
 assert.match(text,/no certifica vigencia/);
 assert.doesNotMatch(text,/al día|refuerzo confirmado/);
});
test('manual vaccine doses are not misrepresented as AI-confirmed',()=>{
 assert.deepEqual(cardHistoryEntries({doses:[{label:'rabies',date:'2024-01-01'}],pendingCards:[]}),[]);
});
test('ambiguous OCR dates require verification even when an ISO date was returned',()=>{
 assert.equal(uncertainOcrDate({date:'2019-08-02',note:'La lectura del día/mes podría ser ambigua.'}),true);
 assert.equal(uncertainOcrDate({date:null,dateUncertain:true,note:''}),true);
 assert.equal(uncertainOcrDate({date:'2019-12-03',dateUncertain:false,note:'Etiqueta legible.'}),false);
});
