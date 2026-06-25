const tabela = document.querySelector(".tabela-knjiga");
const dodajBtn = document.querySelector(".pretraga-knjiga button");
const searchBar = document.querySelector(".pretraga-knjiga .search-bar");

let sveKnjige = [];
let sviAutori = {};
let idZaBrisanje = null;

const modalBrisanje = document.getElementById("modal-brisanje");

const zanrovi = [
    "Роман",
    "Класика",
    "Дистопија",
    "Фантазија",
    "Научна фантастика",
    "Трилер",
    "Новела",
    "Бајка",
    "Наука",
    "Биографија",
    "Бизнис",
    "Филозофија",
    "Историја",
    "Технологија",
    "Психологија",
    "Књижевност",
    "Поезија"
];

const formati = [
    "Тврди повез",
    "Меки повез",
    "Е-књига",
    "Аудио књига"
];

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

function zatvoriModalBrisanje() {
    modalBrisanje.classList.remove("open");
    idZaBrisanje = null;
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

function imeAutora(idAutora) {
    const autor = sviAutori ? sviAutori[idAutora] : null;
    return autor ? `${autor.ime} ${autor.prezime}` : "Непознат аутор";
}

function optioniAutora(izabraniId) {
    return Object.entries(sviAutori || {}).map(([id, autor]) => {
        const selected = id === izabraniId ? "selected" : "";
        return `<option value="${id}" ${selected}>${autor.ime} ${autor.prezime}</option>`;
    }).join("");
}

function optioniListe(lista, izabrano) {
    return lista.map(vrednost => {
        const selected = vrednost === izabrano ? "selected" : "";
        return `<option ${selected}>${vrednost}</option>`;
    }).join("");
}

function ocistiGreske(red, dodatniRed) {
    [red, dodatniRed].forEach(element => {
        if (!element) return;
        element.classList.remove("ima-greske");
        element.querySelectorAll(".admin-greska").forEach(greska => greska.remove());
        element.querySelectorAll(".input-greska").forEach(input => input.classList.remove("input-greska"));
    });
}

function prikaziGresku(input, tekst) {
    input.classList.add("input-greska");

    const greska = document.createElement("p");
    greska.className = "admin-greska";
    greska.textContent = tekst;

    input.insertAdjacentElement("afterend", greska);
}

function dodajGresku(greske, input, tekst) {
    greske.push({ input, tekst });
}

async function ucitajKnjigeUTabelu() {
    const [knjigeData, autoriData, recenzijeData] = await Promise.all([
        ajaxGet(firebaseUrl + "/knjige.json"),
        ajaxGet(firebaseUrl + "/autori.json"),
        ajaxGet(firebaseUrl + "/recenzije.json")
    ]);

    sviAutori = autoriData || {};

    if (!knjigeData) {
        sveKnjige = [];
        renderKnjige([]);
        return;
    }

    sveKnjige = Object.entries(knjigeData).map(([id, knjiga]) => {
        return {
            id,
            knjiga,
            brojRecenzija: brojRecenzijaKnjige(recenzijeData, id)
        };
    });

    renderKnjige(sveKnjige);
}

function renderKnjige(lista) {
    tabela.querySelectorAll(".tabela-row").forEach(red => red.remove());

    if (lista.length === 0) {
        const red = document.createElement("div");
        red.className = "tabela-row";
        red.innerHTML = `<div class="tr-1"><p>Нема књига.</p></div>`;
        tabela.appendChild(red);
        return;
    }

    lista.forEach(({ id, knjiga, brojRecenzija }) => {
        const slika = getSlika(knjiga);

        const row = document.createElement("div");
        row.className = "tabela-row";
        row.dataset.id = id;
        row.dataset.knjiga = JSON.stringify(knjiga);

        row.innerHTML = `
            <div class="tr-1">
                <img src="${slika}" alt="${knjiga.naziv || ""}" class="tabela-knjiga-slika">
                <p>${knjiga.naziv || "-"}</p>
            </div>

            <div class="tr-2">
                <p>${imeAutora(knjiga.idAutora)}</p>
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

function filtriraj() {
    const pretraga = searchBar.value.toLowerCase().trim();
    
    const rezultat = sveKnjige.filter(({ knjiga, brojRecenzija }) => {
        const naziv = (knjiga.naziv || "").toLowerCase();
        const zanr = (knjiga.zanr || "").toLowerCase();
        const autor = imeAutora(knjiga.idAutora).toLowerCase();
        const isbn = (knjiga.isbn || "").toLowerCase();
        const povez = (knjiga.format || "").toLowerCase();
        const brojStrana = (knjiga.brojStrana || 0);
        const idKnjige = (knjiga.id || "");

        return (
            naziv.includes(pretraga) ||
            zanr.includes(pretraga) ||
            autor.includes(pretraga) ||
            isbn.includes(pretraga) || 
            povez.includes(pretraga) ||
            brojStrana === Number(pretraga) ||
            brojRecenzija === Number(pretraga)
        );

        console.log(brojStrana);
    });

    renderKnjige(rezultat);
}

function napraviFormu({ btnTekst, podaci = {}, brojRecenzija = 0, onSubmit }) {
    const red = document.createElement("div");
    red.className = "tabela-row edit-row";

    const opisRed = document.createElement("div");
    opisRed.className = "tabela-row edit-row-bio";

    const slika = podaci.slike ? Object.values(podaci.slike)[0] : "images/placeholder.png";

    red.innerHTML = `
        <form class="edit-forma" onsubmit="return false;"></form>
        <div class="tr-1">
            <input type="file" class="edit-file-input" accept=".jpg,.jpeg,.png,.webp,.avif">
            <img src="${slika}" class="tabela-knjiga-slika edit-slika-preview" style="cursor:pointer;" title="Кликни да промениш слику">
            <input type="text" class="adm-input edit-input f-naziv" placeholder="Назив књиге" value="${podaci.naziv || ""}" pattern="^[А-ЯЂЈЉЊЋЏ]">
        </div>

        <div class="tr-2">
            <select class="adm-input adm-select edit-input f-autor" required>
                <option value="">Изабери аутора</option>
                ${optioniAutora(podaci.idAutora)}
            </select>
        </div>

        <div class="tr-3">
            <select class="adm-input adm-select edit-input f-zanr" required>
                <option value="">Жанр</option>
                ${optioniListe(zanrovi, podaci.zanr)}
            </select>
        </div>

        <div class="tr-4">
            <select class="adm-input adm-select edit-input f-format" required>
                <option value="">Формат</option>
                ${optioniListe(formati, podaci.format)}
            </select>
        </div>

        <div class="tr-5">
            <input type="number" class="adm-input edit-input" value="${brojRecenzija}" disabled>
        </div>

        <div class="tr-6">
            <input type="number" class="adm-input edit-input f-broj-strana" placeholder="Број страна" value="${podaci.brojStrana || ""}" required>
        </div>

        <div class="tr-7">
            <input type="text" class="adm-input edit-input f-isbn" placeholder="ISBN" value="${podaci.isbn || ""}" pattern = "^[0-9]{3}-[0-9]{10}$" required>
        </div>

        <div class="tr-8">
            <button class="adm-btn-sacuvaj edit-btn btn-sacuvaj">${btnTekst}</button>
            <button class="adm-btn-otkazi edit-btn btn-otkazi">Откажи</button>
        </div>
    `;

    opisRed.innerHTML = `
        <div class="edit-cena-box">
            <label>Цена</label>
            <input type="number" class="adm-input edit-input f-cena" placeholder="Цена" value="${podaci.cena || ""}">
        </div>

        <div class="edit-opis-box">
            <label>Опис књиге</label>
            <textarea class="adm-textarea f-opis" placeholder="Опис књиге...">${podaci.opis || ""}</textarea>
        </div>
    `;

    const fileInput = red.querySelector(".edit-file-input");
    const slikaPreview = red.querySelector(".edit-slika-preview");

    slikaPreview.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => slikaPreview.src = e.target.result;
            reader.readAsDataURL(file);
        }
    });

    red.querySelector(".btn-sacuvaj").addEventListener("click", () => {
        ocistiGreske(red, opisRed);

        const nazivInput = red.querySelector(".f-naziv");
        const autorInput = red.querySelector(".f-autor");
        const zanrInput = red.querySelector(".f-zanr");
        const formatInput = red.querySelector(".f-format");
        const brojStranaInput = red.querySelector(".f-broj-strana");
        const isbnInput = red.querySelector(".f-isbn");
        const cenaInput = opisRed.querySelector(".f-cena");
        const opisInput = opisRed.querySelector(".f-opis");

        const naziv = nazivInput.value.trim();
        const idAutora = autorInput.value.trim();
        const zanr = zanrInput.value.trim();
        const format = formatInput.value.trim();
        const brojStrana = brojStranaInput.value.trim();
        const isbn = isbnInput.value.trim();
        const cena = cenaInput.value.trim();
        const opis = opisInput.value.trim();
        const slika = red.querySelector(".edit-slika-preview").src;
        const greske = [];

        const nazivRegEx = /^[А-ЯЂЈЉЊЋЏ][А-ЯЂЈЉЊЋЏа-яђјљњћџ0-9\s.,:;!?'"\-()]{1,79}$/;
        const brojStranaRegEx = /^[1-9][0-9]*$/;
        const isbnRegEx = /^[0-9]{3}-[0-9]{10}$/;

        if (!naziv) {
            dodajGresku(greske, nazivInput, "Unesite naziv knjige.");
        } else if (!nazivRegEx.test(naziv)) {
            dodajGresku(greske, nazivInput, "Naziv knjige mora poceti velikim cirilicnim slovom i biti na cirilici.");
        }

        if (!idAutora) {
            dodajGresku(greske, autorInput, "Izaberite autora.");
        }

        if (!zanr) {
            dodajGresku(greske, zanrInput, "Izaberite zanr.");
        }

        if (!format) {
            dodajGresku(greske, formatInput, "Izaberite format.");
        }

        if (!brojStrana) {
            dodajGresku(greske, brojStranaInput, "Unesite broj strana.");
        } else if (!brojStranaRegEx.test(brojStrana)) {
            dodajGresku(greske, brojStranaInput, "Broj strana mora biti pozitivan broj.");
        }

        if (!isbn) {
            dodajGresku(greske, isbnInput, "Unesite ISBN.");
        } else if (!isbnRegEx.test(isbn)) {
            dodajGresku(greske, isbnInput, "ISBN mora biti u formatu 978-1234567890.");
        }

        if (!cena) {
            dodajGresku(greske, cenaInput, "Unesite cenu.");
        } else if (!brojStranaRegEx.test(cena)) {
            dodajGresku(greske, cenaInput, "Cena mora biti pozitivan broj.");
        }

        if (!opis) {
            dodajGresku(greske, opisInput, "Unesite opis knjige.");
        }

        if (greske.length > 0) {
            red.classList.add("ima-greske");
            opisRed.classList.add("ima-greske");
            greske.forEach(({ input, tekst }) => prikaziGresku(input, tekst));
            return;
        }

        const noviPodaci = {
            brojStrana: Number(brojStrana),
            cena: Number(cena),
            format,
            idAutora,
            isbn,
            naziv,
            opis,
            slike: [slika],
            zanr
        };

        if (onSubmit) onSubmit(noviPodaci, red, opisRed);
    });

    red.querySelector(".btn-otkazi").addEventListener("click", () => {
        red.remove();
        opisRed.remove();
    });

    return { red, opisRed };
}

searchBar.addEventListener("input", filtriraj);

dodajBtn.addEventListener("click", () => {
    document.querySelector(".edit-row")?.remove();
    document.querySelector(".edit-row-bio")?.remove();

    const { red, opisRed } = napraviFormu({
        btnTekst: "Додај",
        onSubmit: async (podaci, r, o) => {
            const rezultat = await ajaxPost(`${firebaseUrl}/knjige.json`, podaci);

            if (rezultat) {
                r.remove();
                o.remove();
                ucitajKnjigeUTabelu();
            } else {
                alert("Грешка при додавању књиге.");
            }
        }
    });

    tabela.appendChild(red);
    tabela.appendChild(opisRed);
    red.scrollIntoView({ behavior: "smooth", block: "center" });
});

tabela.addEventListener("click", (e) => {
    const obrisiBtn = e.target.closest(".btn-obrisi");
    if (!obrisiBtn) return;

    idZaBrisanje = obrisiBtn.closest(".tabela-row").dataset.id;
    modalBrisanje.classList.add("open");
});

document.getElementById("modal-brisanje-potvrdi").addEventListener("click", async () => {
    if (!idZaBrisanje) return;

    const rezultat = await ajaxDelete(`${firebaseUrl}/knjige/${idZaBrisanje}.json`);

    if (rezultat !== false) {
        zatvoriModalBrisanje();
        ucitajKnjigeUTabelu();
    } else {
        alert("Грешка при брисању књиге.");
    }
});
document.getElementById("modal-brisanje-otkazi").addEventListener("click", zatvoriModalBrisanje);
document.getElementById("modal-brisanje-close").addEventListener("click", zatvoriModalBrisanje);

tabela.addEventListener("click", (e) => {
    const izmenaBtn = e.target.closest(".btn-izmena");
    if (!izmenaBtn) return;

    document.querySelector(".edit-row")?.remove();
    document.querySelector(".edit-row-bio")?.remove();

    const row = izmenaBtn.closest(".tabela-row");
    const id = row.dataset.id;
    const podaci = JSON.parse(row.dataset.knjiga);
    const knjigaIzListe = sveKnjige.find(k => k.id === id);

    const { red, opisRed } = napraviFormu({
        btnTekst: "Сачувај",
        podaci,
        brojRecenzija: knjigaIzListe ? knjigaIzListe.brojRecenzija : 0,
        onSubmit: async (noviPodaci, r, o) => {
            const rezultat = await ajaxPut(`${firebaseUrl}/knjige/${id}.json`, noviPodaci);

            if (rezultat) {
                r.remove();
                o.remove();
                ucitajKnjigeUTabelu();
            } else {
                alert("Грешка при чувању књиге.");
            }
        }
    });

    row.insertAdjacentElement("afterend", opisRed);
    row.insertAdjacentElement("afterend", red);
    red.scrollIntoView({ behavior: "smooth", block: "center" });
});

ucitajKnjigeUTabelu();
