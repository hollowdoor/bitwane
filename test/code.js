(function () {
'use strict';

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var arguments$1 = arguments;

	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments$1[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

//Supposedly faster for v8 than just Object.create(null)
function Raw(){}
Raw.prototype = (function (){
    //Maybe some old browser has risen from it's grave
    if(typeof Object.create !== 'function'){
        var temp = new Object();
        temp.__proto__ = null;
        return temp;
    }

    return Object.create(null);
})();

function rawObject(){
    var arguments$1 = arguments;

    var objects = [], len = arguments.length;
    while ( len-- ) { objects[ len ] = arguments$1[ len ]; }

    var raw = new Raw();
    objectAssign.apply(void 0, [ raw ].concat( objects ));
    return raw;
}

var IN_BROWSER = new Function("try {return this===window;}catch(e){ return false;}")();

var DEBUG = (function (){
    if(IN_BROWSER){
        if(/(^[?]|&)DEBUG=(1|true)/.test(window.location.search + '')){
            return true;
        }

        var html =  document
        .getElementsByTagName('html');
        if(!html) { return false; }
        html = html[0];
        if(html.hasAttribute('data-debug')){
            return html.getAttribute('data-debug');
        }
        return false;
    }
    return !!process.env['DEBUG'] &&
    (process.env['DEBUG'] === 1 || process.env['DEBUG'] === 'true');
})();

var SUPPORTS_SYMBOLS = IN_BROWSER || (process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');

var TERM_SUPPORTS_COLOR = (function (){
    if(IN_BROWSER) { return false; }
    var supports = require('supports-color');
    return supports.stdout.hasBasic;
})();

var logSymbols = SUPPORTS_SYMBOLS ?
//Based on https://github.com/sindresorhus/log-symbols
rawObject({
        info: "$(blue)ℹ$()",
        success: "$(green)✔$()",
        warning: "$(yellow)⚠$()",
        error: "$(red)✖$()"
})
: rawObect({
    info: "$(blue)i$()",
    success: "$(green)√$()",
    warning: "$(yellow)‼$()",
    error: "$(red)×$()"
});

var allowedColors = rawObject({
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    white: 7
});

var allowedStyles = rawObject({
    bright: 1,
    dim: 2,
    underline: 4,
    //Not sure if these should be used
    //blink: 5,
    //reverse: 7,
    //hidden: 8
});

var reset = IN_BROWSER ? '' : "\u001b[0m";
var fgcodes = rawObject({reset: reset});
var bgcodes = rawObject({reset: reset});
var styleCodes = rawObject({reset: reset});

if(!IN_BROWSER && TERM_SUPPORTS_COLOR){
    //Set terminal colors
    Object.keys(allowedColors).forEach(function (color){
        fgcodes[color] = "\u001b[3" + (allowedColors[color]) + "m";
        bgcodes[color] = "\u001b[4" + (allowedColors[color]) + "m";
    });

    Object.keys(allowedStyles).forEach(function (style){
        styleCodes[style] = "\u001b[" + (allowedStyles[style]) + "m";
    });
}else if(!TERM_SUPPORTS_COLOR){
    Object.keys(allowedColors).forEach(function (color){
        fgcodes[color] = "";
        bgcodes[color] = "";
    });

    Object.keys(allowedStyles).forEach(function (style){
        styleCodes[style] = "";
    });
}

var cssStrings = !IN_BROWSER ? null
: rawObject({
    bright: 'font-weight: bold;',
    dim: 'font-weight: ligher;',
    underline: 'text-decoration-line:underline;'
});

var resetCSS = IN_BROWSER
? "color:initial;background-color:initial;text-decoration-line:none;font-weight:normal;"
: '';

var pattern = /(%|\$)\(([\s\S]*?)\)/g;

var processInput = IN_BROWSER
? function (input, format){
    if ( format === void 0 ) { format = {}; }

    var styles = [];
    return [(input + '').replace(pattern, function (m, type, str){
        var s = '';
        if(type === '%'){
            return format[str];
        }

        if(type !== '$') { return m; }

        if(!str.length){
            styles.push(resetCSS);
            return '%c';
        }

        var other = str.split(' ');
        var ref = other[0].split(':');
        var fg = ref[0];
        var bg = ref[1];
        var colorized = false;

        if(fg && fg in allowedColors){
            s += "color:" + fg + ";";
            colorized = true;
        }

        if(bg && bg in allowedColors){
            s += "background-color:" + bg + ";";
            colorized = true;
        }

        if(colorized) { other.shift(); }

        other.forEach(function (style){
            if(style in allowedStyles){
                if(style in cssStrings){
                    s += cssStrings[style];
                }
            }
        });

        styles.push(s);

        return '%c';
    })].concat(styles);
}
: function (input, format){
    if ( format === void 0 ) { format = {}; }

    return [(input + '').replace(pattern, function (m, type, str){
        var styles = '';

        if(type === '%'){
            return format[str];
        }

        if(type !== '$') { return m; }

        if(!str.length){
            return reset;
        }

        var other = str.split(' ');
        var ref = other[0].split(':');
        var fg = ref[0];
        var bg = ref[1];
        var colorized = false;

        if(fg && fg in allowedColors){
            styles += fgcodes[fg];
            colorized = true;
        }

        if(bg && bg in allowedColors){
            styles += bgcodes[bg];
            colorized = true;
        }

        if(colorized) { other.shift(); }

        other.forEach(function (style){
            if(style in allowedStyles){
                if(style in styleCodes){
                    styles += styleCodes[style];
                }
            }
        });

        return styles;
    })];
};

//https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script

//const example = `$(red:blue underscore)string$()`;

var clear = IN_BROWSER
//https://developer.mozilla.org/en-US/docs/Web/API/Console/clear
? function (){ return console.clear(); }
//https://gist.github.com/KenanSulayman/4990953
: function (){ return process.stdout.write('\x1Bc'); };

var prefixer = function (doPrefix){
    return doPrefix && !IN_BROWSER
    ? function (val, type){
        return (logSymbols[type] || '') + val;
    } : function (val){ return val; };
};

var Logger = function Logger(ref){
    if ( ref === void 0 ) { ref = {}; }
    var prefix = ref.prefix; if ( prefix === void 0 ) { prefix = false; }

    this.prefix = prefix;
    this.clear = clear;
    this._prefix = prefixer(prefix);
};
Logger.prototype.process = function process (input, format, type){
        if ( format === void 0 ) { format = {}; }
        if ( type === void 0 ) { type = null; }

    input = this._prefix(input, type);
    var inputs = processInput(input, format);
    //inputs[0] = this._prefix(inputs[0], type);
    return inputs;
};
Logger.prototype.log = function log (input, format){
    var inputs = this.process(input, format);
    return console.log.apply(console, inputs);
};
Logger.prototype.error = function error (input, format){
    var inputs = this.process(input, format, 'error');
    return console.error.apply(console, inputs);
};
Logger.prototype.info = function info (input, format){
    var inputs = this.process(input, format, 'info');
    return console.info.apply(console, inputs);
};
Logger.prototype.warn = function warn (input, format){
    var inputs = this.process(input, format, 'warning');
    return console.warn.apply(console, inputs);
};
Logger.prototype.ok = function ok (input, format){
    var inputs = this.process(((logSymbols.success) + " " + input), format);
    return console.log.apply(console, inputs);
};

Logger.prototype.notok = IN_BROWSER
? function(input, format){
    return this.error(input, format);
}
: function(input, format){
    var inputs = processInput(((logSymbols.error) + " " + input), format);
    return console.error.apply(console, inputs);
};

var logger = new Logger();

var tests = ['log', 'error', 'warn'];
tests.forEach(function (key){
    logger[key](("simple " + key));
});
tests.forEach(function (key){
    logger[key]((key + " to the %(value)"), {value: 'moon'});
});

tests.forEach(function (key){
    logger[key]((key + ": The moon is a $(red)red moon$()"), {value: 'moon'});
});

//const fgcolors = ['red', 'green', 'yellow', 'blue', 'magenta'];
var fgcolors = Object.keys(allowedColors);
var bgcolors = fgcolors;
fgcolors.forEach(function (color){
    tests.forEach(function (key){
        logger[key](("The moon is a $(" + color + ")" + color + " %(value)$()"), {value: 'moon'});
    });
});

bgcolors.forEach(function (color){
    tests.forEach(function (key){
        logger[key](("The moon is a $(:" + color + ")" + color + " %(value)$()"), {value: 'moon'});
    });
});

logger.log("The moon is a $(red underline)red %(value)$()", {value: 'moon'});
logger.log("The moon is a $(green underline)green %(value)$()!!!", {value: 'moon'});
logger.log("The moon is a $(green)green %(value)$()", {value: 'moon'});

logger.ok('The moon is ok');
logger.notok('The moon is not ok');

if(process.argv.indexOf('--clear') !== -1){
    setTimeout(function (){

        logger.clear();
        logger.log('cleared!');
    }, 3000);
}

logger.log('The %(value) is big.', {value: 'moon'});
logger.log('The $(red)moon$() is red');
logger.log('The $(green:red)moon$() is green, and red.');
logger.log('The $(green:magenta underline)moon$() is green, magenta, and underlined.');

}());
//# sourceMappingURL=code.js.map
