const { Logger } = require('../');
const logger = new Logger();

const tests = ['log', 'error', 'warn'];
tests.forEach(key=>{
    logger[key](`simple ${key}`);
});
tests.forEach(key=>{
    logger[key](`${key} to the %(value)`, {value: 'moon'});
});

tests.forEach(key=>{
    logger[key](`The moon is a %(red)red moon%()`, {value: 'moon'});
});

tests.forEach(key=>{
    logger[key](`The moon is a %(red)red %(value)%()`, {value: 'moon'});
});
