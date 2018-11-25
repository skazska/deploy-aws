const Connector = require('./api-gateway/connector');
const RestApi = require('./api-gateway/rest-api');

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
     * @param {Group} informGroup
     * @return {Promise<*>}
     */
    async deploy (name, properties, options, informGroup) {
        let api = null;

        const restApi = new ApiGateway(id, {}, this.connector, informGroup);

        //wait for all data get resolved: properties, function read by name, code package
        informGroup.addInformer(properties, {text: 'Waiting dependencies to complete'});

        try {
            if (properties.restApiId) {
                api = await restApi.read(properties.restApiId);
            } else {
                api = await restApi.findOrCreate(name, properties);
            }
        } catch (e) {
            throw e;
        }

        return Promise.all(Object.keys(options.resources).map(resouceName => {

        }));
    }
}

module.exports = ApiGateway;