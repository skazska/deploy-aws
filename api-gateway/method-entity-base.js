const Entity = require('../common/api-entity');
const AbstractResponse = require('./response-base');

class ApiGwMethodEntityAbstract extends Entity {

    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod'], defaults: options.defaults});
        this.responseEntityConstructor = AbstractResponse;
        this.entityName = 'Abstract';
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
        const idParam = this.id;
        try {
            const result = await this._informCall(
                this.connector['delete' + this.entityName],
                'Delete rest-api-method ' + idParam.resourceId + idParam.httpMethod,
                idParam.restApiId,
                idParam.resourceId,
                idParam.httpMethod
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
     * addsMethod's Response config
     * @param statusCode
     * @param params
     * @return {Promise<void>}
     */
    async addResponse(statusCode, params) {
        const result = await this._informCall(
            this.connector['create' + this.entityName + 'Response'],
            'Set response: ' + statusCode,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
        );
        return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    }

    async getResponse(statusCode) {
        const result = await this._informCall(
            this.connector['read' + this.entityName + 'Response'],
            'Get response: ' + statusCode,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
        );
        return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    }
}

module.exports = ApiGwMethodEntityAbstract;
