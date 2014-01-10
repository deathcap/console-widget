'use strict';

var consoleWidget = require('./')();
var vkey = require('vkey');

for (var i = 0; i < 100; ++i)
  consoleWidget.log('hello '+i);

consoleWidget.open('/');

consoleWidget.on('input', function(text) {
  consoleWidget.log(text);
});

document.body.addEventListener('keydown', function(ev) {
  if (consoleWidget.isOpen()) return;

  var key = vkey[ev.keyCode]
  if (key === '/') {
    ev.preventDefault();
    consoleWidget.open('/');
  } else if (key === '.') {
    ev.preventDefault();
    consoleWidget.open('.');
  } else if (key === 'T') {
    ev.preventDefault();
    consoleWidget.open();
  }
});

// to show off transparency
document.body.style.background = 'url(http://i.imgur.com/bmm7HK4.png)';
document.body.style.backgroundSize = '100% auto';

