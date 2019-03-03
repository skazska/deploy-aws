const Api = require('../common/api');
const ApiGwMethodEntityAbstract = require('./method-entity-base');
const Connector = require('./connector');

class ApiGwMethodAbstract extends Api {
    /**
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     * @param entityConstructor
     */
    constructor (properties, connector, informer, entityConstructor) {
        super(properties, connector || new Connector({}), informer || null, entityConstructor);
        this.entityName = 'MethodAbstract';
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

            return this._createEntity(result, {restApiId: properties.restApiId, resourceId: properties.resourceId});
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
            return result ? this._createEntity(result, {restApiId: restApiId, resourceId: resourceId}) : null;
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
