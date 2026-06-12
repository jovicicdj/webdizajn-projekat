let correct = false;
document.getElementById("login-forma").addEventListener("submit", function(e){
    e.preventDefault();

    //LOG IN

    //ilija_i i ilija123
    const korisnickoImeLogIn = document.getElementById("korisnicko-ime-sign-up").value.trim();
    const lozinkaLogIn = document.getElementById("lozinka-sign-up").value.trim();

    const korisnickoImeRegEx = /^[a-z]+(_[a-z]+)*$/;
    const maloSlovo = /[a-z]/;
    // const specijalniKarakter = /_#!/;
    const broj = /[0-9]/;

    console.log("Vrednost:", JSON.stringify(korisnickoImeLogIn));
    console.log("Vrednost:", JSON.stringify(lozinkaLogIn));
    
    if(!korisnickoImeRegEx.test(korisnickoImeLogIn)){
        alert("Ispravan format imena: ilija_i ili ilija123 (maksimalna duzina 30).")
        correct = false;
        return;
    }

    if(!maloSlovo.test(lozinkaLogIn) || !broj.test(lozinkaLogIn)){
        alert("Lozinka mora da sadrzi malo slovo i broj.");
        correct = false;
        return;
    }
    correct = true;
})
    //======================================================================//

document.getElementById("sign-up-forma").addEventListener("submit", function(e){
    //SIGN UP
    const ime = document.getElementById("ime").value.trim();
    const prezime = document.getElementById("prezime").value.trim();
    const korisnckoImeSignUp = document.getElementById("korisnicko-ime").value.trim();
    const email = document.getElementById("email").value.trim();
    // const datumRodjenja = getElementById("datum-rodjenja").value.trim();
    const zanimanje = document.getElementById("zanimanje").value.trim();
    const adresa = document.getElementById("adresa").value.trim();
    const lozinkaSignUp = document.getElementById("lozinka").value.trim();

    const imeRegEx = /^[A-ZČĆŽŠĐ]/
    const prezimeRegEx = /^[A-ZČĆŽŠĐ]/
    const emailRegEx = /^[a-z]+.[a-z]+@(example|gmail|yahoo)\.com$/
    const zanimanjeRegEx = /^[A-ZČĆŽŠĐ]/
    const adresaRegEx = /^[A-ZČĆŽŠĐ][a-zčćžšđ]+(\s[A-ZČĆŽŠĐ][a-zčćžšđ]+)*\s[0-9]+,\s[A-ZČĆŽŠĐ][a-zčćžšđ]+(\s[A-ZČĆŽŠĐ][a-zčćžšđ]+)*$/

    if(!imeRegEx.test(ime)){
        alert("Ime mora pocinjati velikim slovom.")
        correct = false;
        return;
    }

    if(!prezimeRegEx.test(prezime)){
        alert("Prezime mora pocinjati velikim slovom.")
        correct = false;
        return;
    }

    if(!emailRegEx.test(email)){
        alert("Email u formatu ime.prezime@example/gmail/yahoo.com")
        correct = false;
        return;
    }

    if(!zanimanjeRegEx.test(zanimanje)){
        alert("Zanimanje mora poceti velikim slovom.")
        correct = false;
        return;
    }

    if(!adresaRegEx(adresa)){
        alert("Adresa u formatu Ulica broj, Grad")
        correct = false;
        return;
    }

    correct = true;
})

