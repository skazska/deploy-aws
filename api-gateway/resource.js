const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');

class ApiGwResourceEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId']});
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
    delete () {
        const idParam = this.id;
        return this._informCall(
            this.connector.deleteResource,
            'Delete rest-api-resource ' + idParam.resourceId,
            idParam.restApiId,
            idParam.resourceId
        );
    }
}

class ApiGwResource extends Api {
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
        return super._createEntity(ApiGwResourceEntity, properties);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    async create (properties) {
        try {
            const result = await this._informCall(
                this.connector.createResource, 'Create resource ' + properties.pathPart,
                properties.restApiId,
                properties.parentId,
                properties.pathPart
            );
            return this._createEntity(result);
        } catch (e) {
            throw e;
        }
    }


    /**
     * gets entity data from api
     * @param {string} restApiId
     * @param {string} id
     */
    async read (restApiId, id) {
        try {
            const result = await this._informCall(this.connector.getResource, 'Get resource ' + id, restApiId, id);
            return result ? this._createEntity(result) : null;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }

    /**
     * gets list of entities
     * @param {Object} [options]
     * @param {String} [options.restApiId]
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    list (options) {
        if (!options) throw new Error('missing required arguments');
        return this._informCall(
            this.connector.getResources,
            'Get resources for ' + options.restApiId + ' (' + options.position + ', ' + options.limit + ')',
            options.restApiId, options.position, options.limit
        );
    }
}

module.exports = ApiGwResource;