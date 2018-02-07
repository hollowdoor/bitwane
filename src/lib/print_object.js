import indent from 'indent-string';
import { processInput, noStyles, esc } from './process_input.js';


function log(input, dent = 0, end = false){
    let inputs = processInput(input + '');
    inputs[0] = indent(inputs[0], dent);
    if(end){
        inputs[0] += ',';
    }
    console.log(...inputs);
}

function arr(input){
    return input === ']'
    || input === '['
    || input === ' ['
    ? 'green:' : '';
}
function edge(input){
    return `$(bright)${input}$()`;
}

function last(input){
    return edge(Array.isArray(input) ? '[': '{');
}

function num(input){
    return `$(green:bright)${input}$()`;
}

function str(input){
    return `$(blue:bright)"${esc(input)}"$()`;
}

function other(input){
    const type = typeof input;

    return type === 'number'
    ? num(input)
    : type === 'boolean'
    ? `$(red:bright)${input}$()`
    : esc(input);
}

function circ(input){
    return `$(red:bright)[Circular${input.constructor.name ? ' ' + input.constructor.name : '' }]$()`
}

const dt = typeof new Date().toJSON === 'function'
? (input)=>`$(magenta)${input.toJSON()}$()`
: (input)=>`$(magenta)${input.toISOString()}$()`;

function isDate(input){
    return Object.prototype.toString.call(input) === '[object Date]';
}

export default function printObject(input, depth = 0, ending = false, start = false, hash = new WeakMap()){
    const type = typeof input;

    if(type !== 'object'){
        if(type === 'string'){
            return log(`"${input}"`, depth);
        }else if(['number', 'boolean', 'undefined'].indexOf(type) !== -1 || input === null){
            return log(input, depth);
        }
    }

    const isArray = Array.isArray(input);
    const keys = Object.keys(input);
    const end = keys.length - 1;
    let output = '';

    hash.set(input, true);

    if(isArray){
        if(start) log(edge('['), depth);
        for(let i=0; i<keys.length; i++){
            let out = '';
            let val = input[keys[i]];
            let valType = typeof val;

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

    if(start) log(edge('{'), depth);

    for(let i=0; i<keys.length; i++){
        let key = keys[i];
        let val = input[key];
        let valType = typeof val;

        if(valType === 'string'){
            log(`${key}: ${str(val)}`, depth + 2, i !== end);
        }else if(valType === 'object'){

            if(isDate(val)){
                log(`${key}: ${dt(val)}`, depth + 2, i !== end);
            }else if(hash.has(val)){
                log(`${key}: ${circ(val)}`, depth + 2, i !== end);
            }else{
                log(`${key}: ${last(val)}`, depth + 2);
                printObject(val, depth + 2, i !== end, false, hash);
            }
        }else{

            log(`${key}: ${other(val)}`, depth + 2, i !== end);
        }
    }

    log(edge('}'), depth, ending);
}
