// Catálogo histórico para orientar al tutor, NO certifica aplicaciones ni vigencia.
// Las formulaciones antiguas no se sustituyen por variantes modernas.
export const historicalVaccines = [
 {id:'nobivac-puppy-dp-old',name:'Nobivac Puppy DP',species:['dog'],group:'puppy',antigens:['CDV','CPV'],source:'https://www.msd-salud-animal.cl/wp-content/uploads/sites/45/2025/01/FT-Nobivac-Puppy-DP-V4-OCT.2024.pdf',aliases:['nobivac puppy dp'],riskHint:'puppy'},
 {id:'vanguard-plus-5-l-old',name:'Vanguard Plus 5/L',species:['dog'],group:'polyvalent',antigens:['CDV','CAV','CPV','CPiV','Leptospira'],source:'https://www.zoetis.cl/_locale-assets/pdf/descargas-ctl/portafolio_mundo_caninos_zoetis_cl_mm_20421_compressedok_n65jcg.pdf',aliases:['vanguard plus 5 l','vanguard 5 l','vanguard plus 5l'],riskHint:'polyvalent'},
 {id:'nobivac-sextuple-old',name:'Nobivac Séxtuple DAPPvL2',species:['dog'],group:'polyvalent',antigens:['CDV','CAV','CPV','CPiV','Leptospira'],source:'https://www.msd-salud-animal.cl/wp-content/uploads/sites/45/2022/05/Vademecum-Chile.pdf',aliases:['nobivac sextuple dappvl2','nobivac sextuple','sextuple nobivac'],riskHint:'polyvalent'},
 {id:'nobivac-octuple-old',name:'Nobivac Óctuple DAPPvL2 + CV',species:['dog'],group:'polyvalent',antigens:['CDV','CAV','CPV','CPiV','Leptospira','CECoV'],source:'https://www.msd-salud-animal.cl/productos/nobivac-dappvl2-cv-vacuna/',aliases:['nobivac octuple dappvl2 cv','nobivac octuple','octuple nobivac','nobivac dappvl2 cv'],riskHint:'polyvalent'},
 {id:'vanguard-plus-5-cv-l-old',name:'Vanguard Plus 5/CV-L',species:['dog'],group:'polyvalent',antigens:['CDV','CAV','CPV','CPiV','Leptospira','CECoV'],source:'https://www.zoetis.cl/productos-y-servicios/dogs/vanguard-plus-5-cv-l.aspx',aliases:['vanguard plus 5 cv l','vanguard plus 5 cvl','vanguard 5 cv l','vanguard plus 5cv l'],riskHint:'polyvalent'}
];
// Exact, explicit historical alias only. Generic "Nobivac" and "Vanguard" are insufficient.
export const historicalById=id=>historicalVaccines.find(p=>p.id===id);
