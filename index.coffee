
EventEmitter = (require 'events').EventEmitter
vkey = require 'vkey'

MAX_LINES = 999

class ConsoleWidget extends EventEmitter
  constructor: (@opts) ->
    @opts ?= {}
    @opts.widthPx ?= 500
    @opts.rows ?= 10
    @opts.lineHeightPx ?= 20
    @opts.font ?= '12pt Menlo, Courier, \'Courier New\', monospace'

    @history = []
    @historyCursor = @history.length

    @createNodes()
    @registerEvents()

  show: () ->
    @containerNode.style.visibility = ''

  hide: () ->
    @containerNode.style.visibility = 'hidden'

  open: (text=undefined) ->
    @show()
    @setInput(text) if text?
    @focusInput()

  close: () ->
    @unregisterEvents()
    @hide()

  log: (text) ->
    @logNode(document.createTextNode(text))

  logNode: (node) ->
    @outputNode.appendChild(node)
    @outputNode.appendChild(document.createElement('br'))
    @scrollOutput()
    # TODO: discard last lines
 
  focusInput: () ->
    @inputNode.focus()

  setInput: (text) ->
    @inputNode.value = text

  scrollOutput: () ->
    @outputNode.scrollByLines(MAX_LINES + 1)

  createNodes: () ->
    @containerNode = document.createElement('div')
    @containerNode.setAttribute 'style', "
    width: #{@opts.widthPx}px;
    height: #{@opts.lineHeightPx * @opts.rows}px;
    border: 1px solid white;
    color: white;
    visibility: hidden;
    bottom: 0px;
    position: absolute;
    font: #{@opts.font};
    background-image: linear-gradient(rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%);
    "

    @outputNode = document.createElement('div')
    @outputNode.setAttribute 'style', "
    overflow-y: scroll; 
    width: 100%;
    height: #{@opts.lineHeightPx * (@opts.rows - 1)}px;
    "
    # TODO: scrollbar styles for better visibility 

    @inputNode = document.createElement('input')
    @inputNode.setAttribute 'style', "
    width: 100%;
    height: #{@opts.lineHeightPx}px;
    padding: 0px;
    border: 1px dashed white;
    background-color: transparent;
    color: white;
    font: #{@opts.font};
    "

    @containerNode.appendChild(@outputNode)
    @containerNode.appendChild(@inputNode)

    document.body.appendChild(@containerNode)  # note: starts off hidden

  registerEvents: () ->
    document.body.addEventListener 'keydown', @onKeydown = (ev) =>
      key = vkey[ev.keyCode]

      if key == '<enter>'
        return if @inputNode.value.length == 0

        @history.push @inputNode.value
        @historyCursor = @history.length - 1
        @emit 'input', @inputNode.value
        @inputNode.value = ''
      else if key == '<up>'
        @inputNode.value = @history[@historyCursor] if @history[@historyCursor]?
        @historyCursor -= 1
        @historyCursor = 0 if @historyCursor < 0
        ev.preventDefault()
      else if key == '<down>'
        @inputNode.value = @history[@historyCursor] if @history[@historyCursor]?
        @historyCursor += 1
        @historyCursor = @history.length - 1 if @historyCursor > @history.length - 1
        ev.preventDefault()
      else if key == '<page-up>'
        if ev.shiftKey
          @outputNode.scrollByLines(-1)
        else if ev.ctrlKey or ev.metaKey
          @outputNode.scrollByLines(-MAX_LINES)
        else
          @outputNode.scrollByPages(-1)
      else if key == '<page-down>'
        if ev.shiftKey
          @outputNode.scrollByLines(1)
        else if ev.ctrlKey or ev.metaKey
          @outputNode.scrollByLines(MAX_LINES)
        else
          @outputNode.scrollByPages(1)
      else if key == '<escape>'
        @close()

  unregisterEvents: () ->
    document.body.removeEventListener 'keydown', @onKeydown

consoleWidget = new ConsoleWidget()

for i in [0..100]
  consoleWidget.log "hello #{i}"

consoleWidget.open('/')

consoleWidget.on 'input', (text) ->
  consoleWidget.log text

# to show transparency
document.body.style.background = 'url(http://i.imgur.com/bmm7HK4.png)'
document.body.style.backgroundSize = '100% auto'
