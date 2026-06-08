function izracunajProsek(oceneData, idAutora) {

    if (!oceneData) return 0;

    const oceneAutora = Object.values(oceneData).filter(o => o.idAutora === idAutora);

    if (oceneAutora.length === 0) return 0;

    const suma = oceneAutora.reduce((acc, o) => acc + o.vrednost, 0);
    return suma / oceneAutora.length;

}

function formatZvezdice(prosek) {

    const pune = Math.round(prosek);
    return "★".repeat(pune) + "☆".repeat(5 - pune);
    
}

function formatProsek(prosek) {
    return prosek > 0 ? prosek.toFixed(1) : "—";
}

function brojOcena(oceneData, idAutora) {

    if (!oceneData) return 0;
    const oceneAutora = Object.values(oceneData).filter(o => o.idAutora === idAutora).length;
    return oceneAutora;

}