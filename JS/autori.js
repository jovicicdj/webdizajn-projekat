
const authorsGrid = document.querySelector(".authors")
const authorsCount = document.querySelector(".authors-header p");
const searchBar = document.querySelector(".search-bar");
const filterButtons = document.querySelectorAll(".filter-card")

let sviAutori = [];
let aktivniFilter = "Сви";


function srcSlike(slike) {
    let v = null;
    if (Array.isArray(slike)) v = slike[0];
    else if (slike) v = Object.values(slike)[0];

    if (!v) return "images/placeholder.png";
    if (v.startsWith("data:") || v.startsWith("http") || v.startsWith("images/")) return v;
    return "data:image/png;base64," + v;
}


function statusKlasa(status) {

    if (status === "Активан") return "active";
    if (status === "У пензији") return "retired";
    if (status === "Преминуо") return "deceased";
    return "";

}

function escapeHTML(vrednost) {
    return String(vrednost ?? "").replace(/[&<>"']/g, znak => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[znak]));
}

function escapeRegExp(vrednost) {
    return vrednost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function oznaciPretragu(tekst) {
    const pretraga = searchBar.value.trim();
    const bezbedanTekst = escapeHTML(tekst || "-");

    if (!pretraga) return bezbedanTekst;

    const regex = new RegExp(`(${escapeRegExp(pretraga)})`, "gi");
    return bezbedanTekst.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function renderAutori(lista) {

    
    authorsGrid.innerHTML = "";
    authorsCount.textContent = `${lista.length} аутора`;
    
    if (lista.length === 0) {
        
        authorsGrid.innerHTML = "<p style='color: #888'>Нема резултата.</p>";
        return;
        
    }
    
    lista.forEach(({id, autor, prosek}) => {
        
        const pune = Math.round(prosek);
        const zvezdice = "★".repeat(pune) + "☆".repeat(5 - pune);

        const slika = srcSlike(autor.slike);
        const card = document.createElement("div");
        card.className = "author-card";
        card.innerHTML = `
            <a href="pojedinacan_autor.html?id=${id}">
                <img class="author-avatar" src="${slika}" alt="${autor.ime} ${autor.prezime}">
            </a>
            <h6>${oznaciPretragu(`${autor.ime} ${autor.prezime}`)}</h6>
            <p class="stars">${zvezdice}</p>
            <div class="author-info">
                <p class="number-of-awards">${autor.brojOsvojenihNagrada} награда</p>
            </div>
            <span class="status ${statusKlasa(autor.status)}">${autor.status}</span>
            <button class="view-profile" onclick="window.location='pojedinacan_autor.html?id=${id}'">Погледај профил</button>
        `;
        authorsGrid.appendChild(card);
    });

}

function filtriraj() {
    const pretraga = searchBar.value.toLowerCase();

    let rezultat = sviAutori.filter(({ autor }) => {
        const imeIPrezime = `${autor.ime} ${autor.prezime}`.toLowerCase();
        // const nagrade = Number(autor.brojOsvojenihNagrada);
        // const status = (autor.status || "").toLowerCase();
        
        const poklapa = imeIPrezime.includes(pretraga);
        // || (pretraga !== "" && nagrade === Number(pretraga));
        // || status.includes(pretraga.toLowerCase());
        const filterPoklapa = aktivniFilter === "Сви" || autor.status === aktivniFilter;
        return poklapa && filterPoklapa;
    });
    renderAutori(rezultat);
}

async function ucitajAutore() {

    authorsGrid.innerHTML = "<p style='color: #888'>Учитавање...</p>";

    const [autoriData, oceneData] = await Promise.all([
        ajaxGet(firebaseUrl + "/autori.json"),
        ajaxGet(firebaseUrl + "/ocene.json")
    ]);

    if (autoriData) {

        const ocenePoAutoru = {};

        if (oceneData) {

            Object.values(oceneData).forEach(ocena => {
                if (!ocenePoAutoru[ocena.idAutora]) {
                    ocenePoAutoru[ocena.idAutora] = { suma: 0, broj: 0 };
                }
                ocenePoAutoru[ocena.idAutora].suma += ocena.vrednost;
                ocenePoAutoru[ocena.idAutora].broj += 1;
            });

        }
        

        sviAutori = Object.entries(autoriData).map(([id, autor]) => {

            const o = ocenePoAutoru[id];
            const prosek = o ? o.suma / o.broj : 0;
            return { id, autor, prosek };

        });

        renderAutori(sviAutori)
    }

}

filterButtons.forEach( btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach( b => b.classList.remove("active-filter"));
        btn.classList.add("active-filter");
        aktivniFilter = btn.textContent.trim();
        filtriraj();
    })
})

searchBar.addEventListener("input", filtriraj);

ucitajAutore();

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});
