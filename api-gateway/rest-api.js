const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');
const ApiGwResource = require('./resource');

class RestApiEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: 'id'});
        this.resourceApi = new ApiGwResource({}, connector, informer);
    }

    /**
     * updates entity
     * @param properties
     */
    update (properties) {

    }

    /**
     * delete entity
     */
    async delete () {
        try {
            const resp = await this._informCall(this.connector.deleteRestApi, 'Delete rest-api ' + this.id, this.id);
            return resp;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }

    /**
     * @return {Promise<ApiGwResourceEntity>}
     */
    async readRoot() {
        //get root resource id
        return await this.resourceApi.find(this.id, '/', null, 5);
    }

    /**
     * TODO add tests
     * @param params
     * @return {Promise<void>}
     */
    async listResources(params) {
        //add new
        const result = await this._informCall(
            this.resourceApi.list.bind(this.resourceApi),
            'list resources',
            Object.assign({restApiId: this.id}, params || {})
        );
        return result;
    }

    /**
     *
     * @param {Object} properties
     * @param instance
     * @param restApiId
     * @return {*}
     */
    static createEntity (properties, instance) {
        return super.createEntity(properties, instance, this);
    }
}

class RestApi extends Api {
    /**
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (properties, connector, informer) {
        super(properties, connector || new Connector({}), informer || null, RestApiEntity);
    }

    /**
     * creates rest-api
     * @param {Object} properties
     */
    async create (properties) {
        try {
            const resp = await this._informCall(
                this.connector.createRestApi,
                'Create rest-api ' + properties.name,
                properties);

            return this._createEntity(resp);
        } catch (e) {
            throw e;
        }
    }


    /**
     * gets entity data from api
     * @param {string} id
     */
    async read (id) {
        try {
            const resp = await this._informCall(this.connector.readRestApi, 'Get rest-api ' + id, id);
            return this._createEntity(resp);
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
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    list (options) {
        if (!options) options = {position: 0, limit: 25};
        return this._informCall(this.connector.listRestApis, 'Get rest-apis (' + options.position + ', ' + options.limit + ')',
            options.position, options.limit);
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
     * @return {Promise<RestApiEntity>}
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
            return await this.create(params);
        } else {
            return await this._createEntity(api);
        }
    }
}

module.exports = RestApi;