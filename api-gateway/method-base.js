const Api = require('../common/api');
const ApiGwMethodEntityAbstract = require('./method-entity-base');
const Connector = require('./connector');

class ApiGwMethodAbstract extends Api {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null);
        this.entityConstructor = ApiGwMethodEntityAbstract;
        this.entityName = 'MethodAbstract';
    }

    _createEntity (properties) {
        return super._createEntity(this.entityConstructor, properties);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    async create (properties) {
        try {
            const result = await this._informCall(
                this.connector['create' + this.entityName], 'Create ' + this.entityName + ' ' + properties.httpMethod,
                properties.restApiId,
                properties.resourceId,
                properties.httpMethod,
                properties
            );
            result.restApiId = properties.restApiId;
            result.id = properties.resourceId;
            result.httpMethod = properties.httpMethod;

            return this._createEntity(result);
        } catch (e) {
            throw e;
        }
    }


    /**
     * gets entity data from api
     * @param {string} restApiId
     * @param resourceId
     * @param httpMethod
     */
    async read (restApiId, resourceId, httpMethod) {
        try {
            const result = await this._informCall(this.connector['read' + this.entityName],
                'Get ' + this.entityName + ' ' + httpMethod, restApiId, resourceId, httpMethod);
            return result ? this._createEntity(result) : null;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }
}

module.exports = ApiGwMethodAbstract;
