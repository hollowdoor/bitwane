import { SUPPORTS_UTF8 } from './constants.js';
import rawObject from 'raw-object';

const logSymbols = SUPPORTS_UTF8 ?
//Based on https://github.com/sindresorhus/log-symbols
rawObject({
        info: `$(blue)ℹ$()`,
        success: `$(green)✔$()`,
        warning: `$(yellow)⚠$()`,
        error: `$(red)✖$()`
})
: rawObect({
    info: `$(blue)i$()`,
    success: `$(green)√$()`,
    warning: `$(yellow)‼$()`,
    error: `$(red)×$()`
});

export { logSymbols };
