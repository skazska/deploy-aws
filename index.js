#!/usr/bin/env node
'use strict';

const resolvePath = require('path').resolve;
const statSync = require('fs').statSync;
const readFileSync = require('fs').readFileSync;
const { readFromFile } = require('./utils/config');

const program = require('commander');

const Controller = require('./controller');

const Inform = require('@skazska/inform');

const defaultConfigFilePath = '.deploy-aws';

program
    .version('0.0.0')
    .description('deploy aws things');

program
    .command('service [wd]')
    .option('-cfg, --deploy-config-file <s>')
    .option('-acf, --aws-config-file <s>', 'aws config file')
    .option('-ar, --aws-region <s>', 'aws region')
    .option('-acc, --aws-accountId <s>', 'aws region')
    .option('-aak, --aws-accessKeyId <s>', 'aws access key')
    .option('-ask, --aws-secretAccessKey <s>', 'aws secret key')
    .description('Deploy lambda-function from workdir [wd] - (string)')
    .action(async (wd, cmd) => {
        if (!wd) wd = process.cwd();

        //prepare aws config
        let config = cmd['awsConfigFile'] || {};
        let region = cmd['awsRegion'];
        let accId = cmd['awsAccountId'];

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
        const controller = new Controller(config, region, accId);
        const inform = new Inform('Deploy service from location ' + wd);

        try {
            const deployParams = await readFromFile(cfgPath);

            await controller.deploy(deployParams, {wd: wd}, inform);

            await inform.promise;
            console.log('all done');
        } catch (e) {
            if (e) {
                console.error(e);
            } else {
                console.error('can\'t parse ' + cfgPath);
            }
        }
    });

program.parse(process.argv);