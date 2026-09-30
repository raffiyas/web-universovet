# Estimación práctica de vacunas

La calculadora procesa todo en el navegador. No guarda el carnet ni envía sus datos a analytics. Los productos se seleccionan por ID; no se interpreta texto libre ni etiquetas como «séxtuple» para inferir componentes.

## Productos habituales confirmados por UniversoVet

- Polivalente: Vanguard Plus 5 L4 (Zoetis Chile): desde 6 semanas, dos dosis a 21 días; tres si comienza antes de 9 semanas. Contiene CDV, CAV-2, CPV, CPiV y cuatro serovares de Leptospira. No contiene Bordetella.
- Bordetella: Vanguard B Oral (portafolio oficial Zoetis Chile): una dosis oral desde 8 semanas, revacunación anual según ficha chilena y exposición.
- Nobivac Puppy DP Plus: CDV y CPV; opción de inicio temprano desde 4 semanas. No reemplaza CAV ni la primovacunación de Leptospira.
- Nobivac DAPPvL2 se reconoce en el carnet con dos serovares de Leptospira; cambiar de L2 a L4 requiere revisión, sin descontar automáticamente dosis de la serie de Vanguard.
- Nobivac Rabia y Rabguard: mínima edad de 3 meses. La normativa chilena exige primer refuerzo al año de edad; después se usa el intervalo del producto registrado (tres años y un año, respectivamente), sin certificar vigencia legal desde la calculadora.
- Rabisin: se reconoce como antecedente de rabia, pero no se calcula vencimiento hasta verificar su ficha chilena. No se presume pauta de otro país.

Las URLs oficiales y la fecha de verificación están en `vaccineProducts.mjs` y se muestran en la página. WSAVA 2024 y Decreto 1/2014 siguen siendo las fuentes de la orientación general.

## Alcance del conteo

`vaccinePlan.mjs` proyecta próximas dosis, fechas y controles por separado. No presenta un paquete fijo ni un total que duplique Leptospira con una polivalente. Las fechas coincidentes no autorizan coadministración.

La proyección de Vanguard usa intervalos de 21 días y un cierre esencial a las 16 semanas o más. Esto puede estimar más dosis que el mínimo de la ficha: por ejemplo, al comenzar a 6 semanas proyecta 6, 9, 12, 15 y 18 semanas; al comenzar a 10 semanas proyecta 10, 13 y 16. Esa extensión es una estimación clínica para revisión, no un requisito adicional atribuido al fabricante. El veterinario puede ajustar intervalos, productos y número de dosis.

El control desde las 26 semanas (serología o refuerzo esencial) y los refuerzos posteriores se muestran aparte del conteo inicial. Se requiere una serie documentada con edades e intervalos plausibles; no se interpretan dos vacunas anuales como una primovacunación de Leptospira completa. Una serie incompleta con intervalo prolongado se deriva a revisión sin reiniciarla automáticamente.

Historial desconocido, carnet vacío, composición desconocida, fechas inválidas, cambios de polivalente o dudas sobre salud/reacciones muestran «Por definir». Con edad aproximada sin vacunas previas se permite una estimación explícitamente aproximada; no se validan edades históricas a partir de esa estimación.

El catálogo felino está pendiente; no se asignan cantidades de triple o FeLV sin confirmar productos. La orientación felina por enfermedad permanece disponible.

## Verificación

`npm run test:clinical` ejecuta las pruebas de orientación general y del plan práctico. Las fechas de referencia usan America/Santiago y los aniversarios se calculan por meses de calendario, incluidos años bisiestos.
