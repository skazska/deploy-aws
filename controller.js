const AWSGlobal = require('aws-sdk/global');
const LambdaController = require('./lambda/controller');
const RoleController = require('./iam/role/controller');
const { resolvePropertiesPromise, resolveArrayPromise } = require('./utils/dependencies');

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

    deployRoles (params, options, deployment, final) {
        // TODO const policies = resolvePropertiesPromise(params.policies, deployment);
        const policies = params.policies;

        return this.roleController.deploy(
            params.awsProperties,
            {inlinePolicy: params.inlinePolicy, policies: policies},
            final
        );
    }

    deployLambda (params, options, deployment, final) {
        const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        return this.lambdaController.deploy(
            params.awsProperties.FunctionName,
            properties,
            {wd: options.wd, codeEntries: params.codeEntries},
            final
        );
    }

    deploy (deployParams, options, final) {
        const deployment = {};
        if (Array.isArray(final)) final = [];

        DPKO.forEach(groupKey => {
            const meth = 'deploy' + groupKey[0].toUpperCase() + groupKey.substr(1);
            if (typeof this[meth] === 'function') {
                // deployment[groupKey] = {};
                Object.keys(deployParams[groupKey]).forEach(key => {
                    deployment[groupKey + '.' + key] = this[meth](deployParams[groupKey][key], options, deployment, final);
                });
            }
        });

        return Promise.all(Object.keys(deployment).map(key => deployment[key]));
    }

}

module.exports = Controller;
