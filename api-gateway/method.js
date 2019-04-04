const ApiGwMethodAbstract = require('./method-base');
const ApiGwMethodEntity = require('./method-entity');
const Connector = require('./connector');

class ApiGwMethod extends ApiGwMethodAbstract {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null, ApiGwMethodEntity);
        // this.entityConstructor = ApiGwMethodEntity;
        this.entityName = 'Method';
    }
}

module.exports = ApiGwMethod;
