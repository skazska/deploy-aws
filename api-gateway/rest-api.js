const Entity = require('../common/connector/entity');

class RestApi extends Entity {
    constructor (connector, informer, id, properties) {
        super(connector, informer, id, properties)
    }
    /**
     * creates entity through api
     * @param {string} id
     * @param {Object} options
     */
    create (id, properties) {

    }

    /**
     * gets entity data from api
     * @param {string} id
     */
    read (id) {
        const params = {
            restApiId: id
        };
        return this.connector.getRestApi(params);
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    list (options) {

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