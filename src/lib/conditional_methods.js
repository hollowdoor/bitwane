import { IN_BROWSER } from './constants.js';
export function addTo(proto){
    proto.clear = IN_BROWSER
    //https://developer.mozilla.org/en-US/docs/Web/API/Console/clear
    ? ()=>console.clear()
    //https://gist.github.com/KenanSulayman/4990953
    : ()=>process.stdout.write('\x1Bc');
}
