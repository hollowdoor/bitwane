import indent from 'indent-string';

export default function toTree(input, depth = 0){
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
                ? toTree(val, depth + 1)
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
        ? `${key}: $(bright)"${val}$()"`
        : valType === 'object'
        ? indent(
            `${key}: ${toTree(val, depth + 1)}`,
            depth
        )
        : val)
        + (i !== end ? ',' : '') + '\n';
    }

    return output;
}
