export const clinicalGuidelineVersion = "WSAVA 2024";
export const vaccineLabels = {
    dog: [
        { value: "puppy", text: "Vacuna de cachorro / Puppy" }, { value: "sextuple", text: "Séxtuple" },
        { value: "octuple", text: "Óctuple" }, { value: "polyvalent", text: "Polivalente" },
        { value: "leptospira", text: "Leptospira" }, { value: "kennel", text: "Tos de las perreras" },
        { value: "rabies", text: "Rabia" }, { value: "other", text: "Otra / No sé" },
    ],
    cat: [
        { value: "feline3", text: "Triple felina" }, { value: "feline4", text: "Cuádruple felina" },
        { value: "felv", text: "Leucemia felina" }, { value: "rabies", text: "Rabia" },
        { value: "other", text: "Otra / No sé" },
    ],
};
export const statusLabels = {
    current: "Al día según lo informado", soon: "Próximamente", pending: "Pendiente de revisión",
    overdue: "Atrasada / consultar", risk: "Basada en riesgo", "not-indicated": "No indicada actualmente", legal: "Requerida por normativa",
};
export const sources = [
    { label: "WSAVA: pautas de vacunación 2024", url: "https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf" },
    { label: "MINSAL: Decreto 1/2014, artículo 4 (rabia)", url: "https://www.bcn.cl/leychile/navegar?idNorma=1058839" },
    { label: "SAG: medicamentos veterinarios autorizados y fichas", url: "https://www.sag.gob.cl/ambitos-de-accion/medicamentos-autorizados" },
    { label: "AAFP / FelineVMA: guía de vacunación felina 2020", url: "https://catvets.com/resource/aaha-aafp-feline-vaccination-guidelines/" },
];
