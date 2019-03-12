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
        // some mess here with integrationHttpMethod and httpMethod of integration, to put an integration it needed to
        // to set httpMethod to same with method (to indicate which method's this integration is), but method of
        // integration itself may differ and needs to be provided through integrationHttpMethod, meanwhile
        // integrationHttpMethod's value is returned in httpMethod from service in both put and get responses as well as
        // in embedded data of getResource/getResources
        const methodHttpMethod = instance.defaults.httpMethod || instance.properties.httpMethod;
        if (methodHttpMethod && properties.httpMethod) {
            properties.integrationHttpMethod = properties.httpMethod;
            delete properties.httpMethod;
        }
        return super.createEntity(properties, instance, constructor, defaults);
    }
}

module.exports = ApiGwIntegrationEntity;
