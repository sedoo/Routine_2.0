$(function() {

    // affichage des evenements multiples
    $('.lstEvt').click(function() {
        if ($('.ligne_' + this.id).css('display') == 'none') {
            $('.ligne_' + this.id).css('display', 'table-row');
            $(this).html('&#9652;');
        } else {
            $('.ligne_' + this.id).css('display', 'none');
            $(this).html('&#9662;');
        }
    });
});
