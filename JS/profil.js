proveriProfil();

async function ucitajProfil() {


    const korisnikId = localStorage.getItem("korisnikId");

    const [korisnik, oceneData] = await Promise.all([
        ajaxGet(`${firebaseUrl}/korisnici/${korisnikId}.json`),
        ajaxGet(`${firebaseUrl}/ocene.json`)
    ]);

    if (!korisnik) return;

    // Profilna - prvo slovo imena
    const profilnaImg = document.querySelector(".profil-info img");
    const inicijal = (korisnik.ime || "?")[0].toUpperCase();
    profilnaImg.style.display = "none";
    const inicialDiv = document.createElement("div");
    inicialDiv.className = "profil-inicijal";
    inicialDiv.textContent = inicijal;
    profilnaImg.parentNode.insertBefore(inicialDiv, profilnaImg);

    document.querySelector(".profil-ime").textContent = `${korisnik.ime} ${korisnik.prezime}`;
    document.querySelector(".profil-email").textContent = `${korisnik.email}`;  

    // Detaljne info
    document.querySelector(".ime-vrednost").textContent = korisnik.ime || "-";
    document.querySelector(".prezime-vrednost").textContent = korisnik.prezime || "-";
    document.querySelector(".username-vrednost").textContent = korisnik.korisnickoIme || "-";
    document.querySelector(".email-vrednost").textContent = korisnik.email || "-";
    document.querySelector(".adresa-vrednost").textContent = korisnik.adresa || "-";
    document.querySelector(".datum-vrednost").textContent = korisnik.datumRodjenja || "-";
    document.querySelector(".zanimanje-vrednost").textContent = korisnik.zanimanje || "-";

    let brojOcena = 0;
    if (oceneData) {
        Object.values(oceneData).forEach(ocena => {
            if (ocena.idKorisnika === korisnikId) brojOcena++;
        });
    }
    document.querySelectorAll(".statistika-vrednost")[1].textContent = brojOcena;
    document.getElementById("p2").textContent = `Моје оцене (${brojOcena})`;


    const recenzijeData = await ajaxGet(`${firebaseUrl}/recenzije.json`);
    let brojRecenzija = 0;
    if (recenzijeData) {
        Object.values(recenzijeData).forEach(r => {
            if (r.idKorisnika === korisnikId) brojRecenzija++;
        });
    }
    document.querySelectorAll(".statistika-vrednost")[0].textContent = brojRecenzija;
    document.getElementById("p1").textContent = `Моје рецензије (${brojRecenzija})`;
}

ucitajProfil();