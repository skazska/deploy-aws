const AWSGlobal = require('aws-sdk/global');
const awsDefaultConfig = {
    "accessKeyId": "ACCESS_KEY_ID",
    "secretAccessKey": "SECRET_ACCESS_KEY",
    "region": "eu-west-1"
};
// const LambdaController = require('./lambda/controller');
const LambdaController = require('./lambda');

const RoleController = require('./iam/role/controller');
const RestApiController = require('./api-gateway');
const { resolvePropertiesPromise, resolveArrayPromise } = require('./utils/dependencies');

const DPKO = [
    'role',
    'lambda',
    'restApi'
];

class Controller {
    constructor(config, region, accountId) {
        if (typeof config === 'string') {
            AWSGlobal.config.loadFromPath(config);
        } else if (typeof config === 'object') {
            AWSGlobal.config.update(Object.assign({}, awsDefaultConfig, config));
        }

        if (!region) region = AWSGlobal.config.region;

        this.lambdaController = new LambdaController();
        this.roleController = new RoleController();
        this.restApiController = new RestApiController(region, accountId)
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
            params.awsProperties,
            {inlinePolicy: params.inlinePolicy, policies: policies},
            informGroup
        );
    }

    deployLambda (params, options, deployment, informGroup) {
        const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        return this.lambdaController.deploy(
            params.key,
            properties,
            {wd: options.wd, codeEntries: params.codeEntries},
            informGroup
        );
    }

    deployRestApi (params, options, deployment, informGroup) {
        const properties = resolvePropertiesPromise(params.awsProperties, deployment);
        const resources = resolvePropertiesPromise(params.resources, deployment);
        return this.restApiController.deploy(
            params.key,
            properties,
            {resources: resources},
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

        //TODO solve a problem: api-gw method integration, may require api-gw resource and method to be processed as
        // well as thing to integrate with (i.e. lambda) before adding integration-related policies (i.e. lambda access
        // policy), so need implement special part of deploy config named "integrations" which will be processed after
        // all DPKO, and all entities available to pick their propertied for creating integrations

        return Promise.all(Object.keys(deployment).map(key => deployment[key]));
    }

}

module.exports = Controller;
