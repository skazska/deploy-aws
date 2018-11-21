const Entity = require('../common/entity');
const Connector = require('./connector');
const preparePackage = require('../utils/fs').preparePackage;

/**
 * @property {LambdaConnector} connector
 */
class LambdaFunction extends Entity {
    /**
     * @param {string} id
     * @param {*} properties
     * @param {LambdaConnector} [connector]
     * @param {informGroup} [informer]
     */
    constructor (id, properties, connector, informer) {
        super(id, properties, connector || new Connector({}), informer || null);
    }

    /**
     * creates entity through api
     * @param {Object} properties
     * @param {Object} [options]
     * @param {boolean} [options.publish]
     * @param {string} [options.wd]
     * @param {string[]} [options.codeEntries]
     * @param {Function} [options.packager]
     */
    async create (properties, options) {
        if (!options) options = {};
        if (options.wd) {
            let code = await (options.packager || preparePackage)(options.wd, options.codeEntries);
            properties.Code = {ZipFile: code};
        }
        return this.informCall(this.connector.createFunction, 'Create function ' + this.id, this.id,
            properties, options.publish);
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