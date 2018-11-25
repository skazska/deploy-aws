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
     * creates restore
     * @param {Object} properties
     */
    create (properties) {
        return this.informCall(this.connector.createResource, 'Create restore ' + this.id, this.id, properties);
    }


    /**
     * gets entity data from api
     * @param {string} id
     */
    read (id) {
        return this.informCall(this.connector.getRestApi, 'Get restore ' + id, id);
    }

    /**
     * gets list of entities
     * @param {Object} [options]
     * @param {String} [options.position]
     * @param {Number} [options.limit]
     */
    list (options) {
        if (!options) options = {position: 0, limit: 25};
        return this.informCall(this.connector.getRestApis, 'Get restores (' + options.position + ', ' + options.limit + ')',
            options.position, options.limit);
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