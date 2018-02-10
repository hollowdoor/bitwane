import { Logger, allowedColors } from '../';
const logger = new Logger({
    each(value){
        //console.log('each ', value);
    }
});

const tests = ['log', 'error', 'warn'];
tests.forEach(key=>{
    logger[key](`simple ${key}`);
});
tests.forEach(key=>{
    logger[key](`${key} to the %(value)`, {value: 'moon'});
});

tests.forEach(key=>{
    logger[key](`${key}: The moon is a $(red)red moon$()`, {value: 'moon'});
});

//const fgcolors = ['red', 'green', 'yellow', 'blue', 'magenta'];
const fgcolors = Object.keys(allowedColors);
const bgcolors = fgcolors;
fgcolors.forEach(color=>{
    tests.forEach(key=>{
        logger[key](`The moon is a $(${color})${color} %(value)$()`, {value: 'moon'});
    });
});

bgcolors.forEach(color=>{
    tests.forEach(key=>{
        logger[key](`The moon is a $(:${color})${color} %(value)$()`, {value: 'moon'});
    });
});

logger.log(`The moon is a $(red underline)red %(value)$()`, {value: 'moon'});
logger.log(`The moon is a $(green underline)green %(value)$()!!!`, {value: 'moon'});
logger.log(`The moon is a $(green)green %(value)$()`, {value: 'moon'});

logger.ok('The moon is ok');
logger.notok('The moon is not ok');

if(typeof process !== 'undefined' && process.argv.indexOf('--clear') !== -1){
    setTimeout(()=>{

        logger.clear();
        logger.log('cleared!');
    }, 3000);
}

logger.log('The %(value) is big.', {value: 'moon'});
logger.log('The $(red)moon$() is red');
logger.log('The $(green:red)moon$() is green, and red.');
logger.log('The $(green:magenta underline)moon$() is green, magenta, and underlined.')

logger.list({
    one: 'one',
    two: 'two',
    three: 'three'
});

logger.list([
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven'
]);

logger.tree({
    one: 'one',
    two: 't$()wo',
    three: [0, 1, false],
    four: {
        one: 'one',
        two: 'two',
        three: [0, 1, 3, {one: 'one', two: 'two'}]
    }
});

logger.tree([0, 1, 3, {one: 'one', two: 'two'}])
logger.tree("a string");
logger.tree(2);
logger.tree(true);
logger.tree({
    one: 'one',
    two: 't$()wo',
    three: [0, 1, false],
    four: {
        one: 'one',
        two: 'two',
        three: [0, 1, 3, {one: 'one', two: 'two'}]
    }
}, 2);

const base = {
    one: 'one',
    two: 't$()wo',
    three: [0, 1, false],
    four: {
        one: 'one',
        two: 'two',
        three: [0, 1, 3, {one: 'one', two: 'two'}]
    },
    date: new Date(Date.now())
};

base.four.circ = base;

logger.tree(base);
logger.log('This should be indented', null, 2);
