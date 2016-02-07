(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
var ConsoleWidget, EventEmitter, MAX_LINES, vkey,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = (require('events')).EventEmitter;

vkey = require('vkey');

MAX_LINES = 999;

ConsoleWidget = (function(_super) {
  __extends(ConsoleWidget, _super);

  function ConsoleWidget(opts) {
    var _base, _base1, _base2, _base3, _base4, _base5, _base6;
    this.opts = opts;
    if (this.opts == null) {
      this.opts = {};
    }
    if ((_base = this.opts).widthPx == null) {
      _base.widthPx = 500;
    }
    if ((_base1 = this.opts).rows == null) {
      _base1.rows = 10;
    }
    if ((_base2 = this.opts).lineHeightPx == null) {
      _base2.lineHeightPx = 20;
    }
    if ((_base3 = this.opts).font == null) {
      _base3.font = '12pt Menlo, Courier, \'Courier New\', monospace';
    }
    if ((_base4 = this.opts).backgroundImage == null) {
      _base4.backgroundImage = 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 100%)';
    }
    if ((_base5 = this.opts).closeKeys == null) {
      _base5.closeKeys = ['<escape>'];
    }
    if ((_base6 = this.opts).hideTimeout == null) {
      _base6.hideTimeout = 5000;
    }
    this.history = [];
    this.historyCursor = this.history.length;
    this.hideTimer = void 0;
    this.createNodes();
  }

  ConsoleWidget.prototype.show = function() {
    this.containerNode.style.visibility = '';
    this.containerNode.style.transition = '';
    this.containerNode.style.opacity = 1.0;
    if (this.hideTimer != null) {
      return clearTimeout(this.hideTimer);
    }
  };

  ConsoleWidget.prototype.hide = function() {
    return this.containerNode.style.visibility = 'hidden';
  };

  ConsoleWidget.prototype.open = function(text) {
    if (text == null) {
      text = void 0;
    }
    this.show();
    if (text != null) {
      this.setInput(text);
    }
    this.registerEvents();
    return this.focusInput();
  };

  ConsoleWidget.prototype.close = function() {
    this.unregisterEvents();
    return this.hide();
  };

  ConsoleWidget.prototype.isOpen = function() {
    return this.isShown();
  };

  ConsoleWidget.prototype.isShown = function() {
    return this.containerNode.style.visibility !== 'hidden' && this.containerNode.style.opacity | 0 !== 0;
  };

  ConsoleWidget.prototype.log = function(text) {
    return this.logNode(document.createTextNode(text));
  };

  ConsoleWidget.prototype.logNode = function(node) {
    if (!this.isShown()) {
      this.show();
      this.hideTimer = setTimeout(this.fadeOut.bind(this), this.opts.hideTimeout);
    }
    this.outputNode.appendChild(node);
    this.outputNode.appendChild(document.createElement('br'));
    return this.scrollOutput();
  };

  ConsoleWidget.prototype.fadeOut = function() {
    this.containerNode.style.transition = 'opacity linear 1s';
    return this.containerNode.style.opacity = 0.0;
  };

  ConsoleWidget.prototype.focusInput = function() {
    return this.inputNode.focus();
  };

  ConsoleWidget.prototype.setInput = function(text) {
    this.inputNode.value = text;
    return this.inputNode.setSelectionRange(text.length, text.length);
  };

  ConsoleWidget.prototype.scrollOutput = function() {
    return this.outputNode.scrollTop = this.outputNode.scrollHeight;
  };

  ConsoleWidget.prototype.createNodes = function() {
    this.containerNode = document.createElement('div');
    this.containerNode.setAttribute('style', "width: " + this.opts.widthPx + "px; height: " + (this.opts.lineHeightPx * this.opts.rows) + "px; border: 1px solid white; color: white; visibility: hidden; bottom: 0px; position: absolute; font: " + this.opts.font + "; background-image: " + this.opts.backgroundImage + ";");
    this.outputNode = document.createElement('div');
    this.outputNode.setAttribute('style', "overflow-y: scroll; width: 100%; height: " + (this.opts.lineHeightPx * (this.opts.rows - 1)) + "px;");
    this.inputNode = document.createElement('input');
    this.inputNode.setAttribute('style', "width: 100%; height: " + this.opts.lineHeightPx + "px; padding: 0px; border: 1px dashed white; background-color: transparent; color: white; font: " + this.opts.font + ";");
    this.containerNode.appendChild(this.outputNode);
    this.containerNode.appendChild(this.inputNode);
    return document.body.appendChild(this.containerNode);
  };

  ConsoleWidget.prototype.registerEvents = function() {
    return document.body.addEventListener('keydown', this.onKeydown = (function(_this) {
      return function(ev) {
        var key, preventDefault, _base, _base1, _base2, _base3, _base4, _base5, _base6, _base7;
        key = vkey[ev.keyCode];
        preventDefault = true;
        if (key === '<enter>') {
          if (_this.inputNode.value.length === 0) {
            return;
          }
          _this.history.push(_this.inputNode.value);
          _this.historyCursor = _this.history.length - 1;
          _this.emit('input', _this.inputNode.value);
          _this.inputNode.value = '';
        } else if (key === '<up>') {
          if (ev.shiftKey) {
            if (typeof (_base = _this.outputNode).scrollByLines === "function") {
              _base.scrollByLines(-1);
            }
          } else {
            if (_this.history[_this.historyCursor] != null) {
              _this.inputNode.value = _this.history[_this.historyCursor];
            }
            _this.historyCursor -= 1;
            if (_this.historyCursor < 0) {
              _this.historyCursor = 0;
            }
          }
        } else if (key === '<down>') {
          if (ev.shiftKey) {
            if (typeof (_base1 = _this.outputNode).scrollByLines === "function") {
              _base1.scrollByLines(1);
            }
          } else {
            if (_this.history[_this.historyCursor] != null) {
              _this.inputNode.value = _this.history[_this.historyCursor];
            }
            _this.historyCursor += 1;
            if (_this.historyCursor > _this.history.length - 1) {
              _this.historyCursor = _this.history.length - 1;
            }
          }
        } else if (key === '<page-up>') {
          if (ev.shiftKey) {
            if (typeof (_base2 = _this.outputNode).scrollByLines === "function") {
              _base2.scrollByLines(-1);
            }
          } else if (ev.ctrlKey || ev.metaKey) {
            if (typeof (_base3 = _this.outputNode).scrollByLines === "function") {
              _base3.scrollByLines(-MAX_LINES);
            }
          } else {
            if (typeof (_base4 = _this.outputNode).scrollByPages === "function") {
              _base4.scrollByPages(-1);
            }
          }
        } else if (key === '<page-down>') {
          if (ev.shiftKey) {
            if (typeof (_base5 = _this.outputNode).scrollByLines === "function") {
              _base5.scrollByLines(1);
            }
          } else if (ev.ctrlKey || ev.metaKey) {
            if (typeof (_base6 = _this.outputNode).scrollByLines === "function") {
              _base6.scrollByLines(MAX_LINES);
            }
          } else {
            if (typeof (_base7 = _this.outputNode).scrollByPages === "function") {
              _base7.scrollByPages(1);
            }
          }
        } else if (_this.opts.closeKeys.indexOf(key) !== -1) {
          _this.close();
        } else {
          preventDefault = false;
        }
        if (preventDefault) {
          return ev.preventDefault();
        }
      };
    })(this));
  };

  ConsoleWidget.prototype.unregisterEvents = function() {
    return document.body.removeEventListener('keydown', this.onKeydown);
  };

  return ConsoleWidget;

})(EventEmitter);

module.exports = function(opts) {
  return new ConsoleWidget(opts);
};

},{"events":1,"vkey":4}],3:[function(require,module,exports){
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


},{"./":2,"vkey":4}],4:[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}]},{},[3]);
