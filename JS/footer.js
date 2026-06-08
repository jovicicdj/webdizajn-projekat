async function ucitajFooter() {
    const [knjige, autori, ocene, korisnici] = await Promise.all([
        ajaxGet(firebaseUrl + "/knjige.json"),
        ajaxGet(firebaseUrl + "/autori.json"),
        ajaxGet(firebaseUrl + "/ocene.json"),
        ajaxGet(firebaseUrl + "/korisnici.json")
    ]);

    
    const statBrojevi = document.querySelectorAll(".footer-stat");

    statBrojevi[0].textContent = knjige ? Object.keys(knjige).length : 0;
    statBrojevi[1].textContent = autori ? Object.keys(autori).length : 0;
    statBrojevi[2].textContent = ocene ? Object.keys(ocene).length : 0;
    statBrojevi[3].textContent = korisnici ? Object.keys(korisnici).length : 0;
}

ucitajFooter();