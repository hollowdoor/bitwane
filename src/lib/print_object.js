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
    return `$(${arr(input)}bright)${input}$()`;
}

function last(input){
    return edge(Array.isArray(input) ? ' [': ' {');
}

function num(input){
    return `$(magenta:bright)${input}$()`;
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
    : input;
}

function dt(input){
    return `$(green)${input}$()`;
}

function isDate(input){
    return Object.prototype.toString.call(date) === '[object Date]';
}

export default function printObject(input, depth = 0, ending = false, start = false){
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

    if(isArray){
        if(start) log(edge('['), depth);
        for(let i=0; i<keys.length; i++){
            let out = '';
            let val = input[keys[i]];
            let valType = typeof val;
            if(valType === 'string'){
                log(str(val), depth + 2, i !== end);
            }else if(valType === 'object'){
                log(last(val), depth + 1);
                printObject(val, depth + 2, i !== end)
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
            log(`${key}:${last(val)}`, depth + 2);
            printObject(val, depth + 2, i !== end);
        }else{
            log(`${key}: ${other(val)}`, depth + 2, i !== end);
        }
    }

    log(edge('}'), depth, ending);
}

//export default
function _printObject(input, depth = 0){
    const type = typeof input;

    if(type === 'string'){
        return indent(`"${input}"`, depth);
    }else if(['number', 'boolean', 'undefined'].indexOf(type) !== -1 || input === null){
        return indent(input + '', depth);
    }

    const isArray = Array.isArray(input);
    const keys = Object.keys(input);
    const end = keys.length - 1;
    let output = '';

    if(isArray){
        output += '[\n';
        for(let i=0; i<keys.length; i++){
            let val = input[keys[i]];
            let valType = typeof val;
            output += (valType === 'string'
                ? indent(`"${val}"`, depth + 1)
                : valType === 'object'
                ? printObject(val, depth + 1)
                : indent(val + '', depth + 1)
            ) + (i !== end ? ',' : '') + '\n';
        }
        output += ']\n';
        return output;
    }

    for(let i=0; i<keys.length; i++){
        let key = keys[i];
        let val = input[key];
        let valType = typeof val;
        output += (valType === 'string'
        ? `${key}: $(red)"${val}"$()`
        : valType === 'object'
        ? indent(
            `${key}: ${printObject(val, depth + 1)}`,
            depth
        )
        : val)
        + (i !== end ? ',\n' : '\n');
    }

    return output;
}
