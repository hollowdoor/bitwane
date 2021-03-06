import { IN_BROWSER, SUPPORTS_LOG_STYLES } from './constants.js';
import { fgcodes, bgcodes, styleCodes, reset, cssStrings, resetCSS } from './style_codes.js';
import { allowedColors, allowedStyles } from './allowed_styles.js';


const pattern = /(\\?[%\$]\()([\s\S]*?)\)([\s\S]*?)/g;

const processInput = IN_BROWSER
? (input, format = {})=>{
    let styles = [];

    return [(input + '')
    .replace(pattern, (m, type, res, str)=>{
        if(type[0] === '\\') return m.slice(1);
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

        let other = res.split(' ');
        let [fg, bg] = other[0].split(':');
        let colorized = false, s = '';

        if(fg && fg in allowedColors){
            s += `color:${fg};`;
            colorized = true;
        }

        if(bg && bg in allowedColors){
            s += `background-color:${bg};`;
            colorized = true;
        }

        if(colorized) other.shift();

        other.forEach(style=>{
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
: (input, format = {})=>{
    return [(input + '')
    .replace(pattern, (m, type, res, str)=>{
        let styles = '';
        //console.log(type[0])
        if(type[0] === '\\') return m.slice(1);
        if(type === '%('){
            return format[res] + str;
        }

        if(!res.length){
            return reset + str;
        }

        let other = res.split(' ');
        let [fg, bg] = other[0].split(':');
        let colorized = false;

        if(fg && fg in allowedColors){
            styles += fgcodes[fg];
            colorized = true;
        }

        if(bg && bg in allowedColors){
            styles += bgcodes[bg];
            colorized = true;
        }

        if(colorized) other.shift();

        other.forEach(style=>{
            if(style in allowedStyles){
                if(style in styleCodes){
                    styles += styleCodes[style];
                }
            }
        });

        return styles + str;
    })];
};

function noStyles(input, format = {}){
    return (input + '').replace(pattern, (m, type, res, str)=>{

        if(type === '%('){
            return format[res] + str;
        }

        return str;
    });
}

export function esc(input){
    return (input + '')
    .replace(pattern, (m, type, res, str)=>{
        if(type[0] === '\\'){
            return m;
        }
        return '\\' + m;
    });
}

export { processInput, noStyles };
