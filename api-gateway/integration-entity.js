const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwResponseEntity = require('./response-entity-base');
const ApiGwResponse = require('./response-base');

class ApiGwIntegrationResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwIntegrationResponse extends ApiGwResponse {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, ApiGwIntegrationResponseEntity);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwIntegrationEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        this.responseApi = new ApiGwIntegrationResponse(
            {restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod},
            connector, informer, ApiGwIntegrationResponseEntity
        );
        this.entityName = 'Integration';
    }
}

module.exports = ApiGwIntegrationEntity;
