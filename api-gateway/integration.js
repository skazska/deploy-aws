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
        super(properties, connector || new Connector({}), informer || null, ApiGwIntegrationEntity);
        // this.entityConstructor = ApiGwIntegrationEntity;
        this.entityName = 'Integration';
    }

    _createEntity (properties, addProps) {
        return ApiGwIntegrationEntity.createEntity(properties, this, this.entityConstructor, addProps);
    }

    // async create (name, properties) {
    //     return await super.create(this.defaults.httpMethod, properties);
    // }
    //
    // async read (name) {
    //     return await super.read(this.defaults.httpMethod);
    // }
}

module.exports = ApiGwIntegration;
