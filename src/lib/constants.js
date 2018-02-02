import { IN_BROWSER, SUPPORTS_UTF8, supportsColor, debugging, supportsLogStyles } from 'uni-compat';

const TERM_SUPPORTS_COLOR = (()=>{
    const supports = supportsColor();
    return !supports.browser && supports.stdout.hasBasic;
})();

const SUPPORTS_LOG_STYLES = supportsLogStyles();

const DEBUG = debugging();

export { IN_BROWSER, IN_NODE, SUPPORTS_UTF8, TERM_SUPPORTS_COLOR, DEBUG, SUPPORTS_LOG_STYLES };
