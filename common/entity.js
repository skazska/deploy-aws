/**
 * @property {LambdaConnector} connector
 * @property {Inform} informer
 * @property {string} id
 * @property {*} properties
 */

class CommonConnectorEntity {
    /**
     * constructor
     * @param {*} id
     * @param {*} properties
     * @param {CommonAwsConnector} connector
     * @param {Inform} informer
     */
    constructor (id, properties, connector, informer) {
        this.connector = connector;
        this.id = id;
        this.properties = properties || null;
        if (informer) {
            this.informer = informer;
        }
    }

    informCall (fn, text, ...args) {
        return this.informer.wrapInformer(fn.apply(this.connector, args), {text: text});
    }

    /**
     * creates entity through api
     * @param {string} id
     * @param {Object} options
     */
    create (properties) {
        this.properties = properties;
    }

    /**
     * gets entity data from api
     * @param {string} id
     */
    read () {
        this.properties = null;
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    list (options) {
        return [];
    }

    /**
     * updates entity
     * @param id
     * @param properties
     */
    update (properties) {
        this.properties = properties;
    }

    /**
     * delete entity
     * @param {string} id
     */
    delete () {
        this.properties = null;
    }
}

module.exports = CommonConnectorEntity;