'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var uniCompat = require('uni-compat');
var rawObject = _interopDefault(require('raw-object'));

var TERM_SUPPORTS_COLOR = (function (){
    var supports = uniCompat.supportsColor();
    return !supports.browser && supports.stdout.hasBasic;
})();

var SUPPORTS_LOG_STYLES = uniCompat.supportsLogStyles();

var DEBUG = uniCompat.debugging();

var logSymbols = uniCompat.SUPPORTS_UTF8 ?
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

var reset = uniCompat.IN_BROWSER ? '' : "\u001b[0m";
var fgcodes = rawObject({reset: reset});
var bgcodes = rawObject({reset: reset});
var styleCodes = rawObject({reset: reset});

if(!uniCompat.IN_BROWSER && TERM_SUPPORTS_COLOR){
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

var cssStrings = !uniCompat.IN_BROWSER ? null
: rawObject({
    bright: 'font-weight: bold;',
    dim: 'font-weight: ligher;',
    underline: 'text-decoration-line:underline;'
});

var resetCSS = uniCompat.IN_BROWSER
? "color:initial;background-color:initial;text-decoration-line:none;font-weight:normal;"
: '';

var pattern = /([%\$]\()([\s\S]*?)\)([\s\S]*?)/g;

var processInput = uniCompat.IN_BROWSER
? function (input, format){
    if ( format === void 0 ) format = {};

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
    if ( format === void 0 ) format = {};

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
    if ( format === void 0 ) format = {};

    return input.replace(pattern, function (m, type, res, str){

        if(type === '%('){
            return format[res] + str;
        }

        return str;
    });
}

//https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script

//const example = `$(red:blue underscore)string$()`;

var clear = uniCompat.IN_BROWSER
//https://developer.mozilla.org/en-US/docs/Web/API/Console/clear
? function (){ return console.clear(); }
//https://gist.github.com/KenanSulayman/4990953
: function (){ return process.stdout.write('\x1Bc'); };

var prefixer = function (doPrefix){
    return doPrefix && !uniCompat.IN_BROWSER
    ? function (val, type){
        return (logSymbols[type] || '') + val;
    } : function (val){ return val; };
};

var Logger = function Logger(ref){
    if ( ref === void 0 ) ref = {};
    var prefix = ref.prefix; if ( prefix === void 0 ) prefix = false;
    var each = ref.each; if ( each === void 0 ) each = null;

    this.prefix = prefix;
    this.clear = clear;
    this._prefix = prefixer(prefix);
    this._each = each;
    if(each && typeof each !== 'function'){
        throw new TypeError((each + " is not a function"));
    }
};
Logger.prototype.process = function process (input, format, type){
        if ( format === void 0 ) format = {};
        if ( type === void 0 ) type = null;

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
        if ( ref === void 0 ) ref = {};
        var extra = ref.extra; if ( extra === void 0 ) extra = 1;
        var sep = ref.sep; if ( sep === void 0 ) sep = ' ';
        var dot = ref.dot; if ( dot === void 0 ) dot = '.';
        var colors = ref.colors; if ( colors === void 0 ) colors = {};

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
        if ( options === void 0 ) options = {};

    if(typeof input !== 'object'){
        throw new TypeError((input + " is not an object, or array."))
    }
    var every = options.every; if ( every === void 0 ) every = (function (pre, val){
        return pre + val;
    });

    return Logger.toList(input, options)
    .map(function (line){
        console.log(every.call(this$1, line.pre, line.val));
        return line;
    });
};
Logger.toTree = function toTree (input){
};


Logger.prototype.notok = uniCompat.IN_BROWSER
? function(input, format){
    return this.error(input, format);
}
: function(input, format){
    var inputs = processInput(((logSymbols.error) + " " + input), format);
    return console.error.apply(console, inputs);
};

var Debugger = (function (){
    if(DEBUG){
        return (function (Logger) {
            function anonymous(options){
                Logger.call(this, options);
            }

            if ( Logger ) anonymous.__proto__ = Logger;
            anonymous.prototype = Object.create( Logger && Logger.prototype );
            anonymous.prototype.constructor = anonymous;
            anonymous.prototype.log = function log (){};
            anonymous.prototype.error = function error (){};
            anonymous.prototype.info = function info (){};
            anonymous.prototype.warn = function warn (){};
            anonymous.prototype.ok = function ok (){};
            anonymous.prototype.notok = function notok (){};

            return anonymous;
        }(Logger));
    }
    return (function (Logger) {
        function anonymous$1(options){
            Logger.call(this, options);
        }

        if ( Logger ) anonymous$1.__proto__ = Logger;
        anonymous$1.prototype = Object.create( Logger && Logger.prototype );
        anonymous$1.prototype.constructor = anonymous$1;

        return anonymous$1;
    }(Logger));
})();

exports.Logger = Logger;
exports.logSymbols = logSymbols;
exports.Debugger = Debugger;
exports.allowedColors = allowedColors;
exports.allowedStyles = allowedStyles;
exports.fgcodes = fgcodes;
exports.bgcodes = bgcodes;
exports.styleCodes = styleCodes;
exports.reset = reset;
exports.cssStrings = cssStrings;
exports.resetCSS = resetCSS;
//# sourceMappingURL=bundle.js.map
