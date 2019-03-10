const ApiGwResponseEntity = require('./response-entity-base');
const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwIntegration = require('./integration');
const ApiGwResponse = require('./response-base');

class ApiGwMethodResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.entityName = 'MethodResponse';
    }
}

class ApiGwMethodResponse extends ApiGwResponse {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, ApiGwMethodResponseEntity);
        this.entityName = 'MethodResponse';
    }
}

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
        //add new
        const result = await this.integrationApi.create(this.id.httpMethod, integrationOptions);
        return result;
    }

    /**
     * gets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async readIntegration() {
        //add new
        const result = await this.integrationApi.read(this.id.httpMethod);
        return result;
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
