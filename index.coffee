
EventEmitter = (require 'events').EventEmitter

MAX_LINES = 999

class ConsoleWidget extends EventEmitter
  constructor: () ->
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
    @containerNode.setAttribute 'style', '
    width: 200px;
    height: 100px;
    border: 1px solid white;
    color: white;
    visibility: hidden;
    '

    @outputNode = document.createElement('div')
    @outputNode.setAttribute 'style', '
    overflow-y: scroll; /* TODO: scrollbar styles for better visibility */
    width: 100%;
    height: 100%;
    '

    @inputNode = document.createElement('input')
    @inputNode.setAttribute 'style', '
    width: 100%;
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

document.body.style.backgroundColor = 'black'   # to show transparency
