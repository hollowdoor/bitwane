import { IN_BROWSER, TERM_SUPPORTS_COLOR } from './constants.js';
import { allowedColors, allowedStyles } from './allowed_styles.js';
import rawObject from 'raw-object';

const reset = IN_BROWSER ? '' : `\x1b[0m`;
const fgcodes = rawObject({reset});
const bgcodes = rawObject({reset});
const styleCodes = rawObject({reset});

if(!IN_BROWSER && TERM_SUPPORTS_COLOR){
    //Set terminal colors
    Object.keys(allowedColors).forEach(color=>{
        fgcodes[color] = `\x1b[3${allowedColors[color]}m`;
        bgcodes[color] = `\x1b[4${allowedColors[color]}m`;
    });

    Object.keys(allowedStyles).forEach(style=>{
        styleCodes[style] = `\x1b[${allowedStyles[style]}m`;
    });
}else if(!TERM_SUPPORTS_COLOR){
    Object.keys(allowedColors).forEach(color=>{
        fgcodes[color] = ``;
        bgcodes[color] = ``;
    });

    Object.keys(allowedStyles).forEach(style=>{
        styleCodes[style] = ``;
    });
}

const cssStrings = !IN_BROWSER ? null
: rawObject({
    bright: 'font-weight: bold;',
    dim: 'font-weight: ligher;',
    underline: 'text-decoration-line:underline;'
});

const resetCSS = IN_BROWSER
? `color:initial;background-color:initial;text-decoration-line:none;font-weight:normal;`
: '';

export { fgcodes, bgcodes, styleCodes, reset, cssStrings, resetCSS };
