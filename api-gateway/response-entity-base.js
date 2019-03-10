const Entity = require('../common/api-entity');

class ApiGwResponseEntityAbstract extends Entity {
    constructor (properties, connector, informer, options) {
        super(properties, connector, informer, {idProperty: ['restApiId', 'resourceId', 'httpMethod', 'statusCode'], defaults: options.defaults});
        this.entityName = 'AbstractEntity'
    }

    // async updateResponse(statusCode, params) {
    //     const result = await this._informCall(
    //         this.connector['update' + this.entityName + 'Response'],
    //         'Set response: ' + statusCode,
    //         //FIXME not sure of this, but actually it does not allow to add IntegrationResponse with integration's httpMethod
    //         // this.id.restApiId, this.id.resourceId, this.id.httpMethod, statusCode, params
    //         this.id.restApiId, this.id.resourceId, this.defaults.httpMethod || this.properties.httpMethod, statusCode, params
    //     );
    //     return this.constructor.createEntity(result, this, this.responseEntityConstructor, {httpMethod: this.id.httpMethod});
    // }

    /**
     * updates entity
     * @param properties
     */
    update (properties) {

    }

}

module.exports = ApiGwResponseEntityAbstract;
