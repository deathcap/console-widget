# console-widget

An interactive console control widget for your webpage

![screenshot](http://i.imgur.com/9hKpjRQ.png "Screenshot")

Interactive demo at [http://deathcap.github.io/console-widget](http://deathcap.github.io/console-widget) (or run `npm start`)

## Usage

    var consoleWidget = require('console-widget')();

    consoleWidget.open();

You can write text to the console output using:

    consoleWidget.log('hello');
    // or add arbitrary DOM nodes using logNode() instead

and handle user input by listening to the 'input' event:

    consoleWidget.on('input', function(text) {
        consoleWidget.log('You wrote: ' + text);
    });


## License

MIT

