$(function() {

    // Selection de la station
    $('select#stations').change(function() {
        var station = $(this).children("option:selected").val();
        console.log("station : " + station);
        $('#formulaire').submit();
    });

    // affiche les photos
    $('img.icone').click(function() {
        zoom ($(this).attr('name'), 1000, 1000)
    });
});

/**
 * Zoom image.
 * This image appears in the center of the target.
 * A click makes it disappear.
 * 
**/
function zoom (src, widthTarget, heightTarget) {

   if (document.getElementById('imageZoom')) {
      var image = document.getElementById('imageZoom');
      document.body.removeChild(image);
   }
   var imageZoom = new Image();
   imageZoom.src = src;
   imageZoom.id = 'imageZoom';
   imageZoom.style.position = 'fixed';
   imageZoom.style.left = '1px';
   imageZoom.style.top = '1px';
   imageZoom.style.borderStyle = 'solid';
   imageZoom.style.borderWidth = '1px';
   imageZoom.style.padding = '5px';
//   imageZoom.style.backgroundColor = '#8aa0b3';
   imageZoom.style.backgroundColor = '#ffffff';
   imageZoom.style.display = 'none';
   imageZoom.style.zIndex = '10';
   imageZoom.setAttribute('onmouseover', 'imageZoom.style.cursor = "pointer"');
   imageZoom.setAttribute('onload', 'position(this, ' + widthTarget + ', ' + heightTarget + ')');
   document.body.appendChild(imageZoom);

   imageZoom.onMouseOver = function() {imageZoom.style.cursor = 'pointer';}
   imageZoom.onclick = function() {document.body.removeChild(imageZoom);}
}

function position (imageZoom,  widthTarget, heightTarget) {

   if (! widthTarget) {
      widthTarget = imageZoom.width;
      heightTarget = imageZoom.height;
   }
   var rapLarg = widthTarget / imageZoom.width;
   var rapHaut = heightTarget / imageZoom.height; 
   if (imageZoom.width * rapLarg > '950') {
      var rapLarg = 950 / imageZoom.width;
      var rapHaut = rapLarg;
   }
   if (imageZoom.height * rapHaut > '900') {
      var rapHaut = 900 / imageZoom.height;
      var rapLarg = rapHaut;
   }
   if (rapLarg > rapHaut) var rapLarg = rapHaut;
   else var rapHaut = rapLarg;
   widthTarget = imageZoom.width * rapLarg;
   heightTarget = imageZoom.height * rapHaut;
   imageZoom.style.width = widthTarget + "px";
   imageZoom.style.height= heightTarget + "px";
//   imageZoom.style.left = 545 - widthTarget / 2 + "px";
   imageZoom.style.left =  window.innerWidth / 2 - widthTarget / 2 + "px";
   imageZoom.style.top = 450 - heightTarget / 2 + "px";
   imageZoom.style.display = 'block';
   document.body.style.cursor = "default";
} 
