const Api = require('../common/api');
const ApiGwMethodEntityAbstract = require('./method-entity-base');
const Connector = require('./connector');

class ApiGwMethodAbstract extends Api {
    /**
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     * @param entityConstructor
     */
    constructor (properties, connector, informer, entityConstructor) {
        super(properties, connector || new Connector({}), informer || null, entityConstructor);
        this.entityName = 'MethodAbstract';
    }

    /**
     * creates resource
     *
     * @param name
     * @param {Object} properties
     */
    async create (name, properties) {
        try {
            const result = await this._informCall(
                this.connector['create' + this.entityName], 'Create ' + this.entityName + ' ' + name,
                this.defaults.restApiId,
                this.defaults.resourceId,
                name,
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
    async read (httpMethod) {
        try {
            const result = await this._informCall(
                this.connector['read' + this.entityName],
                'Get ' + this.entityName + ' ' + httpMethod,
                this.defaults.restApiId,
                this.defaults.resourceId,
                httpMethod
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

    // /**
    //  * gets list of methods of resource
    //  */
    // list (options) {
    //     return this._informCall(
    //         this.connector['list' + this.entityName + 's'],
    //         'Get '+ this.entityName +' for ' + this.defaults.restApiId + ', ' + this.defaults.resourceId,
    //         this.defaults.restApiId, this.defaults.resourceId
    //     );
    // }

}

module.exports = ApiGwMethodAbstract;
