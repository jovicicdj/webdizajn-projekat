const booksGrid = document.querySelector(".books-content");
const searchBar = document.querySelector(".search-bar");
const filterButtons = document.querySelectorAll(".filter-card");

let sveKnjige = [];
let aktivniFilter = "Све";

function zanrKlasa(zanr) {
    const mapa = {
        "Класика": "klasik",
        "Наука": "klasik",
        "Дистопија": "distopija",
        "Фантастика": "sci-fi",
        "Научна фан.": "naucna",
        "Фантазија": "fantazija",
        "Трилер": "triler",
        "Новела": "novela",
        "Хорор": "horor",
        "Роман": "roman",
        "Наука": "nauka",
        "Филозофија": "filozofija",

    };

    return mapa[zanr] || "";
}

function getSlika(knjiga) {
    if (Array.isArray(knjiga.slike)) return knjiga.slike[0];
    if (knjiga.slike) return Object.values(knjiga.slike)[0];
    return "images/default.jpg";
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
        const autorId = knjiga.idAutora

        card.innerHTML = `
            <div class="book-cover">
                <a href="pojedinacna.html?id=${id}">
                    <img src="${slika}" alt="${knjiga.naziv}">
                </a>
                <p class="book-card-naslov">${knjiga.naziv}</p>
            </div>

            <div class="book-desc">
                <p class="book-author">Аутор: ${knjiga.autor || knjiga.imeAutora || "-"}</p>
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
        const autor = (knjiga.autor || knjiga.imeAutora || "").toLowerCase();

        const poklapaPretraga =
            naziv.includes(pretraga) ||
            zanr.includes(pretraga) ||
            autor.includes(pretraga);

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
        filterButtons.forEach(b => b.classList.remove("active-filter"));
        btn.classList.add("active-filter");

        aktivniFilter = btn.textContent.trim();
        filtriraj();
    });
});

searchBar.addEventListener("input", filtriraj);

ucitajKnjige();