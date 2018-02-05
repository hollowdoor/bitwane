(function () {
'use strict';

var browserSupportsLogStyles_1$1 = browserSupportsLogStyles;

function browserSupportsLogStyles () {
  // don’t run in non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  // edge browser? https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
  var isEdge = navigator.userAgent.toLowerCase().indexOf('edge') > -1;
  // http://stackoverflow.com/a/16459606/376773
  var isWebkit = 'WebkitAppearance' in document.documentElement.style;
  // http://stackoverflow.com/a/398120/376773
  var isFirebug = window.console && (window.console.firebug || (window.console.exception && window.console.table)) && true;
  // firefox >= v31? https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  var isFirefoxWithLogStyleSupport = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31;

  return (isWebkit && !isEdge) || isFirebug || isFirefoxWithLogStyleSupport || false
}

//Except for IN_BROWSER constants should be side effect free for transpiler tree shaking
var IN_BROWSER = new Function("try {return this===window;}catch(e){ return false;}")();
var SUPPORTS_UTF8 = IN_BROWSER || (process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');

function supportsLogStyles(){
    return IN_BROWSER && browserSupportsLogStyles_1$1();
}

function supportsColor(){
    if(IN_BROWSER){
        return {
            browser: true
        };
    }
    var supports = require('supports-color');
    supports.browser = false;
    return supports;
}

function debugging(){
    if(IN_BROWSER){
        return /(^\?|&)DEBUG=(1|true)/.test(window.location.search + '');
    }
    return !!process.env['DEBUG'] && process.env['DEBUG'] === 1 || process.env['DEBUG'] === 'true';
}

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

var TERM_SUPPORTS_COLOR$$1 = (function (){
    var supports = supportsColor();
    return !supports.browser && supports.stdout.hasBasic;
})();

var SUPPORTS_LOG_STYLES = supportsLogStyles();

var DEBUG = debugging();

var logSymbols = SUPPORTS_UTF8 ?
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

if(!IN_BROWSER && TERM_SUPPORTS_COLOR$$1){
    //Set terminal colors
    Object.keys(allowedColors).forEach(function (color){
        fgcodes[color] = "\u001b[3" + (allowedColors[color]) + "m";
        bgcodes[color] = "\u001b[4" + (allowedColors[color]) + "m";
    });

    Object.keys(allowedStyles).forEach(function (style){
        styleCodes[style] = "\u001b[" + (allowedStyles[style]) + "m";
    });
}else if(!TERM_SUPPORTS_COLOR$$1){
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

var pattern = /([%\$]\()([\s\S]*?)\)([\s\S]*?)/g;

var processInput = IN_BROWSER
? function (input, format){
    if ( format === void 0 ) { format = {}; }

    var styles = [];

    return [(input + '')
    .replace(pattern, function (m, type, res, str){
        if(type === '%('){
            return format[res] + str;
        }

        if(!SUPPORTS_LOG_STYLES){
            return '';
        }

        if(!res.length){
            styles.push(resetCSS);
            return '%c' + str;
        }

        var other = res.split(' ');
        var ref = other[0].split(':');
        var fg = ref[0];
        var bg = ref[1];
        var colorized = false, s = '';

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

        return '%c' + str;
    })].concat(styles);
}
: function (input, format){
    if ( format === void 0 ) { format = {}; }

    return [(input + '')
    .replace(pattern, function (m, type, res, str){
        var styles = '';

        if(type === '%('){
            return format[res] + str;
        }

        if(!res.length){
            return reset + str;
        }

        var other = res.split(' ');
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

        return styles + str;
    })];
};

function noStyles(input, format){
    if ( format === void 0 ) { format = {}; }

    return input.replace(pattern, function (m, type, res, str){

        if(type === '%('){
            return format[res] + str;
        }

        return str;
    });
}

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
    var each = ref.each; if ( each === void 0 ) { each = null; }

    this.prefix = prefix;
    this.clear = clear;
    this._prefix = prefixer(prefix);
    this._each = each;
    if(each && typeof each !== 'function'){
        throw new TypeError((each + " is not a function"));
    }
};
Logger.prototype.process = function process (input, format, type){
        if ( format === void 0 ) { format = {}; }
        if ( type === void 0 ) { type = null; }

    if(this._each){
        this._each(noStyles(input, format));
    }
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
Logger.toList = function toList (input, ref){
        if ( ref === void 0 ) { ref = {}; }
        var extra = ref.extra; if ( extra === void 0 ) { extra = 1; }
        var sep = ref.sep; if ( sep === void 0 ) { sep = ' '; }
        var dot = ref.dot; if ( dot === void 0 ) { dot = '.'; }
        var colors = ref.colors; if ( colors === void 0 ) { colors = {}; }

    var keys = Object.keys(input);
    var isArray = Array.isArray(input);

    var max = isArray
    ? (input.length + '').length + extra + 1
    : keys.reduce(function (max, key){
        return key.length > max ? key.length : max;
    }, 1) + extra;

    var item = isArray
    ? function (key, i){ return (i+1)+dot; }
    : function (key){ return key; };

    return keys.map(function (key, i){
        var pre = item(key, i);
        for(var i$1=pre.length; i$1<max; i$1++){
            pre = pre + sep;
        }
        return {pre: pre, val:input[key]};
    });
};
Logger.prototype.list = function list (input, options){
        var this$1 = this;
        if ( options === void 0 ) { options = {}; }

    if(typeof input !== 'object'){
        throw new TypeError((input + " is not an object, or array."))
    }
    var every = options.every; if ( every === void 0 ) { every = (function (pre, val){
        return pre + val;
    }); }

    return Logger.toList(input, options)
    .map(function (line){
        console.log(every.call(this$1, line.pre, line.val));
        return line;
    });
};
Logger.toTree = function toTree (input){
};


Logger.prototype.notok = IN_BROWSER
? function(input, format){
    return this.error(input, format);
}
: function(input, format){
    var inputs = processInput(((logSymbols.error) + " " + input), format);
    return console.error.apply(console, inputs);
};

var logger = new Logger({
    each: function each(value){
        console.log('each ', value);
    }
});

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

if(typeof process !== 'undefined' && process.argv.indexOf('--clear') !== -1){
    setTimeout(function (){

        logger.clear();
        logger.log('cleared!');
    }, 3000);
}

logger.log('The %(value) is big.', {value: 'moon'});
logger.log('The $(red)moon$() is red');
logger.log('The $(green:red)moon$() is green, and red.');
logger.log('The $(green:magenta underline)moon$() is green, magenta, and underlined.');

logger.list({
    one: 'one',
    two: 'two',
    three: 'three'
});

logger.list([
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven'
]);

}());
//# sourceMappingURL=code.js.map
