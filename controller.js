const AWSGlobal = require('aws-sdk/global');
const LambdaController = require('./lambda/controller');
const RoleController = require('./iam/role/controller');
const { resolvePropertiesPromise } = require('./utils/dependencies');

const DPKO = [
    'roles',
    'lambda'
];

class Controller {
    constructor(config) {
        if (typeof config === 'string') {
            AWSGlobal.config.loadFromPath(config);
        } else if (typeof config === 'object') {
            AWSGlobal.config.update(Object.assign({}, defaultConfig, config));
        }

        this.lambdaController = new LambdaController();
        this.roleController = new RoleController();
    }

    roles (params) {
        const policies = params.policies; //TODO policies processing

        return this.roleController.deploy(params.awsProperties, {inlinePolicy: params.inlinePolicy, policies: policies});
    }

    lambda (params, options, deployment) {
        const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        return this.lambdaController.deploy(properties, {wd: options.wd, codeEntries: params.codeEntries});
    }

    deploy (deployParams, options) {
        const deployment = {};

        DPKO.forEach(groupKey => {
            if (typeof this[groupKey] === 'function') {
                // deployment[groupKey] = {};
                Object.keys(deployParams[groupKey]).forEach(key => {
                    deployment[groupKey + '.' + key] = this[groupKey](deployParams[groupKey][key], options, deployment);
                });
            }
        });

        return Promise.all(Object.keys(deployment).map(key => deployment[key]));
    }

}

module.exports = Controller;
