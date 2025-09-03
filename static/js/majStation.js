$(function() {

    // lecture de l'ID de la station
    $stationID = $.urlParam('stationID');
    console.log("lecture de l'état de la station: " + $stationID);
    //$("#etat.ok").attr('checked', 'checked');

    // extraction des donnees du fichier xml
    $.ajax( {
        type: 'GET',
        url: "/iriscc-anomalies/static/xml/" + $stationID + ".xml",
        dataType: 'xml',
        success: function(xml) {

            console.log("lecture du fichier " + $stationID + ".xml");
            // lit le dernier evenement
            $(xml).find('evenement').each(function () {$evenement = $(this)});

            // modifie l'etat des differents boutons radio
            if ($evenement.find('fin').text().length == 10) {
                console.log("station OK");
            } else {
                console.log($evenement.find('etat').text());
                $.each([
                    'etat',
                    'connStation',
                    'connRouteurModem',
                    'battCharg',
                    'GPSTempsg',
                    'etatSignal'
                ], function(index, value) {
                    console.log(value + " ===> " + $evenement.find(value).text());
                    if ($evenement.find(value).text() == "HS") {
                            $('#' + value + ".hs").attr('checked', 'checked');
                            $('#' + value + ".pb").attr('disabled', 'disabled');
                            $('#' + value + ".int").attr('disabled', 'disabled');
                            $('#' + value + ".ok").attr('disabled', 'disabled');
                    } else if ($evenement.find(value).text() == "Pb") {
                            $('#' + value + ".pb").attr('checked', 'checked');
                            $('#' + value + ".int").attr('disabled', 'disabled');
                            $('#' + value + ".ok").attr('disabled', 'disabled');
                    } else if ($evenement.find(value).text() == "???") {
                            $('#' + value + ".int").attr('checked', 'checked');
                            $('#' + value + ".ok").attr('disabled', 'disabled');
                    } else {
                            $('#' + value + ".ok").attr('checked', 'checked');
                    }
                })
            }
        },
        error: function(e) {
            alert("ERROR");
            console.log("XML reading Failed: ", e);
        }
    });
});

init_evenement();       // active le calendrier
pwd("CR_intervention.py");  // demande du mot de passe

if (navigator.userAgent.match(/Android/i)) {
    //document.getElementById("formulaire").innerHTML += '<input type="submit" name="valid" value="valider" class="boutons" />';
    $('#formulaire').html('<input type="submit" name="valid" value="valider" class="boutons" />');
}


$.urlParam = function(name){
    // lit les arguments de l'url
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}
