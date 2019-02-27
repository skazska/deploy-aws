const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');

const RESOURCE_LIST_LIMIT = 200;

class ApiGateway {

    constructor () {
        this.connector = new Connector();
    }

    /**
     * @typedef {Object} ApiGateway~DeployOptions
     * @property {RestApi~DeployOptions[]} resources rest-api resource descriptions
     * @property {RestApiController} [restApiController] instance of aws rest-api controller
     */

    /**
     * deploys rest-api changes
     * @param {String} name
     * @param {Promise<RestApi.Types.CreateFunctionRequest>} properties of rest api
     * @param {ApiGateway~DeployOptions} options
     * @param {Group} [informGroup]
     * @return {Promise<*>}
     */
    async deploy (name, properties, options, informGroup) {
        const restApi = options.apiController || new RestApi({}, this.connector, informGroup);

        //wait for all data get resolved: properties, function read by name, code package
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});

        try {
            const [params, resources] = await Promise.all([
                properties,
                options.resources
            ]);
            const rest = await restApi.findOrCreate(name, params);

            const currentResources = rest.listResources({limit: options.resourceListLimit || RESOURCE_LIST_LIMIT});

            await this.deployResources(rest, resources[resouceName], currentResources);

            return rest;
        } catch (e) {
            throw e;
        }
    }

    async deployResource(entity, name, properties) {
        let res = null;

        try {
            res = await entity.addResource(name);

        } catch (e) {
            throw e;
        }

        // Promise.all(Object.keys(options.resources).map(resouceName => {
        //
        // }));

        return res;
    }
    async deployResources(rest, resources, currentResources) {

        let transition = new Transition((left, right) => left === right.PolicyName)
            .setRemover(name => this.deletePolicy({RoleName: roleName, PolicyName: name}))
            .setAdjustor((name, policy) => this.putPolicy(Object.assign({RoleName: roleName}, policy)))
            .setCreator(policy => this.putPolicy(Object.assign({RoleName: roleName}, policy)))
            .perform(policies.PolicyNames, inlines);



        await Promise.all(Object.keys(resources).map(resouceName => {
            return this.deployResource(rest, resouceName, resources[resouceName], currentResources);
        }));

    }
}

module.exports = ApiGateway;