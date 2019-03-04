const Entity = require('../common/api-entity');
const ApiGwMethod = require('./method');

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
        return await ApiGwResourceEntity.removeResource(this.id, this);
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
     * TODO add tests
     * @param pathPart
     * @return {Promise<void>}
     */
    // async readResource(pathPart) {
    //     //add new
    //     const result = await this._informCall(
    //         this.resourceApi.read.bind(this.resourceApi),
    //         'read resource ' + pathPart,
    //         {restApiId: this.id.restApiId, parentId: this.id.id, pathPart: pathPart}
    //     );
    //     return result;
    // }

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

    /**
     * creates resource (should be bound)
     * @param instance
     * @param {Object} properties
     */
    static async createResource (properties, instance) {
        try {
            const result = await instance._informCall(
                instance.connector.createResource, 'Create resource ' + properties.pathPart,
                properties.restApiId,
                properties.parentId,
                properties.pathPart
            );
            return this.createEntity(result, instance, ApiGwResourceEntity, {restApiId: properties.restApiId});
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
    static async removeResource (id, instance) {
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