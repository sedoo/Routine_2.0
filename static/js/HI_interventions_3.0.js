function gissmo2xml(callback) {
    //////////////////////////////////////////////////
    // Lance le script python gissmo2xml.py
    // Ce script devra être accompagné d'un argument GET contenant le numéro Gissmoo de la station
    //////////////////////////////////////////////////

    var org_objet = this;
    //var nGissmo = station.xml.getElementsByTagName("gissmo")[0].getAttribute("n");
    var nGissmo = station.xml.getElementsByTagName("nom")[0].firstChild.data;
    console.log("lecture du fichier sur Gissmo pour " + nGissmo);
    var xhr_object = new XMLHttpRequest();
    xhr_object.open('GET', "./gissmo2xml.py?n=" + nGissmo, true);
    xhr_object.onreadystatechange = function () {
        if (xhr_object.readyState == 4 && (xhr_object.status == 200 || xhr_object.status == 0)) {
            console.log("fichier temp.xml rempli");
            callback();
        } else {
            console.log("extraction des données dans temp.xml");
        }
    }
    xhr_object.send(null);
}


function verifLignes() {
    var lignes = document.getElementById('tableau').rows;
    var ligne;
    var resultat;

    for (var i = 0; i < lignes.length; i++) {
        if (typeof lignes[i].getElementsByClassName("Commentaires")[0] != "undefined" && lignes[i].getElementsByClassName("Commentaires")[0].firstChild != null) {
            var text = lignes[i].getElementsByClassName("Commentaires")[0].firstChild.nodeValue;
            lignes[i].getElementsByClassName("Commentaires")[0].innerHTML = '<div>' + text + '</div>';
        }
        if (lignes[i].clientHeight > 20 && lignes[i].getElementsByTagName('div').length == 1) {
            lignes[i].getElementsByTagName('div')[0].style.height = 20 + 'px';
            lignes[i].getElementsByTagName('div')[0].innerHTML = '<div class="fleche" onclick="afficheTxt(' + i + ')"><img src="./images/navigate_close.png" title="afficher tous les commentaires de cette intervention"/></div>' + lignes[i].getElementsByTagName('div')[0].innerHTML;
        }
    }
}

function afficheTxt(i) {
    var lignes = document.getElementById('tableau').rows;

    if (/open/.test(lignes[i].getElementsByTagName('img')[0].src)) {
        lignes[i].getElementsByTagName('div')[0].style.height = 30 + 'px';
        lignes[i].getElementsByTagName('img')[0].src = './images/navigate_close.png';
    }
    else {
        lignes[i].getElementsByTagName('div')[0].style.height = 'auto';
        lignes[i].getElementsByTagName('img')[0].src = './images/navigate_open.png';
    }
}

function affichePb(obj) {
    var xml = obj;

    // liste des evenements
    var lstEvt = xml.getElementsByTagName('evenement');

    // tableau des evenements
    var tableEvt = [];
    for (var i = 0; i < lstEvt.length; i++) {
        if (typeof lstEvt[i].getElementsByTagName('description')[0] !== 'undefined') {
            console.log(lstEvt[i].getAttribute('idEvt') + " => " + lstEvt[i].getElementsByTagName('description')[0].firstChild.nodeValue);
            tableEvt[lstEvt[i].getAttribute('idEvt')] = lstEvt[i].getElementsByTagName('description')[0].firstChild.nodeValue;
            tableEvt[lstEvt[i].getAttribute('idEvt')] = lstEvt[i].getElementsByTagName('description')[0].firstChild.nodeValue;
        } else {
            tableEvt[lstEvt[i].getAttribute('idEvt')] = "&nbsp;";
        }
    }

    // liste des problèmes
    var lstPb = document.getElementsByClassName('Problème');
    console.log(lstPb);

    // affichage des problèmes
    for (var i = 0; i < lstPb.length; i++) {
        if (typeof tableEvt[lstPb[i].firstChild.nodeValue] != "undefined") {
            lstPb[i].firstChild.nodeValue = tableEvt[lstPb[i].firstChild.nodeValue];
        }
    }

    // resolu?
    var lstRes = document.getElementsByClassName('Résolu');
    for (var i = 0; i < lstRes.length; i++) {
        if (lstRes[i].firstChild.nodeValue != "") {
            lstRes[i].firstChild.nodeValue = "X";
        };
    }
}
