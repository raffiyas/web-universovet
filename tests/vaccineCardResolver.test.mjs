import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCardProduct} from '../herramientas/calculadora-vacunas/vaccines/cardProductResolver.mjs';

test('exact known products can be mapped to the verified catalog',()=>{
 assert.deepEqual(resolveCardProduct('Nobivac Rabia','dog'),{productId:'nobivac-rabia',label:'rabies',verified:true});
 assert.deepEqual(resolveCardProduct('Vanguard Plus 5 L4','dog'),{productId:'vanguard-5-l4',label:'polyvalent',verified:true});
});
test('partial commercial names never masquerade as verified formulations',()=>{
 for(const [name,label] of [['Nobivac Puppy DP','puppy'],['Vanguard Plus 5/L','polyvalent'],['Nobivac DHP','polyvalent']]){
  const resolved=resolveCardProduct(name,'dog');
  assert.equal(resolved.productId,null,name);
  assert.equal(resolved.verified,false,name);
  assert.equal(Boolean(resolved.recognizedHistorical),name!=='Nobivac DHP',name);
  assert.equal(resolved.label,label,name);
 }
});
test('unknown and cross-species products are not assumed to be verified',()=>{
 assert.equal(resolveCardProduct('Vanguard Plus 5 L4','cat').verified,false);
 assert.equal(resolveCardProduct('texto ilegible','dog').label,'other');
});

test('documented older formulations remain distinct and identifiable',()=>{
 const examples=[
  ['Nobivac Puppy DP','nobivac-puppy-dp-old'],
  ['Vanguard Plus 5/L','vanguard-plus-5-l-old'],
  ['Nobivac Séxtuple DAPPvL2','nobivac-sextuple-old'],
  ['Nobivac Octuple DAPPvL2 + CV','nobivac-octuple-old'],
  ['Vanguard Plus 5/CV-L','vanguard-plus-5-cv-l-old']
 ];
 for (const [label,historicalId] of examples) {
  const found=resolveCardProduct(label,'dog');
  assert.equal(found.historicalId,historicalId,label);
  assert.equal(found.productId,null,label);
 }
});
test('ambiguous truncated manufacturer brand is never resolved to a historical product',()=>{
 assert.notEqual(resolveCardProduct('Nobivac','dog').recognizedHistorical,true);
});
