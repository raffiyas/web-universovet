import { vaccineProducts } from './vaccineProducts.mjs';
import { historicalVaccines } from './historicalVaccines.mjs';

// This resolver never assigns a verified product based on a partial commercial name.
// Category hints are presentation-only; unverified entries must not supply antigens.
export function normalizeCardName(value) {
 return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
export function resolveCardProduct(rawName, species) {
 const name = normalizeCardName(rawName);
 if (!name || !['dog','cat'].includes(species)) return { productId: null, label: 'other', verified: false };
 const exact = vaccineProducts.find(p=>p.species.includes(species)&&normalizeCardName(p.name)===name);
 if (exact) return { productId: exact.id, label: labelOf(exact, species), verified: true };
 const historical = historicalVaccines.find(p=>p.species.includes(species)&&p.aliases.includes(name));
 if (historical) return {productId:null,historicalId:historical.id,label:historical.riskHint,verified:false,recognizedHistorical:true};
 // Explicitly identified commercial class, not a claim about antigenic composition.
 // Puppy DP is NOT Puppy DP Plus; Vanguard 5/L is NOT necessarily 5 L4.
 if (species==='dog' && /\bnobivac puppy dp\b/.test(name)) return {productId:null,label:'puppy',verified:false};
 if (species==='dog' && /\b(vanguard plus 5 l|nobivac dhp)\b/.test(name)) return {productId:null,label:'polyvalent',verified:false};
 if (/\b(rabia|rabies|antirrabica)\b/.test(name)) return {productId:null,label:'rabies',verified:false};
 if (species==='cat' && /\btriple felina\b/.test(name)) return {productId:null,label:'feline3',verified:false};
 return { productId:null,label:'other',verified:false };
}
function labelOf(product, species) {
 if (product.group==='rabies') return 'rabies';
 if (product.group==='puppy') return 'puppy';
 if (product.group==='polyvalent') return 'polyvalent';
 if (product.group==='bordetella') return 'kennel';
 if (species==='cat' && product.group==='feline-core') return 'feline3';
 return 'other';
}
