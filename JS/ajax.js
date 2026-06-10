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

const firebaseUrl = "https://knjige-rs-default-rtdb.europe-west1.firebasedatabase.app";    

function ajaxPost(url, podaci) {
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
        xhttp.open("POST", url);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(podaci));
    });
}

function ajaxPut(url, podaci) {
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
        xhttp.open("PUT", url);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(podaci));
    });
}


function ajaxDelete(url) {
    return new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        };
        xhttp.open("DELETE", url);
        xhttp.send();
    });
}