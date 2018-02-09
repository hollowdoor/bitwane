import indentString from 'indent-string';
import { IN_BROWSER, SUPPORTS_UTF8, debugging, supportsColor, supportsLogStyles } from 'uni-compat';
import rawObject from 'raw-object';

var TERM_SUPPORTS_COLOR = (function (){
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

var pattern = /(\\?[%\$]\()([\s\S]*?)\)([\s\S]*?)/g;

var processInput = IN_BROWSER
? function (input, format){
    if ( format === void 0 ) format = {};

    var styles = [];

    return [(input + '')
    .replace(pattern, function (m, type, res, str){
        if(type[0] === '\\') { return m.slice(1); }
        if(type === '%('){
            return format[res] + str;
        }

        if(!SUPPORTS_LOG_STYLES){
            return '' + str;
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
        //console.log(type[0])
        if(type[0] === '\\') { return m.slice(1); }
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

function esc(input){
    return (input + '')
    .replace(pattern, function (m, type, res, str){
        if(type[0] === '\\'){
            return m;
        }
        return '\\' + m;
    });
}

function log(input, dent, end){
    if ( dent === void 0 ) dent = 0;
    if ( end === void 0 ) end = false;

    var inputs = processInput(input + '');
    inputs[0] = indentString(inputs[0], dent);
    if(end){
        inputs[0] += ',';
    }
    console.log.apply(console, inputs);
}

function edge(input){
    return ("$(bright)" + input + "$()");
}

function last(input){
    return edge(Array.isArray(input) ? '[': '{');
}

function num(input){
    return ("$(green:bright)" + input + "$()");
}

function str(input){
    return ("$(blue:bright)\"" + (esc(input)) + "\"$()");
}

function other(input){
    var type = typeof input;

    return type === 'number'
    ? num(input)
    : type === 'boolean'
    ? ("$(red:bright)" + input + "$()")
    : esc(input);
}

function circ(input){
    return ("$(red:bright)[Circular" + (input.constructor.name ? ' ' + input.constructor.name : '') + "]$()")
}

var dt = typeof new Date().toJSON === 'function'
? function (input){ return ("$(magenta)" + (input.toJSON()) + "$()"); }
: function (input){ return ("$(magenta)" + (input.toISOString()) + "$()"); };

function isDate(input){
    return Object.prototype.toString.call(input) === '[object Date]';
}

function printObject(input, depth, ending, start, hash){
    if ( depth === void 0 ) depth = 0;
    if ( ending === void 0 ) ending = false;
    if ( start === void 0 ) start = false;
    if ( hash === void 0 ) hash = new WeakMap();

    var type = typeof input;

    if(type !== 'object'){
        if(type === 'string'){
            return log(("\"" + input + "\""), depth);
        }else if(['number', 'boolean', 'undefined'].indexOf(type) !== -1 || input === null){
            return log(input, depth);
        }
    }

    var isArray = Array.isArray(input);
    var keys = Object.keys(input);
    var end = keys.length - 1;
    var output = '';

    hash.set(input, true);

    if(isArray){
        if(start) { log(edge('['), depth); }
        for(var i=0; i<keys.length; i++){
            var out = '';
            var val = input[keys[i]];
            var valType = typeof val;

            if(valType === 'string'){
                log(str(val), depth + 2, i !== end);
            }else if(valType === 'object'){

                if(isDate(val)){
                    log(dt(val), depth + 2, i !== end);
                }else
                if(hash.has(val)){
                    log(circ(val), depth + 2, i !== end);
                }else{
                    log(last(val), depth + 2);
                    printObject(val, depth + 2, i !== end, false, hash);
                }
            }else{
                log(other(val), depth + 2, i !== end);
            }
        }
        log(edge(']'), depth, ending);
        return;
    }

    if(start) { log(edge('{'), depth); }

    for(var i$1=0; i$1<keys.length; i$1++){
        var key = keys[i$1];
        var val$1 = input[key];
        var valType$1 = typeof val$1;

        if(valType$1 === 'string'){
            log((key + ": " + (str(val$1))), depth + 2, i$1 !== end);
        }else if(valType$1 === 'object'){

            if(isDate(val$1)){
                log((key + ": " + (dt(val$1))), depth + 2, i$1 !== end);
            }else if(hash.has(val$1)){
                log((key + ": " + (circ(val$1))), depth + 2, i$1 !== end);
            }else{
                log((key + ": " + (last(val$1))), depth + 2);
                printObject(val$1, depth + 2, i$1 !== end, false, hash);
            }
        }else{

            log((key + ": " + (other(val$1))), depth + 2, i$1 !== end);
        }
    }

    log(edge('}'), depth, ending);
}

function addTo(proto){
    proto.clear = IN_BROWSER
    //https://developer.mozilla.org/en-US/docs/Web/API/Console/clear
    ? function (){ return console.clear(); }
    //https://gist.github.com/KenanSulayman/4990953
    : function (){ return process.stdout.write('\x1Bc'); };
}

//https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script

//const example = `$(red:blue underscore)string$()`;


var prefixer = function (doPrefix){
    return doPrefix && !IN_BROWSER
    ? function (val, type){
        return (logSymbols[type] || '') + val;
    } : function (val){ return val; };
};

var Logger = function Logger(ref){
    if ( ref === void 0 ) ref = {};
    var prefix = ref.prefix; if ( prefix === void 0 ) prefix = false;
    var each = ref.each; if ( each === void 0 ) each = null;
    var indentLength = ref.indentLength; if ( indentLength === void 0 ) indentLength = 2;
    var every = ref.every; if ( every === void 0 ) every = function(type, input, format, indent){
        this.output(type, input, format, indent);
    };

    this.prefix = prefix;
    this._prefix = prefixer(prefix);
    this._each = each;
    this.indentLength = indentLength;
    if(each && typeof each !== 'function'){
        throw new TypeError((each + " is not a function"));
    }
    this._every = every;
    if(every && typeof every !== 'function'){
        throw new TypeError((every + " is not a function"));
    }
};
Logger.prototype.process = function process (type, input, format, indent){
    var inputs = processInput(input, format);

    inputs[0] = !indent || isNaN(indent) ? inputs[0] : indentString(inputs[0], indent * this.indentLength);
    return inputs;
};
Logger.prototype.input = function input (type, input$1, format, indent){
    if(this._each){
        this._each(noStyles(input$1, format));
    }
    input$1 = this._prefix(input$1, type);
    this._every(type, input$1, format, indent);
    return this;
};
Logger.prototype.output = function output (type, input, format, indent){
    var inputs = this.process(type, input, format, indent);
    if(!!console[type]){
        return console[type].apply(console, inputs);
    }else if(!!this['__'+type]){
        return (ref = this)['__'+type].apply(ref, inputs);
    }
    throw new Error((type + " is not a method on " + (this.constructor)));
        var ref;
};
Logger.prototype.log = function log (input, format, indent){
    return this.input('log', input, format, indent);
};
Logger.prototype.error = function error (input, format, indent){
    return this.input('error', input, format, indent);
};
Logger.prototype.info = function info (input, format, indent){
    return this.input('info', input, format, indent);
};
Logger.prototype.warn = function warn (input, format, indent){
    return this.input('warn', input, format, indent);
};
Logger.prototype.ok = function ok (input, format, indent){
    return this.input('ok', input, format, indent);
};
Logger.prototype.notok = function notok (input, format, indent){
    return this.input('notok', input, format, indent);
};
Logger.prototype.__ok = function __ok (){
        var inputs = [], len = arguments.length;
        while ( len-- ) inputs[ len ] = arguments[ len ];

    console.log.apply(console, inputs);
};
Logger.prototype.__notok = function __notok (){
        var inputs = [], len = arguments.length;
        while ( len-- ) inputs[ len ] = arguments[ len ];

    console.error.apply(console, inputs);
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
Logger.prototype.tree = function tree (input, indent){
        if ( indent === void 0 ) indent = 0;

    return printObject(input, indent, false, true);
};

addTo(Logger.prototype);


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

export { Logger, logSymbols, Debugger, allowedColors, allowedStyles, fgcodes, bgcodes, styleCodes, reset, cssStrings, resetCSS };
//# sourceMappingURL=bundle.es.js.map
