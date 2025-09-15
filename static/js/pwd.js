//function pwd(lien) {
function pwd() {
    console.log("ENV in pwd.js:", window.ENV);

    /////////////////////////////////////////////////////////
    // verifie la presence d'un cookie
    // si le cookie n'est pas présent, envoie vers la page mot de passe
    /////////////////////////////////////////////////////////

    var lien = document.location.href;
    var hostname = window.location.host;
    //console.log(lien);
    var lstCookies = document.cookie.split(';');
    var verifCookie = "NOK";
    for(var i = 0; i < lstCookies.length; i++) {
        var cookies = lstCookies[i];

        if(cookies.indexOf("pwd=") != -1) {
            // le cookie existe
            console.log("le cookie existe: " + i + " " + cookies.indexOf("pwd=") + " " + cookies);
            verifCookie = "OK";
        }
    }

    if (verifCookie == "NOK") {
        let baseUrl = "http://" + window.location.host + "/"
        if (window.ENV.PROFILE === "prod") {
            baseUrl = "http://" + window.location.host + "/" + window.ENV.APP_NAME + "/";
        }
        console.log(baseUrl)
        var verifPWD = baseUrl + prompt("Mot de passe :", "") + ".html?lien=" + lien;
        window.location = verifPWD;
    }
}

function retour() {

    // création du cookie
    var date = new Date();
    date.setTime(date.getTime() + (5 * 24 * 3600 * 1000));
    document.cookie = "pwd = OK; expires = " + date.toGMTString() + "; path=/";
    console.log("le cookie vient d'être crée");

    // retour à la page précédente
    var pageUrl = self.location.href;
    getUrl = pageUrl.split("=");
    //self.location.href = getUrl[1];
    window.location = getUrl[1];
}
