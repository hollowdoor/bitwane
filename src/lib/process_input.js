import { IN_BROWSER } from './constants.js';
import { fgcodes, bgcodes, styleCodes, reset, cssStrings, resetCSS } from './style_codes.js';
import { allowedColors, allowedStyles } from './allowed_styles.js';

const pattern = /(%|\$)\(([\s\S]*?)\)/g;

const processInput = IN_BROWSER
? (input, format = {})=>{
    let styles = [];
    return [(input + '').replace(pattern, (m, type, str)=>{
        let s = '';
        if(type === '%'){
            return format[str];
        }

        if(type !== '$') return m;

        if(!str.length){
            styles.push(resetCSS);
            return '%c';
        }

        let other = str.split(' ');
        let [fg, bg] = other[0].split(':');
        let colorized = false;

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

        return '%c';
    })].concat(styles);
}
: (input, format = {})=>{
    return [(input + '').replace(pattern, (m, type, str)=>{
        let styles = '';

        if(type === '%'){
            return format[str];
        }

        if(type !== '$') return m;

        if(!str.length){
            return reset;
        }

        let other = str.split(' ');
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

        return styles;
    })];
};

export { processInput };
