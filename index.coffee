
EventEmitter = (require 'events').EventEmitter

class ConsoleWidget extends EventEmitter
  constructor: () ->
    @createNodes()
    @registerEvents()

  createNodes: () ->
    @containerNode = document.createElement('div')
    @containerNode.setAttribute 'style', '
    width: 200px;
    height: 100px;
    border: 1px solid white;
    color: black;
    '

    @outputNode = document.createElement('div')
    @outputNode.setAttribute 'style', '
    overflow-y: scroll; /* TODO: scrollbar styles for better visibility */
    width: 100%;
    height: 100%;
    color: white;
    '

    for i in [0..3]
      @outputNode.appendChild(document.createTextNode('hello'))
      @outputNode.appendChild(document.createElement('br'))

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

  log: (text) ->
    @outputNode.appendChild(document.createTextNode(text))
    @outputNode.appendChild(document.createElement('br'))
    # TODO: on log, auto-scroll down, discard last lines

  registerEvents: () ->
    document.body.addEventListener 'keydown', @onKeydown = (ev) =>
      return if ev.keyCode != 13

      @emit 'input', @inputNode.value
      @inputNode.value = ''

  unregisterEvents: () ->
    document.body.removeEventListener 'keydown', @onKeydown

consoleWidget = new ConsoleWidget()

consoleWidget.on 'input', (text) ->
  consoleWidget.log text

document.body.appendChild(consoleWidget.containerNode)
document.body.style.backgroundColor = 'black'   # to show transparency
