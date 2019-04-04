const Api = require('../common/api');
const Connector = require('./connector');
const Entity = require('../common/api-entity');

/**
 * ApiGwResponseEntity
 */
class ApiGwResponseEntity extends Entity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod', 'statusCode'], defaults: options.defaults});
        this.entityName = 'AbstractEntity'
    }

    /**
     * updates entity
     * @param properties
     */
    async update (properties) {
        const ops = this._ops(properties);
        try {
            if (!ops.length) return this;

            const resp = await this._informCall(
                this.connector['update' + this.entityName],
                'Update ' + this.entityName + ' ' + this.id.restApiId + ', ' + this.id.resourceId + ', ' + this.id.httpMethod + ', ' + this.id.statusCode,
                this.id.restApiId, this.id.resourceId, this.id.httpMethod, this.id.statusCode, ops);
            return this._updateEntity(resp);
        } catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return null;
            } else {
                throw e;
            }
        }
    }
}


/**
 * ApiGwResponse
 */
class ApiGwResponse extends Api {
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

class ApiGwIntegrationResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwIntegrationResponse extends ApiGwResponse {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, ApiGwIntegrationResponseEntity);
        this.entityName = 'IntegrationResponse';
    }
}

class ApiGwMethodResponseEntity extends ApiGwResponseEntity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, options);
        this.entityName = 'MethodResponse';
    }
}

class ApiGwMethodResponse extends ApiGwResponse {
    constructor (properties, connector, informer) {
        super(properties, connector, informer, ApiGwMethodResponseEntity);
        this.entityName = 'MethodResponse';
    }
}

module.exports = {
    ApiGwResponse: ApiGwResponse,
    ApiGwResponseEntity: ApiGwResponseEntity,
    ApiGwMethodResponse: ApiGwMethodResponse,
    ApiGwMethodResponseEntity: ApiGwMethodResponseEntity,
    ApiGwIntegrationResponse: ApiGwIntegrationResponse,
    ApiGwIntegrationResponseEntity: ApiGwIntegrationResponseEntity
};