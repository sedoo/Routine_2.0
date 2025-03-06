function affEvt(_obj, _sta) {
    var obj = _obj;
    var sta = _sta;
    lignesEvt = document.getElementsByClassName('ligne_' + sta);
    for (i = 1; i < lignesEvt.length; i++) {
        if (lignesEvt[i].style.display == 'none') {
            lignesEvt[i].style.display = 'table-row';
            obj.innerHTML = '&#9652;';
        }
        else {
            lignesEvt[i].style.display = 'none';
            obj.innerHTML = '&#9662;';
        }
    }
}


function modifEvt(_evt) {
    var evt = _evt;
    alert("coucou");
}
//    alert('ligne_' + sta);
//    document.getElementsByClassName('ligne_' + sta).style.display = "block";
