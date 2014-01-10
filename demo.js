'use strict';

var consoleWidget = require('./')();
var vkey = require('vkey');

// to create a scrollback buffer
for (var i = 0; i < 100; ++i)
  consoleWidget.log('hello '+i);

var lines = [
  'Welcome to the console-widget demonstration!',
  'Recall history with the up/down arrow keys',
  'And try pgup/pgdn (+shift/cmd) to scroll',
  'Press escape to close, and / . or T to open',
  ];
lines.forEach(function(line) {
  consoleWidget.log(line);
});

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

