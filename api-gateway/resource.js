const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');
const ApiGwMethod = require('./method');

/**
 * creates resource (should be bound)
 * @param {Object} properties
 */
async function createResource (properties) {
    try {
        const result = await this._informCall(
            this.connector.createResource, 'Create resource ' + properties.pathPart,
            properties.restApiId,
            properties.parentId,
            properties.pathPart
        );
        result.restApiId = properties.restApiId;
        return result; //this._createEntity(result);
    } catch (e) {
        throw e;
    }
}


class ApiGwResourceEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'id']});
        this.methodApi = new ApiGwMethod({}, connector, informer);
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
                this.connector.deleteResource,
                'Delete rest-api-resource ' + idParam.resourceId,
                idParam.restApiId,
                idParam.id
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

    /**
     * adds resource to rest-api
     * @param pathPart
     * @return {Promise<*|void>}
     */
    async addResource(pathPart) {
        //add new
        const result = await this._informCall(
            createResource.bind(this),
            'Add resource ' + pathPart,
            {restApiId: this.id.restApiId, parentId: this.id.id, pathPart: pathPart}
        );
        return new ApiGwResourceEntity(result, this.connector, this.informer);
    }

    /**
     * TODO add tests
     * @param pathPart
     * @return {Promise<void>}
     */
    async readResource(pathPart) {
        //get root resource id
        const root = await this.resourceApi.find(this.id, '/', null, 5);
        //add new
        const result = await this._informCall(
            this.resourceApi.create.bind(this.resourceApi),
            'add resource ' + pathPart,
            {restApiId: this.id, parentId: root.id, pathPart: pathPart}
        );
        return result;
    }

    /**
     * adds method to resource
     * @param {string} httpMethod
     * @param {Object} [properties]
     * @return {Promise<*|void>}
     */
    async addMethod(httpMethod, properties) {
        //add new
        const result = await this._informCall(
            this.methodApi.create.bind(this.methodApi),
            'add method ' + httpMethod,
            Object.assign(
                {restApiId: this.id.restApiId, resourceId: this.id.id, httpMethod: httpMethod}
                , properties || {}
            )
        );
        return result;
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
        return this._createEntity(await createResource.call(this, properties));
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
     * @return {Promise<Promise<*>|*|number|BigInt|T>}
     */
    async find(restApiId, path, position, limit) {
        const options = {restApiId: restApiId, limit: limit || 25};
        let undefined;

        if (position) options.position = position;
        let result = await this.list(options);
        let resource = result.items.find(resource => resource.path === path ? resource : undefined);
        if (!result.position) return resource;
        return resource || this.find(restApiId, path, result.position, options.limit);
    }

}

module.exports = ApiGwResource;