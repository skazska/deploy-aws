const { prompt } = require('inquirer');
'use strict';

const validateInteger = (val) => {
    return /^[0-9]+$/.test(val);
};

const toInteger = (val) => {
    return parseInt(val);
};

const toBoolean = (val) => {
    return val === 'Y';
};

const validateIsDefined = (val) => {
    return typeof val !== 'undefined' && val !== null && !Number.isNaN(val);
};

const validateNotEmpty = (val) => {
    return !!val;
};

const setDefaults = (prompts, answers) => {
    return prompts.map(q => {
        if (validateIsDefined(answers[q.name])) q.default = answers[q.name];
        return q;
    })
};

const createPrompts = [
    {
        type : 'input',
        name : 'FunctionName',
        message : 'Enter function name...',
        validate: validateNotEmpty,
    },
    {
        type : 'input',
        name : 'Description',
        message : 'Enter function description...',
        validate: validateNotEmpty,
    },
    {
        type : 'input',
        name : 'Handler',
        message : 'Enter function handler in form file.method ...',
        validate: validateNotEmpty,
    },
    {
        type : 'input',
        name : 'MemorySize',
        message : 'Enter memory size...',
        validate: validateInteger,
        filter: toInteger
    },
    {
        type : 'confirm',
        name : 'Pubish',
        message : 'Publish?',
        default: 'Y',
        validate: validateNotEmpty,
        filter: toBoolean
    },
    {
        type : 'input',
        name : 'MemorySize',
        message : 'Enter function description...',
        default: 128,
        validate: validateNotEmpty,
        filter: toInteger
    },
    {
        type : 'input',
        name : 'Runtime',
        message : 'runtime',
        validate: validateNotEmpty,
        filter: validateNotEmpty
    },


    // {
    //     type : 'input',
    //     choices: [{name: 'version 0', value: 0}],
    //     name : 'version',
    //     default: 0,
    //     message : 'Enter batch version (number)...',
    //     validate: validateInteger,
    //     filter: toInteger
    // }
];

/**
 * Run interactive session
 * @param {Object} params
 * @return {PromiseLike<any>}
 */
async function createLambdaPrompt(params) {
    return prompt(setDefaults(createPrompts, params));
}


module.exports = {
    createLambdaPrompt: createLambdaPrompt
};