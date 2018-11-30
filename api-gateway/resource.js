const Entity = require('../common/entity');
const Connector = require('./connector');

class ApiGwResource extends Entity {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {ApiGatewayConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (id, properties, connector, informer) {
        super(id, properties, connector || new Connector({}), informer || null);
    }

    /**
     * creates resource
     * @param {Object} properties
     */
    create (properties) {
        return this.informCall(
            this.connector.createResource, 'Create resource ' + properties.pathPart,
            properties.restApiId,
            properties.parentId,
            properties.pathPart
        );
    }


    /**
     * gets entity data from api
     * @param {string} restApiId
     * @param {string} id
     */
    read (restApiId, id) {
        return this.informCall(this.connector.getResource, 'Get resource ' + id, restApiId, id);
    }

    /**
     * gets list of entities
     * @param {Object} [options]
     * @param {String} [options.restApiId]
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    list (options) {
        if (!options) throw new Error('missing required arguments');
        return this.informCall(
            this.connector.getResources,
            'Get resources for ' + options.restApiId + ' (' + options.position + ', ' + options.limit + ')',
            options.restApiId, options.position, options.limit
        );
    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (id, properties) {

    }

    /**
     * delete entity
     * @param {string} id
     */
    delete (id) {

    }

}

module.exports = ApiGwResource;