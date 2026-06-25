function validirajPrijavu(korisnickoIme, lozinka) {
    const greske = [];
    const korisnickoImeRegEx = /^[a-z]+(_[a-z]+)*$/;
    const lozinkaRegEx = /^[A-Za-z0-9_!@#$%^&*.-]+$/;
    const maloSlovo = /[a-z]/;
    const broj = /[0-9]/;

    if (!korisnickoImeRegEx.test(korisnickoIme)) {
        greske.push({
            polje: "korisnicko-ime-sign-up",
            tekst: "Korisnicko ime je u formatu ilija_i."
        });
    }

    if (!lozinkaRegEx.test(lozinka) || !maloSlovo.test(lozinka) || !broj.test(lozinka)) {
        greske.push({
            polje: "lozinka-sign-up",
            tekst: "Lozinka mora biti na latinici i sadrzati malo slovo i broj."
        });
    }

    return greske;
}

function validirajRegistraciju(podaci) {
    const greske = [];

    const imeRegEx = /^[А-ЯЂЈЉЊЋЏ][а-яђјљњћџ]+$/;
    const prezimeRegEx = /^[А-ЯЂЈЉЊЋЏ][а-яђјљњћџ]+$/;
    const korisnickoImeRegEx = /^[a-z]+(_[a-z]+)*$/;
    const emailRegEx = /^[a-z][a-z0-9._-]*@(gmail|yahoo)\.com$/;
    const zanimanjeRegEx = /^[А-ЯЂЈЉЊЋЏ][а-яђјљњћџ]+(\s[А-ЯЂЈЉЊЋЏа-яђјљњћџ][а-яђјљњћџ]*)*$/;
    const adresaRegEx = /^[А-ЯЂЈЉЊЋЏ][а-яђјљњћџ]+(\s[А-ЯЂЈЉЊЋЏа-яђјљњћџ][а-яђјљњћџ]+)*\s[0-9]+,\s+[А-ЯЂЈЉЊЋЏ][а-яђјљњћџ]+(\s[А-ЯЂЈЉЊЋЏа-яђјљњћџ][а-яђјљњћџ]+)*$/;
    const lozinkaRegEx = /^[A-Za-z0-9_!@#$%^&*.-]+$/;
    const maloSlovo = /[a-z]/;
    const broj = /[0-9]/;

    if (!imeRegEx.test(podaci.ime)) {
        greske.push({
            polje: "ime",
            tekst: "Ime mora pocinjati velikim cirilicnim slovom i biti na cirilici."
        });
    }

    if (!prezimeRegEx.test(podaci.prezime)) {
        greske.push({
            polje: "prezime",
            tekst: "Prezime mora pocinjati velikim cirilicnim slovom i biti na cirilici."
        });
    }

    if (!korisnickoImeRegEx.test(podaci.korisnickoIme)) {
        greske.push({
            polje: "korisnicko-ime",
            tekst: "Korisnicko ime je u formatu ilija_i."
        });
    }

    if (!emailRegEx.test(podaci.email)) {
        greske.push({
            polje: "email",
            tekst: "Email je u formatu username@gmail.com ili username@yahoo.com."
        });
    }

    if (!podaci.datumRodjenja) {
        greske.push({
            polje: "datum-rodjenja",
            tekst: "Unesite datum rodjenja."
        });
    }

    if (!zanimanjeRegEx.test(podaci.zanimanje)) {
        greske.push({
            polje: "zanimanje",
            tekst: "Zanimanje mora poceti velikim cirilicnim slovom i biti na cirilici."
        });
    }

    if (!adresaRegEx.test(podaci.adresa)) {
        greske.push({
            polje: "adresa",
            tekst: "Adresa je u formatu Ulica broj, Grad i mora biti na cirilici."
        });
    }

    if (!lozinkaRegEx.test(podaci.lozinka) || !maloSlovo.test(podaci.lozinka) || !broj.test(podaci.lozinka)) {
        greske.push({
            polje: "lozinka",
            tekst: "Lozinka mora biti na latinici i sadrzati malo slovo i broj."
        });
    }

    return greske;
}
