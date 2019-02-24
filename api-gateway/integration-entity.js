const ApiGwMethodEntityAbstract = require('./method-entity-base');
const ApiGwResponseEntity = require('./response-base');

class ApiGwIntegrationResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwIntegrationEntity extends ApiGwMethodEntityAbstract {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
        this.responseEntityConstructor = ApiGwIntegrationResponseEntity;
        this.entityName = 'Integration';
    }
}

module.exports = ApiGwIntegrationEntity;
