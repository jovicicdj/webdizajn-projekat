const tabela = document.querySelector(".tabela-autora");
const dodajBtn = document.querySelector(".adm-search-row button");

const searchBar = document.querySelector(".adm-search-row .search-bar");
let sviAutori = [];

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', () =>  {
    navMenu.classList.toggle('open')
});



function statusKlasa(status) {
    if (status === "Активан") return "active";
    if (status === "У пензији") return "retired";
    if (status === "Преминуо") return "deceased";
    return "";
}




async function ucitajAutore() {
    
    const [autoriData, oceneData] = await Promise.all([
        ajaxGet(`${firebaseUrl}/autori.json`),
        ajaxGet(`${firebaseUrl}/ocene.json`)
    ]);

    if (!autoriData) return;

    sviAutori = Object.entries(autoriData).map(([id, autor]) => {
        const prosek = izracunajProsek(oceneData, id);
        return { id, autor, prosek };
    });

    renderAutore(sviAutori);
}




function renderAutore(lista) {

    document.querySelectorAll(".tabela-row").forEach(r => r.remove());

    lista.forEach(({ id, autor, prosek }) => {

        const row = document.createElement("div");
        row.className = "tabela-row";
        row.dataset.id = id;
        row.dataset.autor = JSON.stringify(autor)
        const slika = autor.slike ? Object.values(autor.slike)[0] : "images/default.jpg";
        const prodatihPrimeraka = formatPrimerci(autor.brojProdatihPrimeraka);

        row.innerHTML = `

            <div class="ta-1">
                <img src="${slika}" class="tabela-autor-slika" alt="${autor.ime} ${autor.prezime}">
                <p>${autor.ime} ${autor.prezime}</p>
            </div>
            <div class="ta-2"><p>${autor.datumRodjenja || '-'}</p></div>
            <div class="ta-3"><span class="status ${statusKlasa(autor.status)}">${autor.status}</span></div>
            <div class="ta-4"><p>${autor.brojOsvojenihNagrada || '-'}</p></div>
            <div class="ta-5"><p>${prodatihPrimeraka}</p></div>
            <div class="ta-6">
                <span class="stars-tabela">${formatZvezdice(prosek)}</span>
                <p class="tabela-rejting">${formatProsek(prosek)}</p>
            </div>
            <div class="ta-7"><p>${autor.kontaktTelefonMenadzera || '-'}</p></div>
            <div class="ta-8">
                <button class="action-buttons btn-obrisi"><ion-icon name="trash"></ion-icon></button>
                <button class="action-buttons btn-izmena"><ion-icon name="create-outline"></ion-icon></button>
            </div>

        `
        tabela.appendChild(row);

    });
}




function filtriraj() {
    const pretraga = searchBar.value.toLowerCase();
    const rezultat = sviAutori.filter(({ autor }) => {
        const imeIPrezime = `${autor.ime} ${autor.prezime}`.toLowerCase();
        return imeIPrezime.includes(pretraga);
    });
    renderAutore(rezultat);
}

searchBar.addEventListener("input", filtriraj);



function napraviFormu({ naslov, btnTekst, podaci = {}, prosek = null, onSubmit }) {
    const red = document.createElement("div");
    red.className = "tabela-row edit-row";

    const biored = document.createElement("div");
    biored.className = "tabela-row edit-row-bio"
    const slika = podaci.slike ? Object.values(podaci.slike)[0] : "images/placeholder.png";


    red.innerHTML = `
    
        <form class="edit-forma" onsubmit="return false;"></form>
        <div class="ta-1">
            <input type="file" class="edit-file-input" accept=".jpg,.jpeg,.png,.webp,.avif">
            <img src="${slika}" class="tabela-autor-slika edit-slika-preview" style="cursor:pointer;" title="Кликни да промениш слику">
            <input type="text" class="adm-input edit-input f-ime" placeholder="Ime и презиме" value="${podaci.ime ? podaci.ime + ' ' + podaci.prezime : ''}">
        </div>

        <div class="ta-2">
            <input type="date" class="adm-input edit-input f-datum" value="${podaci.datumRodjenja || ''}">
        </div>

        <div class="ta-3">
            <select class="adm-input adm-select edit-input f-status">
                <option ${podaci.status === 'Активан' ? 'selected' : ''}>Активан</option>
                <option ${podaci.status === 'У пензији' ? 'selected' : ''}>У пензији</option>
                <option ${podaci.status === 'Преминуо' ? 'selected' : ''}>Преминуо</option>
            </select>
        </div>

        <div class="ta-4">
            <input type="number" class="adm-input edit-input f-nagrade" placeholder="нпр. 3200" value="${podaci.brojOsvojenihNagrada || ''}">
        </div>

        <div class="ta-5">
            <input type="number" class="adm-input edit-input f-primerci" placeholder="нпр. 350000000" value="${podaci.brojProdatihPrimeraka || ''}">
        </div>

        <div class="ta-6">
            <span class="stars-tabela">${formatZvezdice(prosek)}</span>
            <p class="tabela-rejting">${formatProsek(prosek)}</p>
        </div>

        <div class="ta-7">
            <input type="text" class="adm-input edit-input f-telefon" placeholder="+381 64 123-4567" value="${podaci.kontaktTelefonMenadzera || ''}">
        </div>

        <div class="ta-8">
            <button class="adm-btn-sacuvaj edit-btn btn-sacuvaj">${btnTekst}</button>
            <button class="adm-btn-otkazi edit-btn btn-otkazi">Откажи</button>
        </div>
    
    ` 

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


    biored.innerHTML = `

        <label>Биографија</label>
        <textarea class="adm-textarea f-bio" placeholder="Биографија...">${podaci.biografija || ''}</textarea>

    `;

    red.querySelector(".btn-sacuvaj").addEventListener("click", () => {

        const imeIPrezime = red.querySelector(".f-ime").value.trim().split(" ");
        const ime = imeIPrezime[0] || "";
        const prezime = imeIPrezime.slice(1).join(" ") || "";
        const datum = red.querySelector(".f-datum").value;
        const status = red.querySelector(".f-status").value;
        const nagrade = red.querySelector(".f-nagrade").value;
        const primerci = red.querySelector(".f-primerci").value;
        const telefon = red.querySelector(".f-telefon").value;
        const bio = biored.querySelector(".f-bio").value;

        if (!ime || !datum || !status || !nagrade || !primerci || !telefon || !bio) {
            // TODO
            alert("Попуните сва поља."); 
            return;
        }

        const noviPodaci = {
            ime,
            prezime,
            datumRodjenja: datum,
            status,
            brojOsvojenihNagrada: nagrade,
            brojProdatihPrimeraka: primerci,
            biografija: bio,
            kontaktTelefonMenadzera: telefon,
            slike: podaci.slike || {}
        };

        onSubmit(noviPodaci, red, biored);
    });

    red.querySelector(".btn-otkazi").addEventListener("click", () => {
        red.remove();
        biored.remove();
    });

    return { red, biored };
}






