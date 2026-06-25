const booksGrid = document.querySelector(".books-content");
const searchBar = document.querySelector(".search-bar");
const filterButtons = document.querySelectorAll(".filter-card");

let sveKnjige = {};
let sviAutori = {};
let aktivniFilter = "Све";







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

function getSlika(objekat) {
    let v = null;
    if (objekat && Array.isArray(objekat.slike)) v = objekat.slike[0];
    else if (objekat && objekat.slike) v = Object.values(objekat.slike)[0];

    if (!v) return "images/placeholder.png";
    // vec je base64 (data URL) ili obican link/putanja -> koristi direktno
    if (v.startsWith("data:") || v.startsWith("http") || v.startsWith("images/")) return v;
    // cist base64 bez prefiksa -> pretvori nazad u sliku
    return "data:image/png;base64," + v;
}

function renderKnjige(lista) {
    booksGrid.innerHTML = "";

    if (lista.length === 0) {
        booksGrid.innerHTML = "<p style='color:#888'>Нема резултата.</p>";
        return;
    }

    lista.forEach(({ id, knjiga }) => {
        const slika = getSlika(knjiga);

        const card = document.createElement("div");
        card.className = "book-card";
        const autorId = knjiga.idAutora;
        const autor = sviAutori?.[autorId];
        const imeAutora = autor
            ? `${autor.ime} ${autor.prezime}`
            : "-";

        card.innerHTML = `
            <div class="book-cover">
                <a href="pojedinacna.html?id=${id}">
                    <img src="${slika}" alt="${knjiga.naziv}">
                </a>
                <p class="book-card-naslov">${knjiga.naziv}</p>
            </div>

            <div class="book-desc">
                <p class="book-author">Аутор: ${imeAutora}</p>
                <p class="book-recom">${knjiga.cena || 0} РСД</p>
                <button class="book-genre ${zanrKlasa(knjiga.zanr)}">${knjiga.zanr}</button>
            </div>
        `;
        
        booksGrid.appendChild(card);
    });
}

function filtriraj() {
    const pretraga = searchBar.value.toLowerCase().trim();

    const rezultat = sveKnjige.filter(({ knjiga }) => {
        const naziv = (knjiga.naziv || "").toLowerCase();
        const zanr = (knjiga.zanr || "").toLowerCase();
        const idAutora = (knjiga.idAutora || "");
        const autor = sviAutori?.[idAutora];
        const imeAutora = autor ? (`${autor.ime} ${autor.prezime}`).toLowerCase() : "";

        const poklapaPretraga =
            naziv.includes(pretraga) ||
            zanr.includes(pretraga) ||
            imeAutora.includes(pretraga);

        const poklapaFilter =
            aktivniFilter === "Све" ||
            knjiga.zanr === aktivniFilter;

        return poklapaPretraga && poklapaFilter;
    });

    renderKnjige(rezultat);
}

async function ucitajKnjige() {
    booksGrid.innerHTML = "<p style='color:#888'>Учитавање...</p>";

    const knjigeData = await ajaxGet(firebaseUrl + "/knjige.json");

    sviAutori = await ajaxGet(firebaseUrl + "/autori.json");

    if (!knjigeData) {
        booksGrid.innerHTML = "<p style='color:#888'>Грешка при учитавању.</p>";
        return;
    }

    sveKnjige = Object.entries(knjigeData).map(([id, knjiga]) => {
        return { id, knjiga };
    });

    renderKnjige(sveKnjige);
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active-hyperlink"));
        btn.classList.add("active-hyperlink");

        aktivniFilter = btn.textContent.trim();
        filtriraj();
    });
});

searchBar.addEventListener("input", filtriraj);

ucitajKnjige();