const AWSGlobal = require('aws-sdk/global');
const LambdaController = require('./lambda/controller');
const RoleController = require('./iam/role/controller');
const RestApiController = require('./api-gateway/controller');
const { resolvePropertiesPromise, resolveArrayPromise } = require('./utils/dependencies');

const DPKO = [
    'role',
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
        this.restApiController = new RestApiController()
    }

    static get DPKO () { return DPKO; }

    /**
     * returns method name for DPKO entry
     * @param {string} key
     * @return {string}
     */
    static deployMethodName(key) {
        return 'deploy' + key[0].toUpperCase() + key.substr(1);
    }

    deployRole (params, options, deployment, informGroup) {
        // TODO const policies = resolveArrayPromise(params.policies, deployment);
        const policies = params.policies;

        return this.roleController.deploy(
            params.key,
            // params.awsProperties.RoleName,
            params.awsProperties,
            {inlinePolicy: params.inlinePolicy, policies: policies},
            informGroup
        );
    }

    deployLambda (params, options, deployment, informGroup) {
        const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        return this.lambdaController.deploy(
            params.key,
            // params.awsProperties.FunctionName,
            properties,
            {wd: options.wd, codeEntries: params.codeEntries},
            informGroup
        );
    }

    deployRestApi (params, options, deployment, informGroup) {
        // const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        return this.restApiController.deploy(
            params.key,
            // params.awsProperties.FunctionName,
            params.awsProperties,//properties
            {resources: params.resources},
            informGroup
        );
    }

    /**
     *
     * @param deployParams
     * @param options
     * @param {Inform} inform
     * @return {Promise<[any , any , any , any , any , any , any , any , any , any]>}
     */
    deploy (deployParams, options, inform) {
        const deployment = {};

        Controller.DPKO.forEach(groupKey => {
            const meth = Controller.deployMethodName(groupKey);
            if (typeof this[meth] === 'function') {
                // deployment[groupKey] = {};
                Object.keys(deployParams[groupKey]).forEach(key => {
                    const informGroup = inform.addGroup(null, {text: 'Deploying ' + groupKey + '.' + key});
                    deployParams[groupKey][key].key = key;
                    deployment[groupKey + '.' + key] = this[meth](deployParams[groupKey][key], options, deployment, informGroup);
                    informGroup.task = deployment[groupKey + '.' + key];
                });
            }
        });

        return Promise.all(Object.keys(deployment).map(key => deployment[key]));
    }

}

module.exports = Controller;
