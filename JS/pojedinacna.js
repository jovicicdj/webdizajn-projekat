let sveKnjige = {};
let sviAutori = {};
let sveOcene = {};
let sviKorisnici = {};
let trenutnaKnjigaId = null;

function zanrKlasa(zanr) {
    const mapa = {
        "Роман": "roman",
        "Класика": "klasik",
        "Дистопија": "distopija",
        "Фантазија": "fantazija",
        "Научна фантастика": "naucna-fantastika",
        "Научна фан.": "naucna-fantastika",
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
        "Поезија": "poezija"
    };

    return mapa[zanr] || "";
}

function getSlika(objekat) {
    if (objekat.slike) return Object.values(objekat.slike)[0];
    return "images/default.jpg";
}



function formatDatum(datum) {
    if (!datum) return "-";

    const delovi = datum.split("-");
    if (delovi.length !== 3) return datum;

    return `${delovi[2]}.${delovi[1]}.${delovi[0]}.`;
}

function getRecenzijeKnjige(idKnjige) {
    if (!sveOcene) return [];

    return Object.values(sveOcene).filter(recenzija => {
        return recenzija.idKnjige === idKnjige;
    });
}

function napraviSledeciRecenzijaId(recenzijeData) {
    const brojevi = recenzijeData
        ? Object.keys(recenzijeData)
            .map(id => {
                const poklapanje = id.match(/^rec(\d+)$/);
                return poklapanje ? Number(poklapanje[1]) : NaN;
            })
            .filter(broj => !isNaN(broj))
        : [];

    const sledeciBroj = brojevi.length ? Math.max(...brojevi) + 1 : 1;
    return "rec" + String(sledeciBroj).padStart(3, "0");
}

function ucitajOsnovnePodatke(id, knjiga, autor) {
    const slika = getSlika(knjiga);
    const imeAutora = autor ? `${autor.ime} ${autor.prezime}` : "Непознат аутор";

    document.title = knjiga.naziv || "Појединачна књига";

    document.querySelector(".knjiga-slika").innerHTML =
    `<img src="${getSlika(knjiga)}" alt="${knjiga.naziv}">`;

    slikeKnjige = getSlika(knjiga);
    // prikaziSliku();

    const zanrBtn = document.querySelector(".knjiga-info-top .book-genre");
    zanrBtn.textContent = knjiga.zanr || "-";
    zanrBtn.className = `book-genre ${zanrKlasa(knjiga.zanr)} button-pojedinacna-info`;

    document.querySelector(".knjiga-info-top p").textContent = knjiga.naziv || "-";

    const autorLink = document.querySelector(".knjiga-info-top .pojedinacna-hiperlink");
    autorLink.textContent = `Аутор: ${imeAutora} →`;
    autorLink.href = knjiga.idAutora
        ? `pojedinacan_autor.html?id=${knjiga.idAutora}`
        : "#";

    const atributi = document.querySelectorAll(".knjiga-atributi .atribut-card .atribut-vrednost");

    atributi[0].textContent = knjiga.zanr || "-";
    atributi[1].textContent = knjiga.brojStrana || "-";
    atributi[2].textContent = knjiga.format || "-";
    atributi[3].textContent = knjiga.cena ? `${knjiga.cena} РСД` : "-";

    const brojRecenzija = getRecenzijeKnjige(id).length;
    document.querySelector(".knjiga-rejting .broj-recenzija").textContent = `· ${brojRecenzija} рецензија`;

    document.querySelector(".knjiga-opis-content p").textContent =
        knjiga.opis || "Опис није доступан.";
}

function ucitajDetaljeKnjige(knjiga) {
    const kartice = document.querySelectorAll(".knjiga-info-dodatak-card");

    if (kartice.length < 1) return;

    kartice[0].querySelector(".atribut-vrednost").textContent = knjiga.isbn || "-";
}

