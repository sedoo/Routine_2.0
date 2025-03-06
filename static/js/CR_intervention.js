$(function() {

    // Selection de la station
    $('select#stations').change(function() {
        var station = $(this).children("option:selected").val();
        console.log("station : " + station);
        $('#formulaire').submit();
    });

    // Validation du formulaire
    $('#formulaire').validate({
        rules: {
            nomIntervenant: "required",
            date: "required"
        },
        messages: {
            nomIntervenant: "Entrez le nom de la/les personne(s)",
            date: "Une date est requise"
        }
    });

    // Calcul de la prochaine date de maintenance
    $("#boutons_ent1").click(function() {
        var d = new Date;
        var nDate = `${d.getFullYear() + 1}.${("0" + (d.getMonth() + 1)).slice(-2)}.${("0" + d.getDate()).slice(-2)}`;
        console.log(nDate);
        $("#dateEnt").val(nDate);
    });

    $("#boutons_ent2").click(function() {
        var d = new Date;
        var nDate = `${d.getFullYear() + 2}.${("0" + (d.getMonth() + 1)).slice(-2)}.${("0" + d.getDate()).slice(-2)}`;
        console.log(nDate);
        $("#dateEnt").val(nDate);
    });

    // Ajoute une nouvelle ligne de pieces jointes
    $('body').on('change', 'input[type="file"]', function () {
        $("#piecesJointes").append('<input type="file" name="photos"  multiple />');
        $("#piecesJointes").append('<br />');
    });
});

init_evenement();       // active le calendrier
pwd("CR_intervention.py");
if (navigator.userAgent.match(/Android/i)) {
    document.getElementById("formulaire").innerHTML += '<input type="submit" name="valid" value="valider" class="boutons" />';
}
