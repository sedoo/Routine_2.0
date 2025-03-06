function ajax2xml(callback) {
//////////////////////////////////////////////////
//// Extraction des données xml
////     chargement : état du chargement des données
////     xml : données xml
////     callback : fonction de retour après la lecture des données
///////////////////////////////////////////////////

    console.log("lecture du fichier xml");

    var org_objet = this;
    var xhr_object = null;
    xhr_object = new XMLHttpRequest();
    xhr_object.open('GET', org_objet.url, true);
    xhr_object.onreadystatechange = function () {
        if (xhr_object.readyState == 4 && (xhr_object.status == 200 || xhr_object.status == 0)) {
            console.log("fichier xml OK");
            org_objet.xml = xhr_object.responseXML;
            callback();
        } else {
            console.log("chargement du fichier");
        }
    }
    xhr_object.send(null);
}

function Tableau(id, obj) {
////////////////////////////////////////////////////////////////////
//    Creation d'un tableau HTML à partir d'une variable contenant
//    un tableau XML.
//    id : nom du tableau
//    obj : objet contenant le fichier xml
//
//    exemple d'une ligne xml :
//        <test toto=titi>tutu</test>
//        <sous_test sous_toto=tata>
//            <test>toutou</test>
//        </sous_test>
//    
//    Transformer la ligne xml en tableau html :
//        objet.colonnes = [
//            ["cellule affichant titi", ["", "toto"]],
//            ["cellule affichant tutu", "test"],
//            ["cellule affichant tata", ["sous_test" ,["", "sous_toto"]]],
//            ["cellule affichant toutou", ["sous_test", "test"]]
//        ]
//        objet.premLigne();    -> Crée une ligne th
//        objet.addLigne();     -> Crée une ligne tr
//
//    Résultat HTML contenu dans l'objet "objet.data" :
//    <th>
//        <td>cellule affichant titi</td>
//        <td>cellule affichant tutu</td>
//        <td>cellule affichant tata</td>
//        <td>cellule affichant toutou</toutou>
//    </th>
//    <tr>
//        <td>titi</td>
//        <td>tutu</td>
//        <td>tata</td>
//        <td>toutou</td>
//    </tr>
//////////////////////////////////////////////////////////////

    var table = document.createElement("table");
    table.id = id;
    table.className = "texte";
    this.test = "test";
    this.nbLignes = 0;
    this.lignes = [];
    this.colonnes = [];
    this.xml = obj;


    Tableau.prototype.premLigne = function () {
        // creation de la premiere ligne du tableau
        var trData = document.createElement("tr");
        for (var i=0; i < this.colonnes.length; i++) {
            var thData = document.createElement("th");
            thData.appendChild(document.createTextNode(this.colonnes[i][0]));
            trData.appendChild(thData);
        }
        table.appendChild(trData);
    }

    Tableau.prototype.addLignes = function (tag) {
        // creation des autres ligne du tableau
        var elements = this.xml.getElementsByTagName(tag);
        var elementsTries = new Array();
        for(var i=0; i <= elements.length; i++) {
            elementsTries[i-1] = elements[elements.length-i];
        }
        elements = elementsTries;

        console.log("tableau de " + elements.length + " ligne(s)");
        for (var i=0; i < elements.length; i++) {
            var trData = document.createElement("tr");
            var ntrDatas = [];
            for (var j=0; j < this.colonnes.length; j++) {
                console.log("colonne n°: " + j + " => " + this.colonnes[j][0]);
                var tdData = document.createElement("td");
                tdData.className = this.colonnes[j][0];
                if (typeof this.colonnes[j][1] == "object" && this.colonnes[j][1][0] == "") {
                    tdData.appendChild(document.createTextNode(elements[i].getAttribute(this.colonnes[j][1][1])));
                } else if (typeof this.colonnes[j][1] == "object") {
                    for (var k=0; k < trData.getElementsByTagName("td").length; k++) {
                        var nLignes = elements[i].getElementsByTagName(this.colonnes[j][1][0]).length;
                        if (typeof trData.getElementsByTagName("td")[k].getAttribute("rowspan") == "object") {
                            trData.getElementsByTagName("td")[k].setAttribute("rowspan", nLignes);
                        }
                    }
                    var nElement = elements[i].getElementsByTagName(this.colonnes[j][1][0])[0];
                    var contenu = document.createTextNode("");
//                    if (typeof this.colonnes[j][1][1] == "object") {
                    if (typeof this.colonnes[j][1][1] == "object" && typeof nElement != "undefined") {
                        contenu = document.createTextNode(nElement.getAttribute(this.colonnes[j][1][1][1]));
//                    } else {
                    } else if (typeof nElement != "undefined") {
                        if (typeof nElement.getElementsByTagName(this.colonnes[j][1][1])[0] != "undefined") {
                            contenu = document.createTextNode(nElement.getElementsByTagName(this.colonnes[j][1][1])[0].firstChild.nodeValue);
                        }
                    }
                    tdData.appendChild(contenu);
                    tdData.setAttribute("rowspan", "1");
                    for (var k=0; k < elements[i].getElementsByTagName(this.colonnes[j][1][0]).length; k++) {
                        if (typeof ntrDatas[k] == "undefined") {
                            // si plusieurs noeuds fils
                            ntrDatas[k] = document.createElement("tr");
                        }
                        var ntdData = document.createElement("td");
                        ntdData.className = this.colonnes[j][0];
                        var nElement = elements[i].getElementsByTagName(this.colonnes[j][1][0])[k];
                        var contenu = document.createTextNode("");
                        if (typeof this.colonnes[j][1][1] == "object") {
                            contenu = document.createTextNode(nElement.getAttribute(this.colonnes[j][1][1][1]));
                        } else {
                            if (typeof nElement.getElementsByTagName(this.colonnes[j][1][1])[0] != "undefined") {
                                contenu = document.createTextNode(nElement.getElementsByTagName(this.colonnes[j][1][1])[0].firstChild.nodeValue);
                            }
                        }
                        ntdData.appendChild(contenu);
                        ntrDatas[k].appendChild(ntdData);
                    }
                } else {
                    if (typeof elements[i].getElementsByTagName(this.colonnes[j][1])[0] != "undefined" && elements[i].getElementsByTagName(this.colonnes[j][1])[0].parentNode.tagName == tag) {
                        tdData.appendChild(document.createTextNode(elements[i].getElementsByTagName(this.colonnes[j][1])[0].firstChild.nodeValue));
                    }
                }
                trData.appendChild(tdData);
            }
            table.appendChild(trData);
            table.id = "tableau";
            for (var j=1; j< ntrDatas.length; j++) {table.appendChild(ntrDatas[j]);}
        }
    }

    this.data = table;
}

