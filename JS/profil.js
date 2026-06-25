proveriProfil();

function profilFormatDatum(datum) {
    if (!datum) return "-";

    const delovi = datum.split("-");
    if (delovi.length !== 3) return datum;

    return `${delovi[2]}.${delovi[1]}.${delovi[0]}.`;
}

function profilFormatZvezdice(vrednost) {
    const ocena = Math.max(0, Math.min(5, Math.round(Number(vrednost) || 0)));
    return "\u2605".repeat(ocena) + "\u2606".repeat(5 - ocena);
}

function prikaziPraznuListu(container, tekst) {
    container.innerHTML = "";

    const p = document.createElement("p");
    p.style.color = "#888";
    p.style.fontSize = "0.85em";
    p.textContent = tekst;
    container.appendChild(p);
}


function renderRecenzijeKorisnika(recenzije, knjigeData) {
    const container = document.getElementById("recenzije-profil");
    if (!container) return;

    container.innerHTML = "";

    if (recenzije.length === 0) {
        prikaziPraznuListu(container, "Nema recenzija.");
        return;
    }

    recenzije.forEach(({ recenzija }) => {
        const knjiga = knjigeData?.[recenzija.idKnjige];
        const nazivKnjige = knjiga?.naziv || "Nepoznata knjiga";

        const card = document.createElement("div");
        card.className = "recenzija-profil-kartica";

        card.innerHTML = `
            <div class="recenzija-profil-kartica-right">
                <p class="recenzija-knjiga-ime"></p>
                <p class="recenzija-knjiga-sadrzaj"></p>
                <a class="recenzija-knjiga-hiperlink"></a>
            </div>

            <div class="recenzija-profil-kartica-left">
                <p class="recenzije-knjiga-datum"></p>
            </div>
        `;

        card.querySelector(".recenzija-knjiga-ime").textContent = nazivKnjige;
        card.querySelector(".recenzija-knjiga-sadrzaj").textContent = recenzija.tekst || "Bez teksta recenzije.";

        const link = card.querySelector(".recenzija-knjiga-hiperlink");
        link.textContent = "\u2192 Link do knjige";
        link.href = recenzija.idKnjige ? `pojedinacna.html?id=${recenzija.idKnjige}` : "#";

        card.querySelector(".recenzije-knjiga-datum").textContent =
            profilFormatDatum(recenzija.datum);

        container.appendChild(card);
    });
}

function renderOceneKorisnika(ocene, autoriData) {
    const container = document.getElementById("ocene-profil");
    if (!container) return;

    container.innerHTML = "";

    if (ocene.length === 0) {
        prikaziPraznuListu(container, "Nema ocena.");
        return;
    }

    ocene.forEach(({ ocena }) => {
        const autor = autoriData?.[ocena.idAutora];
        const imeAutora = autor ? `${autor.ime} ${autor.prezime}` : "Nepoznat autor";

        const card = document.createElement("div");
        card.className = "ocene-kartica";

        card.innerHTML = `
            <div class="ocena-kartica-levo">
                <p class="ocena-autora-ime"></p>
                <p class="ocena-autora-zvezdice"></p>
                <a class="ocena-autora-link"></a>
            </div>

            <div class="ocena-kartica-desno">
                <p class="datum-ocenjivanja"></p>
            </div>
        `;

        card.querySelector(".ocena-autora-ime").textContent = imeAutora;
        card.querySelector(".ocena-autora-zvezdice").textContent =
            profilFormatZvezdice(ocena.vrednost);

        const link = card.querySelector(".ocena-autora-link");
        link.textContent = "\u2192 Pogledaj profil autora";
        link.href = ocena.idAutora ? `pojedinacan_autor.html?id=${ocena.idAutora}` : "#";

        card.querySelector(".datum-ocenjivanja").textContent =
            profilFormatDatum(ocena.datum);

        container.appendChild(card);
    });
}


