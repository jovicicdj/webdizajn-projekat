async function handlePrijava(e) {
    e.preventDefault();

    if(correct){
        const korisnickoIme = document.getElementById("korisnicko-ime-sign-up").value.trim();
        const lozinka = document.getElementById("lozinka-sign-up").value;
    
        const korisnici = await ajaxGet(`${firebaseUrl}/korisnici.json`);
        if (!korisnici) {
            prikaziGresku("Greška pri povezivanju sa bazom.");
            return;
        }
    
        const pronadjen = Object.entries(korisnici).find(([id, k]) =>
            k.korisnickoIme === korisnickoIme && k.lozinka === lozinka
        );
    
        if (!pronadjen) {
            prikaziGresku("Pogrešno korisničko ime ili lozinka.");
            return;
        }
    
        const [id, korisnik] = pronadjen;
        localStorage.setItem("korisnikId", id);
        localStorage.setItem("jeAdmin", korisnik.jeAdmin ? "true" : "false");
    
        if (korisnik.jeAdmin) {
            window.location.href = "autori.html";
        } else {
            window.location.href = "profil.html";
        }
    }
    else{
        return;
    }

}

function prikaziGresku(tekst) {
    const el = document.getElementById("login-greska");
    if (el) {
        el.textContent = tekst;
        el.style.display = "block";
    }
}

function prikaziFormuRegistracija(){
        const register = document.getElementById("sign-up-forma");
        const login = document.getElementById("login-forma");

        const registerText = document.getElementById("register-text")
        const signUpText = document.getElementById("sign-up-text")

        register.style.display = "flex";
        login.style.display = "none";

        registerText.classList.add("active-hyperlink")
        signUpText.classList.remove("active-hyperlink")
    }

function prikaziFormuPrijava(){
        const register = document.getElementById("sign-up-forma");
        const login = document.getElementById("login-forma");

        const registerText = document.getElementById("register-text")
        const signUpText = document.getElementById("sign-up-text")

        register.style.display = "none";
        login.style.display = "flex";

        registerText.classList.remove("active-hyperlink")
        signUpText.classList.add("active-hyperlink")
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