const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');
const { Transition } = require('./utils/arraysProcessor');


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

            const [currentResources, root] = await Promise.all([
                rest.listResources({limit: options.resourceListLimit || RESOURCE_LIST_LIMIT}),
                rest.readRoot()
            ]);

            await this.deployResources(root, resources, currentResources.items);

            return rest;
        } catch (e) {
            throw e;
        }
    }

    async deployResource(entity, resource, currentResources) {
        let res = null;

        try {
            res = await entity.addResource(resource.pathPart);

            if (resource.resources) {
                await this.deployResources(res, resource.resources, currentResources);
            }

            return res;
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {ApiGwResourceEntity} parent
     * @param {[]} resources
     * @param currentResources
     * @return {Promise<[*]>}
     */
    deployResources(parent, resources, currentResources) {
        const newRes = Object.keys(resources).map(key => {
            resources[key].pathPart = key; return resources[key];
        });
        const oldRes = currentResources.filter(res => res.parentId === parent.id.id);

        const transition = new Transition((oldItem, newItem) => oldItem.pathPart === newItem.pathPart)
            .setRemover(oldItem => parent.removeResource(oldItem.pathPart))
            .setCreator(newItem => this.deployResource(parent, newItem, currentResources))
            .perform(oldRes, newRes);

        return Promise.all(Object.values(transition).map(set => Promise.all(set)));
    }
}

module.exports = ApiGateway;