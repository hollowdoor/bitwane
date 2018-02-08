import { IN_BROWSER, DEBUG } from './lib/constants.js';
import { logSymbols } from './lib/log_symbols.js';
import { processInput, noStyles } from './lib/process_input.js';
import printObject from './lib/print_object.js';
export * from './lib/allowed_styles.js';
export * from './lib/style_codes.js';

//https://coderwall.com/p/yphywg/printing-colorful-text-in-terminal-when-run-node-js-script

//const example = `$(red:blue underscore)string$()`;

const clear = IN_BROWSER
//https://developer.mozilla.org/en-US/docs/Web/API/Console/clear
? ()=>console.clear()
//https://gist.github.com/KenanSulayman/4990953
: ()=>process.stdout.write('\x1Bc');

const prefixer = (doPrefix)=>{
    return doPrefix && !IN_BROWSER
    ? (val, type)=>{
        return (logSymbols[type] || '') + val;
    } : (val)=>val;
};

class Logger {
    constructor({
        prefix = false,
        each = null,
        every = function(type, input, format){
            this.output(type, input, format);
        }
    } = {}){
        this.prefix = prefix;
        this.clear = clear;
        this._prefix = prefixer(prefix);
        this._each = each;
        if(each && typeof each !== 'function'){
            throw new TypeError(`${each} is not a function`);
        }
        this._every = every;
        if(every && typeof every !== 'function'){
            throw new TypeError(`${every} is not a function`);
        }
    }
    output(type, input, format){
        let inputs = processInput(input, format);
        if(!!console[type]){
            return console[type](...inputs);
        }else if(!!this['__'+type]){
            return this['__'+type](...inputs);
        }
        throw new Error(`${type} is not a method on ${this.constructor}`);
    }
    process(type, input, format){
        if(this._each){
            this._each(noStyles(input, format));
        }
        input = this._prefix(input, type);
        this._every(type, input, format);
        return this;
    }
    log(input, format){
        return this.process('log', input, format);
    }
    error(input, format){
        return this.process('error', input, format);
    }
    info(input, format){
        return this.process('info', input, format);
    }
    warn(input, format){
        return this.process('warn', input, format);
    }
    ok(input, format){
        return this.process('ok', input, format);
    }
    notok(input, format){
        return this.process('notok', input, format);
    }
    __ok(...inputs){
        console.log(...inputs);
    }
    __notok(...inputs){
        console.error(...inputs);
    }
    static toList(input, {
        extra = 1,
        sep = ' ',
        dot = '.',
        colors = {}
    } = {}){
        const keys = Object.keys(input);
        const isArray = Array.isArray(input);

        const max = isArray
        ? (input.length + '').length + extra + 1
        : keys.reduce((max, key)=>{
            return key.length > max ? key.length : max;
        }, 1) + extra;

        const item = isArray
        ? (key, i)=>(i+1)+dot
        : key=>key;

        return keys.map((key, i)=>{
            let pre = item(key, i);
            for(let i=pre.length; i<max; i++){
                pre = pre + sep;
            }
            return {pre, val:input[key]};
        });
    }
    list(input, options = {}){
        if(typeof input !== 'object'){
            throw new TypeError(`${input} is not an object, or array.`)
        }
        const { every = ((pre, val)=>{
            return pre + val;
        }) } = options;

        return Logger.toList(input, options)
        .map(line=>{
            console.log(every.call(this, line.pre, line.val));
            return line;
        });
    }
    tree(input, indent = 0){
        return printObject(input, indent, false, true);
    }
}


Logger.prototype.notok = IN_BROWSER
? function(input, format){
    return this.error(input, format);
}
: function(input, format){
    let inputs = processInput(`${logSymbols.error} ${input}`, format);
    return console.error(...inputs);
};

const Debugger = (()=>{
    if(DEBUG){
        return class extends Logger {
            constructor(options){
                super(options);
            }
            log(){}
            error(){}
            info(){}
            warn(){}
            ok(){}
            notok(){}
        };
    }
    return class extends Logger {
        constructor(options){
            super(options);
        }
    };
})();

export { Logger, logSymbols, Debugger };
