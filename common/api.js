/**
 * @module CommonApi
 */

const ApiBase = require('./api-base');
const Entity = require('./api-entity');

/**
 * @property {LambdaConnector} connector
 * @property {Inform} informer
 * @property {string} id
 * @property {*} properties
 */

class CommonApi extends ApiBase {
    /**
     * @constructor
     * @param {Object} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} informer
     * @param {ApiEntity} entityConstructor
     */
    constructor (properties, connector, informer, entityConstructor) {
        super({}, connector, informer, properties || {});
        this.entityConstructor = entityConstructor;
    }

    /**
     *
     * @param {Object} properties
     * @param {Object} [addProps]
     * @return {ApiEntity}
     * @protected
     */
    _createEntity (properties, addProps) {
        return Entity.createEntity(properties, this, this.entityConstructor, addProps);
    }

    /**
     * creates entity through api
     * @param {string} name
     * @param {Object} properties
     */
    create (name, properties) {
        this.properties = properties;
    }

    /**
     * gets entity data from api
     * @param {string} id
     */
    read (id) {
        this.properties = {id: id};
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    list (options) {
        return [];
    }
}

module.exports = CommonApi;