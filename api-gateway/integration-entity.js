const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwResponseEntity = require('./response-base');

class ApiGwIntegrationResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwIntegrationEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        this.responseEntityConstructor = ApiGwIntegrationResponseEntity;
        this.entityName = 'Integration';
    }
}

module.exports = ApiGwIntegrationEntity;
