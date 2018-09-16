#!/usr/bin/env node
'use strict';

const resolvePath = require('path').resolve;
const statSync = require('fs').statSync;
const readFileSync = require('fs').readFileSync;

const program = require('commander');
// Require logic.js file and extract controller functions using JS destructuring assignment
const Controller = require('./controller');

const defaultConfigFilePath = '.deploy-aws';

program
    .version('0.0.0')
    .description('deploy aws things');

program
    .command('service [wd]')
    .option('-cfg, --deploy-config-file <s>')
    .option('-acf, --aws-config-file <s>', 'aws config file')
    .option('-ar, --aws-region <s>', 'aws region')
    .option('-aak, --aws-accessKeyId <s>', 'aws access key')
    .option('-ask, --aws-secretAccessKey <s>', 'aws secret key')
    .description('Deploy lambda-function from workdir [wd] - (string)')
    .action(async (wd, cmd) => {
        if (!wd) wd = process.cwd();

        //prepare aws config
        let config = cmd['awsConfigFile'] || {};

        if (typeof config !== 'string') {
            Object.keys(cmd).forEach(key => {
                if (key.startsWith('aws') && typeof config !== 'string') {
                    config[key[3].toLowerCase() + key.substr(4)] = cmd[key]
                }
            })
        } else {
            config = resolvePath(config);
        }

        //prepare deployment config
        wd = wd.replace('~', process.env['HOME']);
        let cfgPath = resolvePath(wd, cmd['deploy-config-file'] || defaultConfigFilePath + '.json');

        //deploy
        const controller = new Controller(config);

        const p = statSync(cfgPath);
        if (p.isFile()) {
            //deployment params from file
            let deployParams = readFileSync(cfgPath, 'utf8');
            if (!deployParams) {
                console.error('can\'t read from ' + cfgPath);
            } else {
                try {
                    deployParams = JSON.parse(deployParams);
                    await controller.deploy(deployParams, {wd: wd});
                } catch (e) {
                    if (e) {
                        console.error(e);
                    } else {
                        console.error('can\'t parse ' + cfgPath);
                    }
                }
            }
        } else {
            //deployment params interactively
            console.error('can\'t find ' + config);

            // try {
            //     params = await createLambdaPrompt(params);
            // } catch ( err ) {
            //     console.error(err);
            // }
        }
    });

program.parse(process.argv);