async function ucitajProfil() {
    const korisnikId = localStorage.getItem("korisnikId");

    const [korisnik, oceneData, recenzijeData, knjigeData, autoriData] = await Promise.all([
        ajaxGet(`${firebaseUrl}/korisnici/${korisnikId}.json`),
        ajaxGet(`${firebaseUrl}/ocene.json`),
        ajaxGet(`${firebaseUrl}/recenzije.json`),
        ajaxGet(`${firebaseUrl}/knjige.json`),
        ajaxGet(`${firebaseUrl}/autori.json`)
    ]);

    if (!korisnik) return;

    const profilnaImg = document.querySelector(".profil-info img");
    const inicijal = (korisnik.ime || "?")[0].toUpperCase();
    profilnaImg.style.display = "none";
    const inicialDiv = document.createElement("div");
    inicialDiv.className = "profil-inicijal";
    inicialDiv.textContent = inicijal;
    profilnaImg.parentNode.insertBefore(inicialDiv, profilnaImg);

    document.querySelector(".profil-ime").textContent = `${korisnik.ime} ${korisnik.prezime}`;
    document.querySelector(".profil-email").textContent = `${korisnik.email}`;

    document.querySelector(".ime-vrednost").textContent = korisnik.ime || "-";
    document.querySelector(".prezime-vrednost").textContent = korisnik.prezime || "-";
    document.querySelector(".username-vrednost").textContent = korisnik.korisnickoIme || "-";
    document.querySelector(".email-vrednost").textContent = korisnik.email || "-";
    document.querySelector(".adresa-vrednost").textContent = korisnik.adresa || "-";
    document.querySelector(".datum-vrednost").textContent = korisnik.datumRodjenja || "-";
    document.querySelector(".zanimanje-vrednost").textContent = korisnik.zanimanje || "-";

    const oceneKorisnika = oceneData
        ? Object.entries(oceneData)
            .filter(([id, ocena]) => ocena.idKorisnika === korisnikId)
            .map(([id, ocena]) => ({ id, ocena }))
        : [];

    const recenzijeKorisnika = recenzijeData
        ? Object.entries(recenzijeData)
            .filter(([id, recenzija]) => recenzija.idKorisnika === korisnikId)
            .map(([id, recenzija]) => ({ id, recenzija }))
        : [];

    const brojOcena = oceneKorisnika.length;
    const brojRecenzija = recenzijeKorisnika.length;

    document.querySelectorAll(".statistika-vrednost")[1].textContent = brojOcena;
    document.getElementById("p2").textContent = `Moje ocene (${brojOcena})`;

    document.querySelectorAll(".statistika-vrednost")[0].textContent = brojRecenzija;
    document.getElementById("p1").textContent = `Moje recenzije (${brojRecenzija})`;

    renderRecenzijeKorisnika(recenzijeKorisnika, knjigeData || {});
    renderOceneKorisnika(oceneKorisnika, autoriData || {});

    const prosekOcena = brojOcena
        ? oceneKorisnika.reduce((suma, { ocena }) => suma + Number(ocena.vrednost || 0), 0) / brojOcena
        : 0;

    const footerProsek = document.querySelector(".footer-card-profil-value");
    if (footerProsek) {
        footerProsek.textContent = prosekOcena ? `${prosekOcena.toFixed(1)} \u2605` : "-";
    }

    prikaziNajomiljenijegAutora(oceneKorisnika, autoriData || {});
}


// function prikaziNajomiljenijegAutora(oceneKorisnika, autoriData) {
//     const footerKartice = document.querySelectorAll(".footer-card-profil");
//     const kartica = footerKartice[1];
//     if (!kartica) return;

//     const najomiljenijiAutor = pronadjiNajomiljenijegAutora(oceneKorisnika, autoriData);
//     const stat = kartica.querySelector(".footer-card-profil-stat");
//     const vrednost = kartica.querySelector(".footer-card-profil-value");
//     const dodatak = kartica.querySelector(".footer-card-profil-dodatak");

//     stat.textContent = "NAJOMILJENIJI AUTOR";
//     vrednost.innerHTML = "";

//     if (!najomiljenijiAutor) {
//         vrednost.textContent = "-";
//         dodatak.textContent = "Nema ocena";
//         return;
//     }

//     const [autor, ocena] = najomiljenijiAutor;
//     const autorInfo = document.createElement("span");
//     autorInfo.className = "footer-autor-info";

//     const slika = document.createElement("img");
//     slika.className = "footer-autor-slika";
//     slika.src = getSlikaAutora(autor);
//     slika.alt = `${autor.ime} ${autor.prezime}`;

//     const ime = document.createElement("span");
//     ime.textContent = `${autor.ime} ${autor.prezime}`;

//     autorInfo.appendChild(slika);
//     autorInfo.appendChild(ime);
//     vrednost.appendChild(autorInfo);
//     dodatak.textContent = `${ocena} \u2605`;
// }

// function getSlikaAutora(autor) {
//     if (Array.isArray(autor.slike)) return autor.slike[0];
//     if (autor.slike) return Object.values(autor.slike)[0];
//     return "images/default.jpg";
// }

// function vremeOcene(datum) {
//     if (!datum) return 0;

//     const vreme = new Date(datum).getTime();
//     return isNaN(vreme) ? 0 : vreme;
// }

// function pronadjiNajomiljenijegAutora(ocene, autoriData) {
//     const autoriIOcene = ocene
//         .map(({ ocena }) => {
//             const autor = autoriData?.[ocena.idAutora];
//             return autor ? [autor, Number(ocena.vrednost || 0), ocena.datum] : null;
//         })
//         .filter(par => par !== null);

//     let najboljiPar = null;

//     autoriIOcene.forEach(([autor, ocena, datum]) => {
//         if (
//             !najboljiPar ||
//             ocena > najboljiPar[1] ||
//             (ocena === najboljiPar[1] && vremeOcene(datum) < vremeOcene(najboljiPar[2]))
//         ) {
//             najboljiPar = [autor, ocena, datum];
//         }
//     });

//     return najboljiPar;
// }


ucitajProfil();
