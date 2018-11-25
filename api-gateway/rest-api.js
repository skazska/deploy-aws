const Entity = require('../common/entity');
const Connector = require('./connector');

class RestApi extends Entity {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (id, properties, connector, informer) {
        super(id, properties, connector || new Connector({}), informer || null);
    }

    /**
     * creates rest-api
     * @param {Object} properties
     */
    create (properties) {
        return this.informCall(this.connector.createRestApi, 'Create rest-api ' + this.id, this.id, properties);
    }


    /**
     * gets entity data from api
     * @param {string} id
     */
    read (id) {
        return this.informCall(this.connector.getRestApi, 'Get rest-api ' + id, id);
    }

    /**
     * gets list of entities
     * @param {Object} [options]
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    list (options) {
        if (!options) options = {position: 0, limit: 25};
        return this.informCall(this.connector.getRestApis, 'Get rest-apis (' + options.position + ', ' + options.limit + ')',
            options.position, options.limit);
    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (id, properties) {

    }

    /**
     * delete entity
     * @param {string} id
     */
    delete (id) {

    }

    /**
     * lists restApis until stumble given name
     * @param name
     * @param {String} [position]
     * @param {Number} [limit]
     * @return {Promise<Promise<*>|*|number|BigInt|T>}
     */
    async find(name, position, limit) {
        const options = {limit: limit || 25};
        let undefined;

        if (position) options.position = position;
        let result = await this.list(options);
        let api = result.items.find(api => api.name === name ? api : undefined);
        if (!result.position) return api;
        return api || this.find(name, result.position, options.limit);
    }

    /**
     * searches restApi for given name, if not found - creates
     * @param {String} name
     * @param {Promise<Object>} properties
     * @return {Promise<*>}
     */
    async findOrCreate(name, properties) {
        let api = null;
        let params = null;

        try {
            [api, params] = await Promise.all([
                this.find(name),
                properties
            ]);
        } catch (e) {
            throw e;
        }

        if (!api) {
            return this.create(params);
        } else {
            return api;
        }
    }
}

module.exports = RestApi;