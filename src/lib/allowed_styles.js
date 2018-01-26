import rawObject from 'raw-object';
const allowedColors = rawObject({
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    white: 7
});

const allowedStyles = rawObject({
    bright: 1,
    dim: 2,
    underline: 4,
    //Not sure if these should be used
    //blink: 5,
    //reverse: 7,
    //hidden: 8
});

export { allowedColors, allowedStyles };
