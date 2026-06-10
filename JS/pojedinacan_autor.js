
async function ucitajAutora() {

    const params = new URLSearchParams(window.location.search)
    //window.location.search = "?id=aut001"
    const id = params.get("id");
    //id = "aut001"
    if (!id) return;

    const [autor, knjige, oceneData] = await Promise.all([
        ajaxGet(firebaseUrl + "/autori/" + id + ".json"),
        ajaxGet(firebaseUrl + "/knjige.json"),
        ajaxGet(firebaseUrl + "/ocene.json")
    ]);

    if (!autor) return;

    const slika = Array.isArray(autor.slike) ? autor.slike[0] : (autor.slike ? Object.values(autor.slike)[0] : "images/default.jpg");
    document.querySelector(".pa-avatar").src = slika;
    document.querySelector(".pa-avatar").alt = autor.ime + " " + autor.prezime;
    document.querySelector(".pa-ime").textContent = autor.ime + " " + autor.prezime;

    const statusEl = document.querySelector(".pa-ime-row .status");
    statusEl.textContent = autor.status;
    statusEl.className = "status " + statusKlasa(autor.status);

    let brojKnjiga = 0;
    if(knjige) {
        brojKnjiga = Object.values(knjige).filter( k => k.idAutora === id ). length;
    }

    const statBrojevi = document.querySelectorAll(".pa-stat-broj");

    statBrojevi[0].textContent = brojKnjiga;
    statBrojevi[1].textContent = autor.brojOsvojenihNagrada + "+";
    statBrojevi[2].textContent = formatPrimerci(autor.brojProdatihPrimeraka);
    statBrojevi[3].textContent = formatDatum(autor.datumRodjenja);
    
    document.title = autor.ime + " " + autor.prezime;
    document.querySelector(".pa-bio-tekst").textContent = autor.biografija

    // Ocene
    const prosek = izracunajProsek(oceneData, id);
    document.querySelector(".pa-ocena-broj").textContent = formatProsek(prosek);
    document.querySelector(".pa-ocena-card .stars").textContent = formatZvezdice(prosek);

    document.querySelector(".pa-ocena-count").textContent = brojOcena(oceneData, id) + " оцена"
    document.getElementById("fontele").textContent = autor.kontaktTelefonMenadzera || "—";

    // Knjige
    const knigeAutora = knjige ? Object.entries(knjige).filter(([knjigaId, k]) => k.idAutora === id) : [];
    const scroll = document.querySelector(".pa-knjige-scroll");
    scroll.innerHTML = "";

    knigeAutora.forEach(([knjigaId, knjiga]) => {

        const slika = Array.isArray(knjiga.slike) ? knjiga.slike[0] : "images/default.jpg";
        const card = document.createElement("div");
        card.className = "book-card";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
        window.location.href = `pojedinacna.html?id=${knjigaId}`;
        });

        card.innerHTML = `
            <div class="book-cover">
                <img src="${slika}" alt="${knjiga.naziv}">
                <p>${knjiga.naziv}</p>
            </div>
            <div class="book-desc">
                <p class="book-recom">${knjiga.cena} рсд</p>
                <button class="book-genre ${zanrKlasa(knjiga.zanr)}">${knjiga.zanr}</button>
            </div>
        `;

        scroll.appendChild(card);
    })
}

function formatDatum(datumStr) {

    if (!datumStr) return "—";
    const [god, mes, dan] = datumStr.split("-");
    return `${dan}.${mes}.${god}`;

}

function formatPrimerci(broj) {

    if (broj >= 1000000) return (broj / 1000000).toFixed(0) + "М+";
    if (broj >= 1000) return (broj / 1000).toFixed(0) + "Х+";
    return broj + "";

}

function statusKlasa(status) {
    if (status === "Активан") return "active";
    if (status === "У пензији") return "retired";
    if (status === "Преминуо") return "deceased";
    return "";
}

function zanrKlasa(zanr) {

    const mapa = {
        "Класика": "klasik",
        "Наука": "klasik",
        "Дистопија": "distopija",
        "Фантастика": "sci-fi",
        "Фантазија": "fantazija",
        "Трилер": "triler",
        "Новела": "novela",
        "Хорор": "horor",
        "Роман": "roman"
    };

    return mapa[zanr] || "";
}

ucitajAutora();


const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});
