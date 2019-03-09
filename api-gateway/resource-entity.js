const Entity = require('../common/api-entity');
const ApiGwMethod = require('./method');

class ApiGwResourceEntity extends Entity {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'id'], defaults: options.defaults});
        this.methodApi = new ApiGwMethod({restApiId: this.id.restApiId, resourceId: this.id.id}, connector, informer);
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
        return await ApiGwResourceEntity.deleteResource(this.id, this);
    }

    /**
     * delete subresource
     * @param {string} id
     */
    async deleteResource (id) {
        return await ApiGwResourceEntity.deleteResource(id, this);
    }


    /**
     * adds resource to rest-api
     * @param pathPart
     * @return {Promise<*|void>}
     */
    async addResource(pathPart) {
        //add new
        return await this._informCall(
            properties => ApiGwResourceEntity.createResource(properties, this),
            'Add resource ' + pathPart,
            {restApiId: this.id.restApiId, parentId: this.id.id, pathPart: pathPart}
        );
    }

    /**
     * adds method to resource
     * @param {string} httpMethod
     * @param {Object} [properties]
     * @return {Promise<*|void>}
     */
    async addMethod(httpMethod, properties) {
        return await this.methodApi.create(httpMethod,properties || {});
    }

    /**
     * adds method to resource
     * @param {string} httpMethod
     * @param {Object} [properties]
     * @return {Promise<*|void>}
     */
    async deleteMethod(httpMethod) {
        return await this.methodApi.delete(httpMethod);
    }

    /**
     * creates resource (should be bound)
     * @param instance
     * @param {Object} properties
     */
    static async createResource (properties, instance) {
        try {
            const result = await instance._informCall(
                instance.connector.createResource, 'Create resource ' + properties.pathPart,
                instance.defaults.restApiId,
                properties.parentId,
                properties.pathPart
            );
            // return this.createEntity(result, instance, ApiGwResourceEntity, {restApiId: properties.restApiId});
            return this.createEntity(result, instance, ApiGwResourceEntity);
        } catch (e) {
            throw e;
        }
    }

    /**
     * TODO add tests
     * @param {} id
     * @param instance
     * @return {Promise<*>}
     */
    static async deleteResource (id, instance) {
        try {
            const result = await instance._informCall(
                instance.connector.deleteResource,
                'Delete rest-api-resource ' + id.id,
                id.restApiId,
                id.id
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

module.exports = ApiGwResourceEntity;