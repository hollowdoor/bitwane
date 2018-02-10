bitwane
===

Logging with styles, and formatting for node, and most browsers.

Install
---

`npm install bitwane`

Usage
---

```javascript
import { Logger } from 'bitwane';
const logger = new Logger();
//Format the output
logger.log('The %(value) is big.', {value: 'moon'});
logger.log('The $(red)moon$() is red');
logger.log('The $(green:red)moon$() is green, and red.');
logger.log('The $(green:magenta underline)moon$() is green, magenta, and underlined.')
```
You should see something like this:

![Terminal output image!](/images/preview1.png "Terminal output image!")

```javascript
//indent the output
const indent = 4;
logger.log('This should be indented', null, indent);
```

The syntax for string formatting is `%(property)`.

The syntax for styles is `$(foreground:background other text styles separated by spaces)`.

This syntax `$()` clears styles.

`foreground` is the foreground color, and `background` is a background color.

Colors (foreground, and background) supported by bitwane:

* black
* red
* green
* yellow
* blue
* magenta
* cyan
* white

Other supported styles:

* bright
* dim
* underline

The API of a bitwane Logger instance
---------

* logger.log()
* logger.error()
* logger.info()
* logger.warn()

All of the above have the same usage `logger.method(string, object)`. The object is optional.

## logger.list(obj, options)

`logger.list()` prints an object, or array as a formatted list.

```javascript
logger.list({
    one: 'one',
    two: 'two',
    three: 'three'
});

logger.list([
    'one',
    'two',
    'three'
]);
//With options
logger.list([
    'one',
    'two',
    'three'
], {
    //The logging type/A method on this object
    type:'log',
    //Indent the list
    indent: 0,
    //Repeat sep (default = 1)
    extra: 1,
    //sep separates the property/index from the value
    //(default = ' ')
    sep: ' ',
    //A dot after the index of a list array
    //(default = '.')
    dot: '.',
    //Alter each index, and value
    //right before logging.
    every(index, val){
        return index + val;
    }
});
```

## logger.tree()

Print an object using `logger.tree(object)`.

You can also indent the object using `logger.tree(object, number)`.

The `object` you pass can be any javascript value.

Objects, and arrays passed to `logger.tree()` are formatted for easy reading.

## There are also two experimental methods.

* logger.ok()
* logger.notok()

The constructor
---------

```javascript
const logger = new Logger({
    //How much should each indent be.
    //The default is 2
    indentLength: 2,
    //Add a symbol prefix while in a terminal
    prefix: true, //default false,
    each(value){ //default null
        //value is the formatted log input
        //without styles
    }
});
```

### The every() method

The `every` constructor method can be used to intercept input values, and alter them. It is optional.

Use the `output()` method to finally print the input value. If the `output()` method isn't called nothing will be printed.

```javascript
const logger = new Logger({
    every(type, input, format, indent){
        this.output(type, input, format, indent);
    }
});
```

About
---

`bitwane` only accepts styles that are available for both the terminal, and browser.

This way a module author can have formatting without worrying too much about their logs working every where. Low color resolution for terminals was chosen as the baseline for maximum compatibility.

Some styles like blink, reverse, or hidden have not been added as the code for such a feature would significantly slow down logging.

`bitwane` is also meant to be fast. For the majority of coding avoiding premature optimization is probably a good thing. It's viable to make sure helper libraries are fast though. Especially for testing.

Happy coding!
