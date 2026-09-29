/**
 * Catálogo independiente del motor; incorporar solo fichas oficiales verificadas.
 * @typedef {Object} VaccineProduct
 * @property {string} id
 * @property {string} name
 * @property {string} manufacturer
 * @property {string} species
 * @property {string[]} antigens
 * @property {number} minimumAgeWeeks
 * @property {'subcutaneous'|'intramuscular'|'intranasal'|'oral'} route
 * @property {string} primarySeries
 * @property {string} interval
 * @property {string} booster
 * @property {string} sagRegistration
 * @property {string} source
 * @property {string} verifiedAt
 * @property {boolean} active
 */
/** @type {VaccineProduct[]} */
export const vaccineProducts = [];
