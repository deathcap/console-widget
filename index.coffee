
EventEmitter = (require 'events').EventEmitter

MAX_LINES = 999

class ConsoleWidget extends EventEmitter
  constructor: (@opts) ->
    @opts ?= {}
    @opts.consoleHeight ?= 100
    @opts.consoleWidth ?= 200

    @createNodes()
    @registerEvents()

  show: () ->
    @containerNode.style.visibility = ''

  hide: () ->
    @containerNode.style.visibility = 'hidden'

  focusInput: () ->
    @inputNode.focus()

  setInput: (text) ->
    @inputNode.value = text

  open: (text=undefined) ->
    @show()
    @setInput(text) if text?
    @focusInput()

  log: (text) ->
    @logNode(document.createTextNode(text))

  logNode: (node) ->
    @outputNode.appendChild(node)
    @outputNode.appendChild(document.createElement('br'))
    @scrollOutput()
    # TODO: discard last lines
  
  scrollOutput: () ->
    @outputNode.scrollByLines(MAX_LINES + 1)

  createNodes: () ->
    @containerNode = document.createElement('div')
    @containerNode.setAttribute 'style', "
    width: #{@opts.consoleWidth}px;
    height: #{@opts.consoleHeight}px;
    border: 1px solid white;
    color: white;
    visibility: hidden;
    bottom: 0px;
    position: absolute;
    "

    @outputNode = document.createElement('div')
    @outputNode.setAttribute 'style', '
    overflow-y: scroll; 
    width: 100%;
    height: 80%;
    '
    # TODO: scrollbar styles for better visibility 

    @inputNode = document.createElement('input')
    @inputNode.setAttribute 'style', '
    width: 100%;
    height: 20px;
    padding: 0px;
    border: 1px dashed white;
    background-color: transparent;
    color: white;
    '

    @containerNode.appendChild(@outputNode)
    @containerNode.appendChild(@inputNode)

    document.body.appendChild(@containerNode)  # note: starts off hidden

  registerEvents: () ->
    document.body.addEventListener 'keydown', @onKeydown = (ev) =>
      return if ev.keyCode != 13

      @emit 'input', @inputNode.value
      @inputNode.value = ''

  unregisterEvents: () ->
    document.body.removeEventListener 'keydown', @onKeydown

consoleWidget = new ConsoleWidget()

for i in [0..10]
  consoleWidget.log "hello #{i}"

consoleWidget.open('/')

consoleWidget.on 'input', (text) ->
  consoleWidget.log text

# to show transparency
document.body.style.background = 'url(http://i.imgur.com/bmm7HK4.png)'
document.body.style.backgroundSize = '100% auto'
