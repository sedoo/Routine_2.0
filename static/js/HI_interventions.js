$(function() {

    // Selection de la station
    $('select#stations').change(function() {
        var station = $(this).children("option:selected").val();
        console.log("station : " + station);
        $('#formulaire').submit();
    });

    // Affichage des commentaires
    $('.lstEvt').click(function() {
        console.log($(this).parent().css('overflow'));
        if ($(this).parent().css('overflow') == 'hidden') {
            $(this).parent().css('overflow', 'visible');
            $(this).parent().children('div').css('height', 'auto');
            $(this).html('&#9652;');
        } else {
            $(this).parent().css('overflow', 'hidden');
            $(this).parent().children('div').css('height', '30px');
            $(this).html('&#9662;');
        }
    });

    // recuperation des donnees sur gissmo
});
