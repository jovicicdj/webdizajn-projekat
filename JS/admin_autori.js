const tabela = document.querySelector(".tabela-autora");
const dodajBtn = document.querySelector(".adm-search-row button");
const dodajBtn1 = document.getElementById("prikazi-nagrade");

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

    renderAutore(sviAutori, false);
}




function renderAutore(lista, filterNagrade = false) {

    document.querySelectorAll(".tabela-row").forEach(r => r.remove());

    lista.forEach(({ id, autor, prosek }) => {

        if (filterNagrade && autor.brojOsvojenihNagrada <= 3) {
            return;
        }

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



// function renderAutore2(lista) {

//     document.querySelectorAll(".tabela-row").forEach(r => r.remove());

//     lista.forEach(({ id, autor, prosek }) => {

//         if (autor.brojOsvojenihNagrada <= 3) {
//             return;
//         }

//         const row = document.createElement("div");
//         row.className = "tabela-row";
//         row.dataset.id = id;
//         row.dataset.autor = JSON.stringify(autor)
//         const slika = autor.slike ? Object.values(autor.slike)[0] : "images/default.jpg";
//         const prodatihPrimeraka = formatPrimerci(autor.brojProdatihPrimeraka);

//         row.innerHTML = `

//             <div class="ta-1">
//                 <img src="${slika}" class="tabela-autor-slika" alt="${autor.ime} ${autor.prezime}">
//                 <p>${autor.ime} ${autor.prezime}</p>
//             </div>
//             <div class="ta-2"><p>${autor.datumRodjenja || '-'}</p></div>
//             <div class="ta-3"><span class="status ${statusKlasa(autor.status)}">${autor.status}</span></div>
//             <div class="ta-4"><p>${autor.brojOsvojenihNagrada || '-'}</p></div>
//             <div class="ta-5"><p>${prodatihPrimeraka}</p></div>
//             <div class="ta-6">
//                 <span class="stars-tabela">${formatZvezdice(prosek)}</span>
//                 <p class="tabela-rejting">${formatProsek(prosek)}</p>
//             </div>
//             <div class="ta-7"><p>${autor.kontaktTelefonMenadzera || '-'}</p></div>
//             <div class="ta-8">
//                 <button class="action-buttons btn-obrisi"><ion-icon name="trash"></ion-icon></button>
//                 <button class="action-buttons btn-izmena"><ion-icon name="create-outline"></ion-icon></button>
//             </div>

//         `
//         tabela.appendChild(row);

//     });
// }




function filtriraj() {
    const pretraga = searchBar.value.toLowerCase();
    const rezultat = sviAutori.filter(({ autor }) => {
        const imeIPrezime = `${autor.ime} ${autor.prezime}`.toLowerCase();
        return imeIPrezime.includes(pretraga);
    });
    renderAutore(rezultat, false);
}



searchBar.addEventListener("input", filtriraj);

// document.getElementById("prikazi-nagrade").addEventListener("click", async() => {


//     const autori = await ajaxGet(`${firebaseUrl}/autori.json`);

//     prikaziAutore = Object.values(autori).filter(a => Number(a.brojOsvojenihNagrada) > 3);

//     renderAutore(prikaziAutore);


// })




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

        ocistiGreske(red, biored);

        const imeInput = red.querySelector(".f-ime");
        const datumInput = red.querySelector(".f-datum");
        const statusInput = red.querySelector(".f-status");
        const nagradeInput = red.querySelector(".f-nagrade");
        const primerciInput = red.querySelector(".f-primerci");
        const telefonInput = red.querySelector(".f-telefon");
        const bioInput = biored.querySelector(".f-bio");

        const imeIPrezime = imeInput.value.trim().split(" ");
        const ime = imeIPrezime[0] || "";
        const prezime = imeIPrezime.slice(1).join(" ") || "";
        const datum = datumInput.value.trim();
        const status = statusInput.value.trim();
        const nagrade = nagradeInput.value.trim();
        const primerci = primerciInput.value.trim();
        const telefon = telefonInput.value.trim();
        const bio = bioInput.value.trim();
        const greske = [];
    
        const imeAutoraRegEx = /^[А-ЯЂЈЉЊЋЏ]/;
        const nagradePrimerciRegEx = /^[1-9]{1}[0-9]*$/;    
        //+381 64 222-3333
        const brojTelefonaRegEx = /^\+381\s6[0-9]{1}\s[0-9]{3}-[0-9]{4}$/;

        if (!imeInput.value.trim()) {
            dodajGresku(greske, imeInput, "Unesite ime i prezime autora.");
        } else if (!prezime) {
            dodajGresku(greske, imeInput, "Unesite i prezime autora.");
        } else if(!imeAutoraRegEx.test(imeInput.value.trim())){
            dodajGresku(greske, imeInput, "Ime i prezime autora moraju poceti velikim cirilicnim slovom i biti na cirilici.");
        }

        if (!datum) {
            dodajGresku(greske, datumInput, "Unesite datum rodjenja.");
        }

        if (!status) {
            dodajGresku(greske, statusInput, "Izaberite status autora.");
        }

        if (!nagrade) {
            dodajGresku(greske, nagradeInput, "Unesite broj nagrada.");
        } else if(!nagradePrimerciRegEx.test(nagrade)){
            dodajGresku(greske, nagradeInput, "Nagrade se unose samo pozitivnim brojevima.");
        }

        if (!primerci) {
            dodajGresku(greske, primerciInput, "Unesite broj prodatih primeraka.");
        } else if(!nagradePrimerciRegEx.test(primerci)){
            dodajGresku(greske, primerciInput, "Primerci se unose samo pozitivnim brojevima.");
        }

        if (!telefon) {
            dodajGresku(greske, telefonInput, "Unesite telefon menadzera.");
        } else if(!brojTelefonaRegEx.test(telefon)){
            dodajGresku(greske, telefonInput, "Broj telefona je u formatu +381 64 123-4567.");
        }

        if (!bio) {
            dodajGresku(greske, bioInput, "Unesite biografiju autora.");
        }

        if (greske.length > 0) {
            red.classList.add("ima-greske");
            biored.classList.add("ima-greske");
            greske.forEach(({ input, tekst }) => prikaziGresku(input, tekst));
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


dodajBtn1.addEventListener("click", async() => {
    renderAutore(sviAutori, true);
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
const btnNagrade = document.querySelector(".ta-4").addEventListener("click", () => {
    const rezultat = sviAutori.filter(({autor}) => {
        return autor.brojOsvojenihNagrada > 3;
        
    }).sort((a, b) => a.autor.brojOsvojenihNagrada - b.autor.brojOsvojenihNagrada)
    renderAutore(rezultat);
});

const btnDatumRodjenja = document.querySelector(".ta-2").addEventListener("click", () =>{
    const rezultat = sviAutori.filter(({autor}) =>{
        const datumDelovi = autor.datumRodjenja.split("-");
        const godinaRodjenja = datumDelovi[0];
        return godinaRodjenja >= 1800;
    }).sort((a, b) => a.autor.datumRodjenja.split("-")[0] - b.autor.datumRodjenja.split("-")[0]);
    renderAutore(rezultat);
})


const btnStatus = document.querySelector(".ta-3").addEventListener("click", () =>{
    const rezultat = sviAutori.filter(({autor}) => {
        return autor.status == "Активан";
    })
    renderAutore(rezultat);
})
