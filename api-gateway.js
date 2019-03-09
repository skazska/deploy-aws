const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');
const { Transition } = require('./utils/arraysProcessor');
const ApiGwResourceEntity = require('./api-gateway/resource-entity');

const RESOURCE_LIST_LIMIT = 200;
const HTTP_METHODS = ['ANY', 'GET', 'POST', 'PUT', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];

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

    async deployMethod(res, method, current, methods) {
        return await 1;
    }

    async deployResource(entity, resource, currentResource, allResources) {
        let res = null;

        try {
            if (currentResource) {
                res = ApiGwResourceEntity.createEntity(currentResource, entity, ApiGwResourceEntity);
            } else {
                //add resource
                res = await entity.addResource(resource.pathPart, resource.awsProperties);
            }

            //deploy methods

            let curMethods = res.val('resourceMethods') || {};
            curMethods = Object.keys(curMethods).map(name => {
                return Object.assign({httpMethod: name}, curMethods[name]);
            });
            let methods = Object.keys(resource).filter(name => HTTP_METHODS.some(m => m === name))
                .map(name => { return Object.assign({httpMethod: name}, resource[name]); });

            const transition = new Transition((oldItem, newItem) => oldItem.pathPart === newItem.pathPart)
                .setRemover(oldItem => res.deleteMethod(oldItem.httpMethod))
                .setAdjustor((oldItem, newItem) => {
                    return this.deployMethod(res, newItem, oldItem, curMethods)
                })
                .setCreator(newItem => this.deployMethod(res, newItem, null, curMethods))
                .perform(curMethods, methods);

            //deploy subresources
            if (resource.resources) {
                await this.deployResources(res, resource.resources, allResources);
            }

            //thin: transition is a set of callbacks and we wait for it here even after had waited for deployResources
            return await Promise.all(Object.values(transition).map(set => Promise.all(set)));
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
            .setRemover(oldItem => {return parent.deleteResource(oldItem.id);})
            .setAdjustor((oldItem, newItem) => {
                return this.deployResource(parent, newItem, oldItem, currentResources)
            })
            .setCreator(newItem => this.deployResource(parent, newItem, null, currentResources))
            .perform(oldRes, newRes);

        return Promise.all(Object.values(transition).map(set => Promise.all(set)));
    }
}

module.exports = ApiGateway;