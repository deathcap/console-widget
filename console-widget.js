'use strict';

const EventEmitter = require('events').EventEmitter;
const vkey = require('vkey');

const MAX_LINES = 999;

class ConsoleWidget extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = opts; 
    if (!this.opts) this.opts = {};
    if (this.opts.widthPx === undefined) this.opts.widthPx = 500;
    if (this.opts.rows === undefined) this.opts.rows = 10;
    if (this.opts.lineHeightPx === undefined) this.opts.lineHeightPx = 20;
    if (this.opts.font === undefined) this.opts.font = '12pt Menlo, Courier, \'Courier New\', monospace';
    if (this.opts.backgroundImage === undefined) this.opts.backgroundImage = 'linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.6) 100%)';
    if (this.opts.closeKeys === undefined) this.opts.closeKeys = ['<escape>'];
    if (this.opts.hideTimeout === undefined) this.opts.hideTimeout = 5000; // ms

    this.history = [];
    this.historyCursor = this.history.length;

    this.hideTimer = undefined;

    this.createNodes();
  }

  show() {
    this.containerNode.style.visibility = '';
    this.containerNode.style.transition = '';
    this.containerNode.style.opacity = 1.0;
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }

  hide() {
    this.containerNode.style.visibility = 'hidden';
  }

  open(text) {
    this.show();
    if (text !== undefined) {
      this.setInput(text);
    }
    this.registerEvents();
    this.focusInput();
  }

  close() {
    this.unregisterEvents();
    this.hide();
  }

  isOpen() {
    return this.isShown();
  }

  isShown() {
    return this.containerNode.style.visibility !== 'hidden' && this.containerNode.style.opacity|0 !== 0;
  }

  log(text) {
    this.logNode(document.createTextNode(text));
  }

  logNode(node) {
    if (!this.isShown()) {
      // if logged without shown, show then hide after a time interval
      this.show();
      this.hideTimer = setTimeout(this.fadeOut.bind(this), this.opts.hideTimeout);
    }

    this.outputNode.appendChild(node);
    this.outputNode.appendChild(document.createElement('br'));
    this.scrollOutput();
    // TODO: discard last lines
  }

  fadeOut() {
    this.containerNode.style.transition = 'opacity linear 1s'; // TODO: add/remove CSS class instead of adding/removing style directly
    this.containerNode.style.opacity = 0.0;
  }
 
  focusInput() {
    this.inputNode.focus();
  }

  setInput(text) {
    this.inputNode.value = text;
    this.inputNode.setSelectionRange(text.length, text.length);
  }

  scrollOutput() {
    //this.outputNode.scrollByLines?(MAX_LINES + 1); // nonstandard
    // Scroll to very end (scrollHeight will be greater than scrollTop)
    this.outputNode.scrollTop = this.outputNode.scrollHeight;
  }

  createNodes() {
    this.containerNode = document.createElement('div');
    this.containerNode.setAttribute('style', `
    width: ${this.opts.widthPx}px;
    height: ${this.opts.lineHeightPx * this.opts.rows}px;
    border: 1px solid white;
    color: white;
    visibility: hidden;
    bottom: 0px;
    position: absolute;
    font: ${this.opts.font};
    background-image: ${this.opts.backgroundImage};
    `);

    this.outputNode = document.createElement('div');
    this.outputNode.setAttribute('style', `
    overflow-y: scroll; 
    width: 100%;
    height: ${this.opts.lineHeightPx * (this.opts.rows - 1)}px;
    `);
    // TODO: scrollbar styles for better visibility 

    this.inputNode = document.createElement('input');
    this.inputNode.setAttribute('style', `
    width: 100%;
    height: ${this.opts.lineHeightPx}px;
    padding: 0px;
    border: 1px dashed white;
    background-color: transparent;
    color: white;
    font: ${this.opts.font};
    `);

    this.containerNode.appendChild(this.outputNode);
    this.containerNode.appendChild(this.inputNode);

    document.body.appendChild(this.containerNode);  // note: starts off hidden
  }

  registerEvents() {
    document.body.addEventListener('keydown', this.onKeydown = (ev) => {
      const key = vkey[ev.keyCode];

      let preventDefault = true;

      if (key === '<enter>') {
        if (this.inputNode.value.length === 0) return;

        this.history.push(this.inputNode.value);
        this.historyCursor = this.history.length - 1;
        this.emit('input', this.inputNode.value);
        this.inputNode.value = '';
      } else if (key === '<up>') {
        if (ev.shiftKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(-1);
        } else {
          if (this.history[this.historyCursor] !== undefined) this.inputNode.value = this.history[this.historyCursor];
          this.historyCursor -= 1;
          if (this.historyCursor < 0) this.historyCursor = 0;
        }
      } else if (key === '<down>') {
        if (ev.shiftKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(1);
        } else {
          if (this.history[this.historyCursor] !== undefined) this.inputNode.value = this.history[this.historyCursor];
          this.historyCursor += 1;
          if (this.historyCursor > this.history.length - 1) this.historyCursor = this.history.length - 1;
        }
      } else if (key === '<page-up>') {
        if (ev.shiftKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(-1);
        } else if (ev.ctrlKey || ev.metaKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(-MAX_LINES);
        } else {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByPages(-1);
        }
      } else if (key === '<page-down>') {
        if (ev.shiftKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(1);
        } else if (ev.ctrlKey || ev.metaKey) {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByLines(MAX_LINES);
        } else {
          if (this.outputNode.scrollByLines) this.outputNode.scrollByPages(1);
        }
      } else if (this.opts.closeKeys.indexOf(key) !== -1) {
        this.close();
      } else {
        // let unrecognized keys pass through
        preventDefault = false;
      }

      if (preventDefault) ev.preventDefault();
    });
  }

  unregisterEvents() {
    document.body.removeEventListener('keydown', this.onKeydown);
  }
}

module.exports = (opts) => new ConsoleWidget(opts);
