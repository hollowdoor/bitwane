bitwane
===

Styles, and formatting for node, and most browsers.

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
logger.log('The $(green:magenta underscore)moon$() is green, magenta, and underlined.')
```
You should see something like this:

![Alt text](/images/preview1.png "Preview 1")

The syntax for string formatting is `%(property)`.

The syntax for styles is `$(foreground:background other text styles separated by spaces)`.

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

About
---

`bitwane` only accepts styles that are available for both the terminal, and browser.

This way a module author can have formatting without worrying too much about their logs working every where. Low color resolution for terminals was chosen as the baseline for maximum compatibility.

Some styles like blink, reverse, or hidden have not been added as the code for such a feature would significantly slow down logging.

`bitwane` is also meant to be fast. For the majority of coding avoiding premature optimization is probably a good thing. It's viable to make sure helper libraries are fast though. Especially for testing.

Happy coding!
