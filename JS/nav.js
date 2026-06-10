function azurirajNav() {
    const korisnikId = localStorage.getItem("korisnikId");
    const jeAdmin = localStorage.getItem("jeAdmin") === "true";

    const navLinks = document.querySelector(".header-center ul");
    const headerRight = document.querySelector(".header-right");
    if (!navLinks) return;

    const liKnjige = `<li><a href="index.html" class="inactive-page">Књиге</a></li>`;
    const liAutori = `<li><a href="autori.html" class="inactive-page">Аутори</a></li>`;
    const liKnjigeAdmin = `<li><a href="knjige-admin.html" class="inactive-page">Књиге админ</a></li>`;
    const liAutoriAdmin = `<li><a href="admin_autori.html" class="inactive-page">Аутори админ</a></li>`;
    const liProfilLogin = `<li><a href="login.html" class="inactive-page">Мој профил</a></li>`;
    const liProfil = `<li><a href="profil.html" class="inactive-page">Мој профил</a></li>`;
    
    const liNavButtons = `<li class="nav-buttons"><button class="button login" onclick="window.location='login.html?forma=prijava'">Пријава</button><button class="button register" onclick="window.location='login.html?forma=registracija'">Регистрација</button></li>`;

    if (!korisnikId) {
        navLinks.innerHTML = liKnjige + liAutori + liProfilLogin + liNavButtons;
        headerRight.innerHTML = `
            <button class="button login" onclick="window.location='login.html?forma=prijava'">Пријава</button>
            <button class="button register" onclick="window.location='login.html?forma=registracija'">Регистрација</button>
        `;

    } else if (jeAdmin) {
        navLinks.innerHTML = liKnjige + liAutori + liKnjigeAdmin + liAutoriAdmin;
        headerRight.innerHTML = `<button class="button login" onclick="odjava()">Одјава</button>`;

    } else {
        navLinks.innerHTML = liKnjige + liAutori + liProfil;
        headerRight.innerHTML = `<button class="button login" onclick="odjava()">Одјава</button>`;
        
    }

    if (korisnikId) {
        const hamburger = document.querySelector(".hamburger");
        if (hamburger && !document.querySelector(".hamburger-odjava")) {
            const btn = document.createElement("button");
            btn.className = "button login hamburger-odjava";
            btn.textContent = "Одјава";
            btn.onclick = odjava;
            hamburger.parentNode.insertBefore(btn, hamburger);
        }
    }
    
}

function odjava() {
    localStorage.removeItem("korisnikId");
    localStorage.removeItem("jeAdmin");
    window.location.href = "index.html";
}

// Ako nije ulogovan i pokusa da ode na profil, preusmeri na login
function proveriProfil() {
    if (!localStorage.getItem("korisnikId")) {
        window.location.href = "login.html";
    }
}



function označiAktivnuStranu() {
    const trenutnaStrana = window.location.pathname.split("/").pop();
    const linkovi = document.querySelectorAll(".header-center ul a");
    linkovi.forEach(link => {
        const href = link.getAttribute("href");
        if (href === trenutnaStrana) {
            link.classList.remove("inactive-page");
            link.classList.add("active-page");
        }
    });
}

azurirajNav();
označiAktivnuStranu();