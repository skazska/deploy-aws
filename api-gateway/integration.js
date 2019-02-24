const ApiGwMethodAbstract = require('./method-base');
const ApiGwIntegrationEntity = require('./integration-entity');
const Connector = require('./connector');

class ApiGwIntegration extends ApiGwMethodAbstract {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null);
        this.entityConstructor = ApiGwIntegrationEntity;
        this.entityName = 'Integration';
    }
}

module.exports = ApiGwIntegration;
