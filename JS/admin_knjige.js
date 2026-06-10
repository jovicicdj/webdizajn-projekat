const tabela = document.querySelector(".tabela-knjiga");

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

function getSlika(knjiga) {
    if (Array.isArray(knjiga.slike)) return knjiga.slike[0];
    if (knjiga.slike) return Object.values(knjiga.slike)[0];
    return "images/default.jpg";
}

function brojRecenzijaKnjige(recenzijeData, idKnjige) {
    if (!recenzijeData) return 0;

    return Object.values(recenzijeData).filter(recenzija => {
        return recenzija.idKnjige === idKnjige;
    }).length;
}

async function ucitajKnjigeUTabelu() {
    tabela.querySelectorAll(".tabela-row").forEach(red => red.remove());

    const knjigeData = await ajaxGet(firebaseUrl + "/knjige.json");
    const autoriData = await ajaxGet(firebaseUrl + "/autori.json");
    const recenzijeData = await ajaxGet(firebaseUrl + "/recenzije.json");

    if (!knjigeData) {
        const p = document.createElement("p");
        p.style.color = "#888";
        p.textContent = "Нема књига у бази.";
        tabela.appendChild(p);
        return;
    }

    Object.entries(knjigeData).forEach(([knjigaId, knjiga]) => {
        const autor = autoriData ? autoriData[knjiga.idAutora] : null;
        const imeAutora = autor
            ? `${autor.ime} ${autor.prezime}`
            : "Непознат аутор";

        const slika = getSlika(knjiga);
        const brojRecenzija = brojRecenzijaKnjige(recenzijeData, knjigaId);

        const row = document.createElement("div");
        row.className = "tabela-row";
        row.dataset.id = knjigaId;

        row.innerHTML = `
            <div class="tr-1">
                <img src="${slika}" alt="${knjiga.naziv || ""}" class="tabela-knjiga-slika">
                <p>${knjiga.naziv || "-"}</p>
            </div>

            <div class="tr-2">
                <p>${imeAutora}</p>
            </div>

            <div class="tr-3">
                <button class="book-genre ${zanrKlasa(knjiga.zanr)} button-tabela">
                    ${knjiga.zanr || "-"}
                </button>
            </div>

            <div class="tr-4">
                <p>${knjiga.format || "-"}</p>
            </div>

            <div class="tr-5">
                <p>${brojRecenzija}</p>
            </div>

            <div class="tr-6">
                <p>${knjiga.brojStrana || "-"}</p>
            </div>

            <div class="tr-7">
                <p>${knjiga.isbn || "-"}</p>
            </div>

            <div class="tr-8">
                <button class="action-buttons btn-obrisi">
                    <ion-icon name="trash"></ion-icon>
                </button>
                <button class="action-buttons btn-izmena">
                    <ion-icon name="create-outline"></ion-icon>
                </button>
            </div>
        `;

        tabela.appendChild(row);
    });
}

ucitajKnjigeUTabelu();