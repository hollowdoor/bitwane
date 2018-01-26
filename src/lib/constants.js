const IN_BROWSER = new Function("try {return this===window;}catch(e){ return false;}")();

const DEBUG = (()=>{
    if(IN_BROWSER){
        if(/(^[?]|&)DEBUG=(1|true)/.test(window.location.search + '')){
            return true;
        }

        let html =  document
        .getElementsByTagName('html');
        if(!html) return false;
        html = html[0];
        if(html.hasAttribute('data-debug')){
            return html.getAttribute('data-debug');
        }
        return false;
    }
    return !!process.env['DEBUG'] &&
    (process.env['DEBUG'] === 1 || process.env['DEBUG'] === 'true');
})();

const SUPPORTS_SYMBOLS = IN_BROWSER || (process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color');

const TERM_SUPPORTS_COLOR = (()=>{
    if(IN_BROWSER) return false;
    const supports = require('supports-color');
    return supports.stdout.hasBasic;
})();

export {
    IN_BROWSER, DEBUG, SUPPORTS_SYMBOLS, TERM_SUPPORTS_COLOR
};
