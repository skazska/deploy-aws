const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');

class ApiGwMethodEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (properties) {

    }

    /**
     * delete entity
     * @param {string} id
     */
    async delete () {
        const idParam = this.id;
        try {
            const result = await this._informCall(
                this.connector.deleteMethod,
                'Delete rest-api-method ' + idParam.resourceId + idParam.httpMethod,
                idParam.restApiId,
                idParam.resourceId,
                idParam.httpMethod
            );
            return result;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }
}

class ApiGwMethod extends Api {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null);
    }

    _createEntity (properties) {
        return super._createEntity(ApiGwMethodEntity, properties);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    async create (properties) {
        try {
            const result = await this._informCall(
                this.connector.createMethod, 'Create method ' + properties.httpMethod,
                properties.restApiId,
                properties.resourceId,
                properties.httpMethod
            );
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
            const result = await this._informCall(this.connector.getMethod, 'Get method ' + httpMethod, restApiId, resourceId, httpMethod);
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

module.exports = ApiGwMethod;