const Entity = require('../common/api-entity');
const {ApiGwResponseEntity, ApiGwResponse} = require('./response');

class ApiGwMethodEntityAbstract extends Entity {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        // this.responseEntityConstructor = AbstractResponse;
        this.entityName = 'Abstract';
        this.responseApi = new ApiGwResponse(
            {restApiId: this.id.restApiId, resourceId: this.id.resourceId, httpMethod: this.id.httpMethod},
            connector, informer, ApiGwResponseEntity
        );
    }

    /**
     * updates entity
     * @param properties
     */
    async update (properties) {
        const ops = this._ops(properties);
        try {
            const resp = await this._informCall(
                this.connector['update' + this.entityName],
                'Update ' + this.entityName + ' ' + this.id.restApi + ', ' + this.id.resourceId + ', ' + this.id.httpMethod,
                this.id.restApiId, this.id.resourceId, this.id.httpMethod, ops);
            return this._updateEntity(resp);
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
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
    }

    async readResponse(statusCode) {
        return this.responseApi.read(statusCode);
    }

    async deleteResponse(statusCode) {
        return this.responseApi.delete(statusCode);
    }

}

module.exports = ApiGwMethodEntityAbstract;
