class CommonConnectorEntity {
    constructor (api, informer, id, properties) {
        this.api = api;
        this.informer = informer;
        this.id = id;
        this.properties = properties
    }

    /**
     * creates entity through api
     * @param {string} id
     * @param options
     */
    create (id, properties) {

    }

    /**
     * gets entity data from api
     * @param {string} id
     * @param {Object} options
     */
    read (id) {

    }


    list (options) {

    }

    update (id, properties) {

    }

    delete (id) {

    }
}

module.exports = CommonConnectorEntity;