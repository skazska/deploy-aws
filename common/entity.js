class CommonConnectorEntity {
    constructor (connector, informer, id, properties) {
        this.connector = connector;
        this.informer = informer;
        this.id = id;
        this.properties = properties
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

module.exports = CommonConnectorEntity;