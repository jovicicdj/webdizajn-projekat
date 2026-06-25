async function handlePrijava(e) {
    e.preventDefault();

    const forma = document.getElementById("login-forma");
    ocistiGreske(forma);

    const korisnickoIme = document.getElementById("korisnicko-ime-sign-up").value.trim();
    const lozinka = document.getElementById("lozinka-sign-up").value;
    const greske = validirajPrijavu(korisnickoIme, lozinka);

    if (greske.length > 0) {
        prikaziGreske(forma, greske);
        prikaziGresku("Ispravite podatke za prijavu.");
        return;
    }

    const korisnici = await ajaxGet(`${firebaseUrl}/korisnici.json`);
    if (!korisnici) {
        prikaziGresku("Greska pri povezivanju sa bazom.");
        return;
    }

    const pronadjen = Object.entries(korisnici).find(([id, k]) =>
        k.korisnickoIme === korisnickoIme && k.lozinka === lozinka
    );

    if (!pronadjen) {
        prikaziGresku("Pogresno korisnicko ime ili lozinka.");
        return;
    }

    const [id, korisnik] = pronadjen;
    localStorage.setItem("korisnikId", id);
    localStorage.setItem("jeAdmin", korisnik.jeAdmin ? "true" : "false");

    if (korisnik.jeAdmin) {
        window.location.href = "index.html";
    } else {
        window.location.href = "profil.html";
    }
}

async function handleRegistracija(e) {
    e.preventDefault();

    const forma = document.getElementById("sign-up-forma");
    ocistiGreske(forma);

    const podaci = {
        adresa: document.getElementById("adresa").value.trim(),
        datumRodjenja: document.getElementById("datum-rodjenja").value,
        email: document.getElementById("email").value.trim(),
        ime: document.getElementById("ime").value.trim(),
        prezime: document.getElementById("prezime").value.trim(),
        korisnickoIme: document.getElementById("korisnicko-ime").value.trim(),
        lozinka: document.getElementById("lozinka").value.trim(),
        zanimanje: document.getElementById("zanimanje").value.trim(),
        jeAdmin: false
    };

    const greske = validirajRegistraciju(podaci);

    if (greske.length > 0) {
        prikaziGreske(forma, greske);
        return;
    }

    const korisnici = await ajaxGet(`${firebaseUrl}/korisnici.json`);
    const korisnickoImePostoji = Object.values(korisnici || {}).some(korisnik => {
        return korisnik.korisnickoIme === podaci.korisnickoIme;
    });

    if (korisnickoImePostoji) {
        prikaziGreske(forma, [{
            polje: "korisnicko-ime",
            tekst: "Korisnicko ime je vec zauzeto."
        }]);
        return;
    }

    const noviKorisnikId = napraviSledeciKorisnikId(korisnici || {});
    const rezultat = await ajaxPut(`${firebaseUrl}/korisnici/${noviKorisnikId}.json`, podaci);
    if (!rezultat) {
        prikaziGreske(forma, [{
            polje: "korisnicko-ime",
            tekst: "Greska pri registraciji korisnika."
        }]);
        return;
    }

    localStorage.setItem("korisnikId", noviKorisnikId);
    localStorage.setItem("jeAdmin", "false");
    window.location.href = "profil.html";
}

function napraviSledeciKorisnikId(korisnici) {
    const najveciBroj = Object.keys(korisnici).reduce((max, id) => {
        if (id === "kor001") return max;

        const poklapanje = id.match(/^kor(\d+)$/);
        if (!poklapanje) return max;

        return Math.max(max, Number(poklapanje[1]));
    }, 1);

    return `kor${String(najveciBroj + 1).padStart(3, "0")}`;
}

function prikaziGresku(tekst) {
    const el = document.getElementById("login-greska");
    if (el) {
        el.textContent = tekst;
        el.style.display = "block";
    }
}

function ocistiGreske(forma) {
    forma.querySelectorAll(".login-greska-polje").forEach(greska => greska.remove());
    forma.querySelectorAll(".input-greska").forEach(input => input.classList.remove("input-greska"));

    const loginGreska = document.getElementById("login-greska");
    if (loginGreska) {
        loginGreska.textContent = "";
        loginGreska.style.display = "none";
    }
}

function prikaziGreske(forma, greske) {
    greske.forEach(({ polje, tekst }) => {
        const input = forma.querySelector(`#${polje}`);
        if (!input) return;

        input.classList.add("input-greska");

        const greska = document.createElement("p");
        greska.className = "login-greska-polje";
        greska.textContent = tekst;
        input.insertAdjacentElement("afterend", greska);
    });
}

function prikaziFormuRegistracija(){
    const register = document.getElementById("sign-up-forma");
    const login = document.getElementById("login-forma");

    const registerText = document.getElementById("register-text");
    const signUpText = document.getElementById("sign-up-text");

    ocistiGreske(register);
    ocistiGreske(login);

    register.style.display = "flex";
    login.style.display = "none";

    registerText.classList.add("active-hyperlink");
    signUpText.classList.remove("active-hyperlink");
}

function prikaziFormuPrijava(){
    const register = document.getElementById("sign-up-forma");
    const login = document.getElementById("login-forma");

    const registerText = document.getElementById("register-text");
    const signUpText = document.getElementById("sign-up-text");

    ocistiGreske(register);
    ocistiGreske(login);

    register.style.display = "none";
    login.style.display = "flex";

    registerText.classList.remove("active-hyperlink");
    signUpText.classList.add("active-hyperlink");
}

document.querySelector(".login-hiperlink").addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
});

const params = new URLSearchParams(window.location.search);
const forma = params.get("forma");
if (forma === "prijava") prikaziFormuPrijava();
else prikaziFormuRegistracija();

document.getElementById("login-forma").addEventListener("submit", handlePrijava);
document.getElementById("sign-up-forma").addEventListener("submit", handleRegistracija);
