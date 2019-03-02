const ApiGwResponseEntity = require('./response-base');
const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwIntegrationEntity = require('./integration-entity');

class ApiGwMethodResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer);
        this.entityName = 'MethodResponse';
    }
}

class ApiGwMethodEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
        this.responseEntityConstructor = ApiGwMethodResponseEntity;
        this.entityName = 'Method';
    }

    /**
     * sets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async addIntegration(integrationOptions) {
        //add new
        const result = await this._informCall(
            this.connector.createIntegration,
            'Set integration: type ' + integrationOptions.type + ', uri ' + integrationOptions.uri,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, integrationOptions
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        return new ApiGwIntegrationEntity(result, this.connector, this.informer);
    }

    /**
     * gets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async readIntegration() {
        //add new
        const result = await this._informCall(
            this.connector.readIntegration,
            'Set integration',
            this.id.restApiId, this.id.resourceId, this.id.httpMethod
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        return new ApiGwIntegrationEntity(result, this.connector, this.informer);
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
