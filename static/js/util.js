/**
* Returns an XMLHttp instance to use for asynchronous
* downloading. This method will never throw an exception, but will
* return NULL if the browser does not support XmlHttp for any reason.
* @return {XMLHttpRequest|Null}
*/
function createXmlHttpRequest() {
 try {
   if (typeof ActiveXObject != 'undefined') {
     return new ActiveXObject('Microsoft.XMLHTTP');
   } else if (window["XMLHttpRequest"]) {
     return new XMLHttpRequest();
   }
 } catch (e) {
   changeStatus(e);
 }
 return null;
};

/**
* This functions wraps XMLHttpRequest open/send function.
* It lets you specify a URL and will call the callback if
* it gets a status code of 200.
* @param {String} url The URL to retrieve
* @param {Function} callback The function to call once retrieved.
*/
function downloadUrl(url, callback) {
 var status = -1;
 var request = createXmlHttpRequest();
 if (!request) {
   return false;
 }

 request.onreadystatechange = function() {
   if (request.readyState == 4) {
     try {
       status = request.status;
     } catch (e) {
       // Usually indicates request timed out in FF.
     }
     if (status == 200) {
       callback(request.responseXML, request.status);
       request.onreadystatechange = function() {};
     }
   }
 }
 
request.open('GET', url, true);
 try {
   request.send(null);
 } catch (e) {
   changeStatus(e);
 }
};

/**
 * Parses the given XML string and returns the parsed document in a
 * DOM data structure. This function will return an empty DOM node if
 * XML parsing is not supported in this browser.
 * @param {string} str XML string.
 * @return {Element|Document} DOM.
 */
function xmlParse(str) {
  if (typeof ActiveXObject != 'undefined' && typeof GetObject != 'undefined') {
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.loadXML(str);
    return doc;
  }

  if (typeof DOMParser != 'undefined') {
    return (new DOMParser()).parseFromString(str, 'text/xml');
  }

  return createElement('div', null);
}

/**
 * Appends a JavaScript file to the page.
 * @param {string} url
 */
function downloadScript(url) {
  var script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
}

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

function delay( ms ){
	var end = new Date().getTime() + ms;
	while ( end > new Date().getTime() );
};