dodajBtn.addEventListener("click", () => {
    document.querySelector(".edit-row")?.remove();
    document.querySelector(".edit-row-bio")?.remove();

    const { red, biored } = napraviFormu({
        btnTekst: "Додај",
        onSubmit: async (podaci, r, b) => {
            const rezultat = await ajaxPost(
                `${firebaseUrl}/autori.json`,
                podaci
            );
            if (rezultat) {
                r.remove();
                b.remove();
                ucitajAutore();
            } else {
                alert("Грешка при додавању.");
            }
        }
    });

    tabela.appendChild(red);
    tabela.appendChild(biored);
    red.scrollIntoView({ behavior: "smooth", block: "center" });
});


tabela.addEventListener("click", async (e) => {

    const izmenaBtn = e.target.closest(".btn-izmena");
    if (!izmenaBtn) return;

    document.querySelector(".edit-row")?.remove();
    document.querySelector(".edit-row-bio")?.remove();

    const row = izmenaBtn.closest(".tabela-row");
    const id = row.dataset.id;
    const podaci = JSON.parse(row.dataset.autor);

    const oceneData = await ajaxGet(`${firebaseUrl}/ocene.json`);
    const prosek = izracunajProsek(oceneData, id);

    const { red, biored } = napraviFormu({
        btnTekst: "Сачувај",
        podaci,
        prosek,
        onSubmit: async (noviPodaci, r, b) => {
            const rezultat = await ajaxPut(
                `${firebaseUrl}/autori/${id}.json`,
                noviPodaci
            );
            if (rezultat) {
                r.remove();
                b.remove();
                ucitajAutore();
            } else {
                alert("Грешка при чувању.");
            }
        }
    });

    row.insertAdjacentElement("afterend", biored);
    row.insertAdjacentElement("afterend", red);
    red.scrollIntoView({ behavior: "smooth", block: "center" });
});



function formatPrimerci(broj) {

    if (broj >= 1000000) return (broj / 1000000).toFixed(0) + "М+";
    if (broj >= 1000) return (broj / 1000).toFixed(0) + "Х+";
    return broj + "";

}



const modalBrisanje = document.getElementById("modal-brisanje");
let idZaBrisanje = null;

tabela.addEventListener("click", (e) => {
    const obrisiBtn = e.target.closest(".btn-obrisi");
    if (!obrisiBtn) return;

    idZaBrisanje = obrisiBtn.closest(".tabela-row").dataset.id;
    modalBrisanje.classList.add("open");
});


document.getElementById("modal-brisanje-potvrdi").addEventListener("click", async () => {

    if (!idZaBrisanje) return;

    const rezultat = await ajaxDelete(`${firebaseUrl}/autori/${idZaBrisanje}.json`);

    if (rezultat !== false) {
        modalBrisanje.classList.remove("open");
        sviAutori = sviAutori.filter(a => a.id !== idZaBrisanje);
        idZaBrisanje = null;
        filtriraj()
    } else {
        alert("Грешка при брисању.");
    }
});


document.getElementById("modal-brisanje-otkazi").addEventListener("click", () => {
    modalBrisanje.classList.remove("open");
    idZaBrisanje = null;
});

document.getElementById("modal-brisanje-close").addEventListener("click", () => {
    modalBrisanje.classList.remove("open");
    idZaBrisanje = null;
});


ucitajAutore();