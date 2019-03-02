const Entity = require('../common/api-entity');
const AbstractResponse = require('./response-base');

class ApiGwMethodEntityAbstract extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
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
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        // result.statusCode = statusCode;
        return new this.responseEntityConstructor(result, this.connector, this.informer);
    }

    async getResponse(statusCode) {
        const result = await this._informCall(
            this.connector['read' + this.entityName + 'Response'],
            'Get response: ' + statusCode,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        // result.statusCode = statusCode;
        return new this.responseEntityConstructor(result, this.connector, this.informer);
    }
}

module.exports = ApiGwMethodEntityAbstract;
