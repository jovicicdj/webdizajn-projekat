
let trenutniId = null;
let izabranaOcena = 0;

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

    trenutniId = id;

    const zvezdice = document.querySelectorAll(".pa-zvezdice span");
    zvezdice.forEach((span, i) => {
        span.dataset.vrednost = 5 - i;
    });

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
        "Роман": "roman",
        "Класика": "klasik",
        "Дистопија": "distopija",
        "Фантазија": "fantazija",
        "Научна фантастика": "naucna-fantastika",
        "Трилер": "triler",
        "Новела": "novela",
        "Бајка": "bajka",
        "Наука": "nauka",
        "Биографија": "biografija",
        "Бизнис": "biznis",
        "Филозофија": "filozofija",
        "Историја": "istorija",
        "Технологија": "tehnologija",
        "Психологија": "psihologija",
        "Књижевност": "knjizevnost",
        "Поезија": "poezija",
        "Бизнис" : "biznis"
    };

    return mapa[zanr] || "";
}

ucitajAutora();


const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});




const modalLogin = document.getElementById("modal-login");
const modalVecOcenio = document.getElementById("modal-vec-ocenio");
const modalBezOcene = document.getElementById("modal-bez-ocene");



document.querySelector(".pa-zvezdice").addEventListener("click", (e) => {
    const span = e.target.closest("span");
    if (!span) return;

    izabranaOcena = Number(span.dataset.vrednost);

    document.querySelectorAll(".pa-zvezdice span").forEach(s => {
        s.classList.toggle("vasa-ocena", Number(s.dataset.vrednost) <= izabranaOcena);
    });
});

document.querySelector(".pa-oceni-btn").addEventListener("click", async () => {

    const korisnikId = localStorage.getItem("korisnikId");

    if (!korisnikId) {
        modalLogin.classList.add("open");
        return;
    }

    if (izabranaOcena === 0) {
        modalBezOcene.classList.add("open");
        return;
    }

    const oceneData = await ajaxGet(`${firebaseUrl}/ocene.json`);
    const vecOcenio = oceneData && Object.values(oceneData).some(
        o => o.idAutora === trenutniId && o.idKorisnika === korisnikId
    );

    if (vecOcenio) {
        modalVecOcenio.classList.add("open");
        return;
    }

    const sveOcene = await ajaxGet(`${firebaseUrl}/ocene.json`);
    const brojevi = sveOcene 
        ? Object.keys(sveOcene)
            .filter(k => k.startsWith("oce"))
            .map(k => parseInt(k.slice(3)))
            .filter(n => !isNaN(n))
        : [];

    const sledeciBroj = brojevi.length ? Math.max(...brojevi) + 1 : 1;
    const noviId = "oce" + String(sledeciBroj).padStart(3, "0");

    const rezultat = await ajaxPut(`${firebaseUrl}/ocene/${noviId}.json`, {
        idAutora: trenutniId,
        idKorisnika: korisnikId,
        vrednost: izabranaOcena
    });

    if (!rezultat) {
        alert("Грешка при оцењивању.");
        return;
    }

    const noviPodaci = await ajaxGet(`${firebaseUrl}/ocene.json`);
    const prosek = izracunajProsek(noviPodaci, trenutniId);

    document.querySelector(".pa-ocena-broj").textContent = formatProsek(prosek);
    document.querySelector(".pa-ocena-card .stars").textContent = formatZvezdice(prosek);
    document.querySelector(".pa-ocena-count").textContent = brojOcena(noviPodaci, trenutniId) + " оцена";
});

document.getElementById("modal-login-otkazi").addEventListener("click", () => {
    modalLogin.classList.remove("open");
});

document.getElementById("modal-login-close").addEventListener("click", () => {
    modalLogin.classList.remove("open");
});


document.getElementById("modal-vec-ocenio-ok").addEventListener("click", () => {
    modalVecOcenio.classList.remove("open");
});

document.getElementById("modal-vec-ocenio-close").addEventListener("click", () => {
    modalVecOcenio.classList.remove("open");
});

document.getElementById("modal-bez-ocene-ok").addEventListener("click", () => {
    modalBezOcene.classList.remove("open");
});

document.getElementById("modal-bez-ocene-close").addEventListener("click", () => {
    modalBezOcene.classList.remove("open");
});