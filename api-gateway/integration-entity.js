const ApiGwMethodEntityAbstract = require('./method-entity-base');
const {ApiGwIntegrationResponseEntity, ApiGwIntegrationResponse} = require('./response');

class ApiGwIntegrationEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        this.responseApi = new ApiGwIntegrationResponse(
            {restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod},
            connector, informer, ApiGwIntegrationResponseEntity
        );
        this.entityName = 'Integration';
    }

    static createEntity(properties, instance, constructor, defaults) {
        if (instance.id.httpMethod) {
            properties.integrationHttpMethod = properties.httpMethod;
        }
        super.createEntity(properties, instance, constructor, defaults);
    }
}

module.exports = ApiGwIntegrationEntity;
