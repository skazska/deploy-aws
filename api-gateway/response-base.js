const Api = require('../common/api');
const Connector = require('./connector');

class ApiGwResponseAbstract extends Api {
    /**
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     * @param entityConstructor
     */
    constructor (properties, connector, informer, entityConstructor) {
        super(properties, connector || new Connector({}), informer || null, entityConstructor);
        this.entityName = 'ResponseAbstract';
    }

    // /**
    //  * addsMethod's Response config
    //  * @param statusCode
    //  * @param params
    //  * @return {Promise<void>}
    //  */
    // async addResponse(statusCode, params) {
    //     const result = await this._informCall(
    //         this.connector['create' + this.entityName + 'Response'],
    //         'Set response: ' + statusCode,
    //         //FIXME not sure of this, but actually it does not allow to add IntegrationResponse with integration's httpMethod
    //         // this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
    //         this.id.restApiId, this.id.resourceId, this.defaults.httpMethod || this.properties.httpMethod, statusCode, params
    //     );
    //     return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    // }
    //
    // async updateResponse(statusCode, params) {
    //     // const response = this.properties.
    //     const result = await this._informCall(
    //         this.connector['update' + this.entityName + 'Response'],
    //         'Set response: ' + statusCode,
    //         //FIXME not sure of this, but actually it does not allow to add IntegrationResponse with integration's httpMethod
    //         // this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
    //         this.id.restApiId, this.id.resourceId, this.defaults.httpMethod || this.properties.httpMethod, statusCode, params
    //     );
    //     return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    // }
    //
    // async readResponse(statusCode) {
    //     const result = await this._informCall(
    //         this.connector['read' + this.entityName + 'Response'],
    //         'Get response: ' + statusCode,
    //         this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
    //     );
    //     return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    // }
    //
    // async deleteResponse(statusCode) {
    //     const result = await this._informCall(
    //         this.connector['delete' + this.entityName + 'Response'],
    //         'delete response: ' + statusCode,
    //         this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
    //     );
    //     return result;
    // }


    /**
     * creates resource
     *
     * @param name
     * @param {Object} properties
     */
    async create (code, properties) {
        try {
            const result = await this._informCall(
                this.connector['create' + this.entityName], 'Create ' + this.entityName + ' ' + code,
                this.defaults.restApiId,
                this.defaults.resourceId,
                this.defaults.httpMethod,
                code,
                properties
            );

            return this._createEntity(result);
        } catch (e) {
            throw e;
        }
    }


    /**
     * gets entity data from api
     * @param {string} restApiId
     * @param resourceId
     * @param httpMethod
     */
    async read (code) {
        try {
            const result = await this._informCall(
                this.connector['read' + this.entityName],
                'Get ' + this.entityName + ' ' + code,
                this.defaults.restApiId,
                this.defaults.resourceId,
                this.defaults.httpMethod,
                code
            );
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
     * gets list of methods of resource
     */
    delete (code) {
        return this._informCall(
            this.connector['delete' + this.entityName],
            'Delete '+ this.entityName +' for ' + this.defaults.restApiId + ', ' + this.defaults.resourceId + ', ' + code,
            this.defaults.restApiId, this.defaults.resourceId, this.defaults.httpMethod, code
        );
    }

}

module.exports = ApiGwResponseAbstract;
