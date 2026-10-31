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
  assert.equal(resolved.label,label,name);
 }
});
test('unknown and cross-species products are not assumed to be verified',()=>{
 assert.equal(resolveCardProduct('Vanguard Plus 5 L4','cat').verified,false);
 assert.equal(resolveCardProduct('texto ilegible','dog').label,'other');
});
