const Entity = require('../common/entity');

/**
 * @property {LambdaConnector} connector
 */
class LambdaFunction extends Entity {
    /**
     * @param {LambdaConnector} connector
     * @param {informGroup} informer
     * @param {string} id
     * @param {*} properties
     * @param {Function} packager
     */
    constructor (id, properties, connector, informer) {
        super(id, properties, connector, informer);
    }

    /**
     * creates entity through api
     * @param {Object} properties
     * @param {Boolean} [publish]
     */
    create (properties, publish) {
        return this.informCall(this.connector.createFunction, 'Create function ' + this.id, this.id,
            properties, publish);
    }

    /**
     * gets entity data from api
     * @param {string} [version]
     */
    read (version) {
        return this.informCall(this.connector.getFunctionConfiguration, 'Get config for function ' + this.id,
            this.id, version);
    }

    /**
     * gets list of entities
     * @param {Object} options
     */
    // list (options) {
    //     super.list(options);
    // }

    /**
     * updates entity
     * @param properties
     */
    update (properties) {
        return this.informCall(this.connector.updateFunctionConfiguration, 'Update config for function ' + this.id,
            this.id, properties);
    }

    /**
     * updates entity
     * @param code
     * @param {Boolean} publish
     */
    updateCode (code, publish) {
        return this.informCall(this.connector.updateFunctionCode, 'Update code for function ' + this.id, this.id,
            code, publish);
    }

    /**
     * delete entity
     * @param {string} [version]
     */
    delete (version) {
        return this.informCall(this.connector.deleteFunction, 'Delete function ' + this.id, this.id, version);
    }
}

module.exports = LambdaFunction;