const Api = require('../common/api');
const Entity = require('../common/api-entity');
const Connector = require('./connector');

class ApiGwResponseEntity extends Entity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod', 'statusCode']});
        this.entityName = 'AbstractResponse'
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
                'Delete ' + this.entityName + idParam.resourceId + idParam.httpMethod + idParam.statusCode,
                idParam.restApiId,
                idParam.resourceId,
                idParam.httpMethod,
                idParam.statusCode
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

class ApiGwMethodResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer);
        this.entityName = 'MethodResponse';
    }
}

class ApiGwIntegrationResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer) {
        super(properties, connector, informer);
        this.entityName = 'IntegrationResponse';
    }
}


class ApiGwIntegrationEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
    }

    /**
     * adds Integration's Response config
     * @param statusCode
     * @param params
     * @return {Promise<void>}
     */
    async addResponse(statusCode, params) {
        const result = await this._informCall(
            this.connector.createIntegrationResponse,
            'Set response: ' + params.statusCode,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        // result.statusCode = statusCode;
        return new ApiGwIntegrationResponseEntity(result, this.connector, this.informer);
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
                this.connector.deleteIntegration,
                'Delete integration ' + idParam.resourceId + idParam.httpMethod,
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
}

class ApiGwMethodEntity extends Entity {

    constructor (properties, connector, informer) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod']});
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
                this.connector.deleteMethod,
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
            this.connector.createMethodResponse,
            'Set response: ' + params.statusCode,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        // result.statusCode = statusCode;
        return new ApiGwMethodResponseEntity(result, this.connector, this.informer);
    }

    /**
     * sets integration
     * @param integrationOptions
     * @return {Promise<*|void>}
     */
    async addIntegration(integrationOptions) {
        //add new
        const result = await this._informCall(
            this.connector.createIntegration,
            'Set integration: type ' + integrationOptions.type + ', uri ' + integrationOptions.uri,
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, integrationOptions
        );
        result.restApiId = this.id.restApiId;
        result.resourceId = this.id.resourceId;
        result.httpMethod = this.id.httpMethod;
        return new ApiGwIntegrationEntity(result, this.connector, this.informer);
    }

    /**
     * tests method invocation
     * @param params
     * @return {Promise<*|void>}
     */
    async test(params) {
        //add new
        return await this._informCall(
            this.connector.testMethod,
            'testMethodInvocation',
            this.id.restApiId, this.id.resourceId, this.id.httpMethod, params
        );
    }


}

class ApiGwMethod extends Api {
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
        return super._createEntity(ApiGwMethodEntity, properties);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    async create (properties) {
        try {
            const result = await this._informCall(
                this.connector.createMethod, 'Create method ' + properties.httpMethod,
                properties.restApiId,
                properties.resourceId,
                properties.httpMethod,
                properties
            );
            result.restApiId = properties.restApiId;
            result.id = properties.resourceId;
            result.httpMethod = properties.httpMethod;

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
    async read (restApiId, resourceId, httpMethod) {
        try {
            const result = await this._informCall(this.connector.getMethod, 'Get method ' + httpMethod, restApiId, resourceId, httpMethod);
            return result ? this._createEntity(result) : null;
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }
}

module.exports = ApiGwMethod;
