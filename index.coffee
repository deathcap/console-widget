
outputNode = document.createElement('div')
outputNode.setAttribute 'style', '
width: 200px;
height: 100px;
overflow: auto;
border: 1px solid black'

for i in [0..10]
  outputNode.appendChild(document.createTextNode('hello'));
  outputNode.appendChild(document.createElement('br'))

document.body.appendChild(outputNode)
