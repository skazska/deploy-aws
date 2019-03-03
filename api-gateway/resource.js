const Api = require('../common/api');
const ApiGwResourceEntity = require('./resource-entity');
const Connector = require('./connector');

class ApiGwResource extends Api {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null, ApiGwResourceEntity);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    async create (properties) {
        return ApiGwResourceEntity.createResource(properties, this);
    }


    /**
     * gets entity data from api
     * @param {string} restApiId
     * @param {string} id
     */
    async read (restApiId, id) {
        try {
            const result = await this._informCall(this.connector.readResource, 'Get resource ' + id, restApiId, id);
            return result ? this._createEntity(result, {restApiId: restApiId}) : null;
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
            this.connector.listResources,
            'Get resources for ' + options.restApiId + ' (' + options.position + ', ' + options.limit + ')',
            options.restApiId, options.position, options.limit, options
        );
    }

    /**
     * lists resources until stumble given name
     * @param restApiId
     * @param path
     * @param {String} [position]
     * @param {Number} [limit]
     * @return {Promise<*>}
     */
    async find(restApiId, path, position, limit) {
        const options = {restApiId: restApiId, limit: limit || 25};
        let undefined;

        if (position) options.position = position;
        let result = await this.list(options);
        let resource = result.items.find(resource => resource.path === path ? resource : undefined);
        if (!result.position) return this._createEntity(resource, {restApiId: restApiId});
        return this._createEntity(resource, {restApiId: restApiId}) || this.find(restApiId, path, result.position, options.limit);
    }

}

module.exports = ApiGwResource;