function ucitajSlicneKnjige(trenutniId, trenutnaKnjiga) {
    const container = document.querySelector(".slicne-knjige");

    container.querySelectorAll(".slicne-knjige-card").forEach(card => card.remove());
    container.querySelector(".prazna-poruka")?.remove();

    const slicne = Object.entries(sveKnjige)
        .filter(([id, knjiga]) => {
            return id !== trenutniId && knjiga.zanr === trenutnaKnjiga.zanr;
        })
        .map(([id, knjiga]) => {
            return {
                id,
                knjiga,
                brojRecenzija: getRecenzijeKnjige(id).length
            };
        })
        .slice(0, 3);

    if (slicne.length === 0) {
        const p = document.createElement("p");
        p.className = "prazna-poruka";
        p.style.color = "#888";
        p.textContent = "Нема сличних књига.";
        container.appendChild(p);
        return;
    }

    slicne.forEach(({ id, knjiga, prosek, brojRecenzija }) => {
        const autor = sviAutori[knjiga.idAutora];
        const imeAutora = autor ? `${autor.ime} ${autor.prezime}` : "Непознат аутор";
        const slika = getSlika(knjiga);

        const card = document.createElement("div");
        card.className = "slicne-knjige-card";

        card.innerHTML = `
            <div class="slicne-knjige-slika">
                <a href="pojedinacna.html?id=${id}">
                    <img src="${slika}" alt="${knjiga.naziv}">
                </a>
            </div>

            <div class="slicne-knjige-tekst">
                <p class="atribut-vrednost">${knjiga.naziv || "-"}</p>
                <p class="atribut-ime">${imeAutora}</p>
                <span class="broj-recenzija">${brojRecenzija} рецензија</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function ucitajRecenzije(idKnjige) {
    const lista = document.querySelector(".lista-recenzija");

    lista.querySelectorAll(".recenzija-card").forEach(card => card.remove());
    lista.querySelector(".prazna-poruka")?.remove();

    const recenzije = getRecenzijeKnjige(idKnjige);

    if (recenzije.length === 0) {
        const p = document.createElement("p");
        p.className = "prazna-poruka";
        p.style.color = "#888";
        p.textContent = "Нема рецензија за ову књигу.";
        lista.appendChild(p);
        return;
    }

    recenzije.forEach(recenzija => {
        const korisnik = sviKorisnici[recenzija.idKorisnika];

        let imeKorisnika = "Анонимни корисник";

        if (korisnik) {
            imeKorisnika =
                korisnik.korisnickoIme ||
                "Корисник";
        }

        const vrednost = Number(recenzija.vrednost || 0);

        const card = document.createElement("div");
        card.className = "recenzija-card";

        card.innerHTML = `
            <div class="recenzija-podaci">
                <p class="recenzija-korisnik">${imeKorisnika}</p>
                <p class="recenzija-sadrzaj">
                    ${recenzija.tekst || "Без текста рецензије."}
                </p>
            </div>

            <div class="recenzija-datum">
                <p class="recenzija-datum-tekst">${formatDatum(recenzija.datum)}</p>
            </div>
        `;

        lista.appendChild(card);
    });
}

async function ucitajKnjigu() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    trenutnaKnjigaId = id;

    if (!id) {
        document.querySelector(".main-pojedinacna-content").innerHTML =
            "<p style='color:#888'>Није прослеђен ID књиге.</p>";
        return;
    }

    sveKnjige = await ajaxGet(firebaseUrl + "/knjige.json");
    sviAutori = await ajaxGet(firebaseUrl + "/autori.json");
    sveOcene = await ajaxGet(firebaseUrl + "/recenzije.json");
    sviKorisnici = await ajaxGet(firebaseUrl + "/korisnici.json");

    if (!sveKnjige) sveKnjige = {};
    if (!sviAutori) sviAutori = {};
    if (!sveOcene) sveOcene = {};
    if (!sviKorisnici) sviKorisnici = {};

    const knjiga = sveKnjige[id];

    if (!knjiga) {
        document.querySelector(".main-pojedinacna-content").innerHTML =
            "<p style='color:#888'>Књига није пронађена.</p>";
        return;
    }

    const autor = sviAutori[knjiga.idAutora];

    ucitajOsnovnePodatke(id, knjiga, autor);
    ucitajDetaljeKnjige(knjiga);
    ucitajSlicneKnjige(id, knjiga);
    ucitajRecenzije(id);
}

async function objaviRecenziju(e) {
    e.preventDefault();

    const korisnikId = localStorage.getItem("korisnikId");

    if (!korisnikId) {
        window.location.href = "login.html";
        return;
    }

    if (!trenutnaKnjigaId) {
        alert("Није пронађен ID књиге.");
        return;
    }

    const tekstInput = document.getElementById("sadrzaj");
    const tekst = tekstInput.value.trim();

    if (!tekst) {
        alert("Унесите текст рецензије.");
        return;
    }

    const datum = new Date().toISOString().split("T")[0];

    const novaRecenzija = {
        datum,
        idKnjige: trenutnaKnjigaId,
        idKorisnika: korisnikId,
        tekst
    };

    const recenzijeData = await ajaxGet(firebaseUrl + "/recenzije.json");
    const novaRecenzijaId = napraviSledeciRecenzijaId(recenzijeData);
    const rezultat = await ajaxPut(`${firebaseUrl}/recenzije/${novaRecenzijaId}.json`, novaRecenzija);

    if (!rezultat) {
        alert("Грешка при објављивању рецензије.");
        return;
    }

    tekstInput.value = "";
    sveOcene = await ajaxGet(firebaseUrl + "/recenzije.json");

    if (!sveOcene) sveOcene = {};

    ucitajRecenzije(trenutnaKnjigaId);

    const brojRecenzija = getRecenzijeKnjige(trenutnaKnjigaId).length;
    document.querySelector(".knjiga-rejting .broj-recenzija").textContent = `· ${brojRecenzija} рецензија`;
}

ucitajKnjigu();

const formaRecenzije = document.querySelector(".recenzija-forma form");

if (formaRecenzije) {
    formaRecenzije.addEventListener("submit", objaviRecenziju);
}

const tekstRecenzijeInput = document.getElementById("sadrzaj");
if (tekstRecenzijeInput){
    tekstRecenzijeInput.value = "";
}
