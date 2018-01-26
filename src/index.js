import { IN_BROWSER, DEBUG } from './lib/constants.js';
import { logSymbols } from './lib/log_symbols.js';
import { processInput } from './lib/process_input.js';
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
        prefix = false
    } = {}){
        this.prefix = prefix;
        this.clear = clear;
        this._prefix = prefixer(prefix);
    }
    process(input, format = {}, type = null){
        input = this._prefix(input, type);
        let inputs = processInput(input, format);
        //inputs[0] = this._prefix(inputs[0], type);
        return inputs;
    }
    log(input, format){
        let inputs = this.process(input, format);
        return console.log(...inputs);
    }
    error(input, format){
        let inputs = this.process(input, format, 'error');
        return console.error(...inputs);
    }
    info(input, format){
        let inputs = this.process(input, format, 'info');
        return console.info(...inputs);
    }
    warn(input, format){
        let inputs = this.process(input, format, 'warning');
        return console.warn(...inputs);
    }
    ok(input, format){
        let inputs = this.process(`${logSymbols.success} ${input}`, format);
        return console.log(...inputs);
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
