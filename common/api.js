const ApiBase = require('./api-base');

/**
 * @property {LambdaConnector} connector
 * @property {Inform} informer
 * @property {string} id
 * @property {*} properties
 */

class CommonApi extends ApiBase {
    /**
     * constructor
     * @param {*} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} informer
     */
    constructor (properties, connector, informer) {
        super(properties, connector, informer);
    }

    /**
     *
     * @param {Class} EntityClass
     * @param {Object} properties
     * @param {Object} options
     * @return {*}
     * @private
     */
    _createEntity (EntityClass, properties, options) {
        return properties ? new EntityClass(properties, this.connector, this.informer, options) : properties;
    }

    /**
     * creates entity through api
     * @param {Object} properties
     */
    create (properties) {
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