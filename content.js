$(document).ready(function() {
  /*
     CONTANTS
   */
  var DEBUG = false;

  // chrome.extension.sendRequest({ greeting: "hello"}, function(response) {
  //   console.log(response.farewell);
  // });

  log = function(message){
    console.log(message);
  }
  var
  totalElements = 0,
  totalSentences,
  randomSentence,
  randomNumbers = [],
  elements = [],
  numberOfSentences = 10,
  rootNode,
  domWalker,
  blockElements = [],
  textElements = [],
  elementsToTranslate = []
  ;
  /*
      FIXME
   */
  var blockLevelElements = [
    "blockquote", "div", "body",
    "dl", "fieldset", "h1", "h2", "h3", "h4", "h5", "h6",
    "ol", "p", "dd", "dt", "li", "td", "tfoot",
    "th", "thead"
];

  rootNode = document.body;
  domWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, null, false);
  if (DEBUG){
    // log("domWalker.currentNode = " + domWalker.currentNode);
  }
  while (domWalker.nextNode()){
    // Only looks for block level elements
    if (isBlockLevel(domWalker.currentNode)){
      var hasBlockElement = false;
      if (DEBUG){
        // log(domWalker.currentNode.nodeName);
      }
      // Check if has block level elements child
      if (domWalker.currentNode.childElementCount == 0){
        // No element children.
        // textElements.push(domWalker.currentNode.firstChild);
      } else{
        var childNodes = domWalker.currentNode.children;
        for (i = 0, len = childNodes.length; i < len; i++){
          var el = childNodes[i];
          if (isBlockLevel(el)){
            hasBlockElement = true;
          }
        }
      }
      if (! hasBlockElement){
        blockElements.push(domWalker.currentNode);
      }
    }

  }
  if (DEBUG){
    log("blockElements.length = " + blockElements.length);
    // log(blockElements);
  }

  domWalker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
  var s;
  while (domWalker.nextNode()){
    // Only enter if parentNode is not a block level element
    if (! (isBlockLevel(domWalker.currentNode.parentNode) ) ){
      s = domWalker.currentNode.textContent.trim();
      if (!(s == 0)){
        domWalker.currentNode.textContent = s;
        textElements.push(domWalker.currentNode);
      }
    }
  }
  if (DEBUG){
    log("textElements.length = " + textElements.length);
    // log(textElements);
  }

  // Loop through blockElements array adding elements to be translated

  totalSentences = (blockElements.length + 1) / numberOfSentences;
  totalSentences = Math.round(totalSentences);

  if (DEBUG){
    log("totalSentences = " + totalSentences);
  }

  // for (var i = 0, len = blockElements.length; i < len; i++){
  //   var el = blockElements[i];
  //   // Check if has any children
  //   if (el.childElementCount == 0){
  //     var elTextContent = '';
  //     domWalker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  //     while (domWalker.nextNode()){
  //       elTextContent = elTextContent + domWalker.currentNode.textContent;
  //     }
  //     el.textContent = elTextContent;
  //     elementsToTranslate.push(el);
  //   } else {
  //     if (isBlockLevel(el)){
  //       // Handle block level
  //     } else {
  //       //

  //     }
  //   }
  // }
  // if (DEBUG){
  //   log("textElements.length = " + textElements.length);
  //   log(textElements);
  // }

  // blockElements[2].textContent = "Filipe";

  // log("totalElements = " + totalElements);

  // totalSentences = totalElements / numberOfSentences;
  totalElements = blockElements.length + 1;
  totalSentences = Math.round(totalSentences);
  // log("totalSentences = " + totalSentences);

  for (i = 0; i < totalSentences; i++){
    var randomNumber = Math.floor(Math.random() * totalElements);
    var r = $.inArray(randomNumber, randomNumbers);
    if (r > -1){
      i--;
    } else {
      randomNumbers[i] = randomNumber;
    }
  }

  if (DEBUG){
    // log("randomNumbers = " + randomNumbers);
  }

  $.each(randomNumbers, function(i, random){
    var el = blockElements[random];
    elementsToTranslate[i] = el;
    if (DEBUG){
      $(blockElements[random]).addClass('to-translate').css('background', 'yellow');
    }
  });

  if (DEBUG){
    var els = $('.to-translate');
    if (! (els.length = 1)){
      if (DEBUG){
        log("Not enough elements to be translated");
      }
    }
  }

  // chrome.extension.sendRequest({'data' : elementsToTranslate.length});
  // chrome.extension.sendRequest({greeting: 'hello'}, function(response){
  //   console.log(response.farewell);
  // });
  $.each(elementsToTranslate, function(i, el){
    if (DEBUG){
      log("el => " + el.nodeName);
    }
    chrome.extension.sendRequest({sentence: el.textContent}, function(response){
      if (DEBUG){
        log("response.sentence" + response.sentence);
      }
    })
  })
  if (elementsToTranslate){
    chrome.extension.sendRequest(elementsToTranslate);
    // chrome.extension.sendRequest({'data' : elementsToTranslate.length});
  }

  // $.each(elementsToTranslate, function(i, el){
  //   // var textContent = el.textContent;
  //   var data = {'sentence' : data};
  //   if (DEBUG){
  //     log('el => ' + el.nodeName);
  //     log(el.textContent);
  //   }
  //   chrome.extension.sendRequest(data, function(response) {
  //     if (DEBUG){
  //       log("Data sent => " + data);
  //     }
  //   });
  // })

  function isBlockLevel(el) {
    var r = $.inArray(el.nodeName.toLowerCase(), blockLevelElements);
    if (r > -1){
      return true;
    } else {
      return false;
    }
  }

});

// Check whether element is block or not
function getElementDefaultDisplay(tag) {
  var cStyle,
  t = document.createElement(tag),
  gcs = "getComputedStyle" in window;
  document.body.appendChild(t);
  cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display;
  document.body.removeChild(t);
  return cStyle;
}

// Recursive function to walk the DOM - via Douglas Crockford
var walkTheDom = function (node, func){
  func(node);
  node = node.firstChild;
  while (node){
    walkTheDom(node, func);
    node = node.nextSibling;
  }
}
