import { SUPPORTS_SYMBOLS } from './constants.js';
import rawObject from 'raw-object';

const logSymbols = SUPPORTS_SYMBOLS ?
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
