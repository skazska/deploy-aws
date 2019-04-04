const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwIntegration = require('./integration');
const {ApiGwMethodResponseEntity, ApiGwMethodResponse} = require('./response');

class ApiGwMethodEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.integrationApi = new ApiGwIntegration({restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod}, connector, informer);
        this.responseApi = new ApiGwMethodResponse(
            {restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod},
            connector, informer, ApiGwMethodResponseEntity
        );
        this.entityName = 'Method';
    }

    /**
     * sets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async addIntegration(integrationOptions) {
        return await this.integrationApi.create(this.id.httpMethod, integrationOptions);
    }

    /**
     * gets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async readIntegration() {
        return await this.integrationApi.read(this.id.httpMethod);
    }

    /**
     * tests method invocation
     * @param params
     * @return {Promise<*|void>}
     */
    async test(params) {
        //add new
        return await this._informCall(
            this.connector.testMethod,
            'testMethodInvocation',
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, params
        );
    }


}

module.exports = ApiGwMethodEntity;
