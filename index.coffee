
containerNode = document.createElement('div')
containerNode.setAttribute 'style', '
width: 200px;
height: 100px;
border: 1px solid white;
color: black;
'

outputNode = document.createElement('div')
outputNode.setAttribute 'style', '
overflow: auto;
width: 100%;
height: 100%;
'

for i in [0..10]
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

document.body.appendChild(containerNode)
document.body.style.backgroundColor = 'black'   # to show transparency
