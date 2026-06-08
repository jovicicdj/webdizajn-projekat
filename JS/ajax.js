function ajaxGet(url) {
    return new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    resolve(null);
                }
            }
        };
        xhttp.open("GET", url);
        xhttp.send();
    });
}

const firebaseUrl = "https://knjige-rs-default-rtdb.europe-west1.firebasedatabase.app/";    