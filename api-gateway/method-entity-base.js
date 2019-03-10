const Entity = require('../common/api-entity');
const AbstractResponseEntity = require('./response-entity-base');
const AbstractResponseApi = require('./response-base');

class ApiGwMethodEntityAbstract extends Entity {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        // this.responseEntityConstructor = AbstractResponse;
        this.entityName = 'Abstract';
        this.responseApi = new AbstractResponseApi(
            {restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod},
            connector, informer, AbstractResponseEntity
        );
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
    // async delete () {
    //     const idParam = this.id;
    //     try {
    //         const result = await this._informCall(
    //             this.connector['delete' + this.entityName],
    //             'Delete rest-api-method ' + idParam.resourceId + idParam.httpMethod,
    //             idParam.restApiId,
    //             idParam.resourceId,
    //             idParam.httpMethod
    //         );
    //         return result;
    //     } catch (e) {
    //         if (e.code === 'ResourceNotFoundException') {
    //             return null;
    //         } else {
    //             throw e;
    //         }
    //     }
    // }

    /**
     * addsMethod's Response config
     * @param statusCode
     * @param params
     * @return {Promise<void>}
     */
    async addResponse(statusCode, params) {
        return this.responseApi.create(statusCode, params);
        // const result = await this._informCall(
        //     this.connector['create' + this.entityName + 'Response'],
        //     'Set response: ' + statusCode,
        //     //FIXME not sure of this, but actually it does not allow to add IntegrationResponse with integration's httpMethod
        //     // this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
        //     this.id.restApiId, this.id.resourceId, this.defaults.httpMethod || this.properties.httpMethod, statusCode, params
        // );
        // return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    }

    async readResponse(statusCode) {
        return this.responseApi.read(statusCode);
        // const result = await this._informCall(
        //     this.connector['read' + this.entityName + 'Response'],
        //     'Get response: ' + statusCode,
        //     this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
        // );
        // return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    }

    async deleteResponse(statusCode) {
        return this.responseApi.delete(statusCode);
        // const result = await this._informCall(
        //     this.connector['delete' + this.entityName + 'Response'],
        //     'delete response: ' + statusCode,
        //     this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
        // );
        // return result;
    }

}

module.exports = ApiGwMethodEntityAbstract;
