
containerNode = document.createElement('div')
containerNode.setAttribute 'style', '
width: 200px;
height: 100px;
border: 1px solid white;
color: black;
'

outputNode = document.createElement('div')
outputNode.setAttribute 'style', '
overflow-y: scroll;
width: 100%;
height: 100%;
color: white;
'

for i in [0..3]
  outputNode.appendChild(document.createTextNode('hello'))
  outputNode.appendChild(document.createElement('br'))

inputNode = document.createElement('input')
inputNode.setAttribute 'style', '
width: 100%;
padding: 0px;
border: 1px dashed white;
background-color: transparent;
color: white;
'

containerNode.appendChild(outputNode)
containerNode.appendChild(inputNode)

document.body.addEventListener 'keydown', (ev) ->
  return if ev.keyCode != 13

  outputNode.appendChild(document.createTextNode(inputNode.value))
  outputNode.appendChild(document.createElement('br'))
  # TODO: on log, auto-scroll down, discard last lines
  # TODO: on input, emit event

  inputNode.value = ''

document.body.appendChild(containerNode)
document.body.style.backgroundColor = 'black'   # to show transparency
