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
     * @param {Object} options
     * @param {Number} options.position
     * @param {Number} options.limit
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

    async find(name, position, limit) {
        let undefined;
        if (!limit) limit = 25;
        if (typeof position !== 'number') position = 0;
        let apis = await this.list({position: position, limit: limit});
        let api = apis.find(api => api.name === name ? api : undefined);
        if (apis.length < (limit)) return api;
        return api || this.find(name, position + limit, limit);
    }

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